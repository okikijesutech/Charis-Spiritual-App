/**
 * Vercel Log Drain Webhook Receiver & SIEM Forwarder
 * Receives edge security logs from Vercel, normalizes them, and streams to Wazuh SIEM.
 * Part of Charis Cybersecurity SOC Portfolio Architecture.
 */

import http from 'node:http';
import dgram from 'node:dgram';

const PORT = Number(process.env.RECEIVER_PORT || 8080);
const WAZUH_SYSLOG_HOST = process.env.WAZUH_HOST || '127.0.0.1';
const WAZUH_SYSLOG_PORT = Number(process.env.WAZUH_PORT || 514);
const DRAIN_SECRET = process.env.VERCEL_DRAIN_SECRET || '';

const udpClient = dgram.createSocket('udp4');

/**
 * Forward normalized security event string to Wazuh over Syslog UDP (port 514)
 */
function forwardToWazuh(eventString) {
  const message = Buffer.from(`<14>${new Date().toISOString()} charis-edge: ${eventString}`);
  udpClient.send(message, 0, message.length, WAZUH_SYSLOG_PORT, WAZUH_SYSLOG_HOST, (err) => {
    if (err) {
      console.error('[SIEM Forwarder Error]', err.message);
    }
  });
}

/**
 * Normalize Vercel edge log item into standardized key-value syslog format for Wazuh
 */
function normalizeVercelLog(item) {
  // Edge HTTP proxy request
  const clientIp = item.proxy?.clientIp || item.clientIp || '127.0.0.1';
  const method = item.proxy?.method || item.method || 'GET';
  const path = item.proxy?.path || item.path || '/';
  const status = item.proxy?.statusCode || item.statusCode || 200;
  const userAgent = (item.proxy?.userAgent || item.userAgent || 'unknown').replace(/"/g, "'");
  const host = item.proxy?.host || item.host || 'charis-six.vercel.app';
  const region = item.proxy?.region || 'global';
  const durationMs = item.proxy?.duration || 0;

  return `VERCEL_SECURITY_EVENT srcip="${clientIp}" method="${method}" path="${path}" status="${status}" user_agent="${userAgent}" host="${host}" region="${region}" duration_ms="${durationMs}"`;
}

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'charis-siem-drain-receiver' }));
    return;
  }

  // Vercel Log Drain Webhook endpoint
  if (req.method === 'POST' && (req.url === '/api/drain' || req.url === '/')) {
    // Optional secret verification header if configured in Vercel
    if (DRAIN_SECRET && req.headers['x-vercel-verify'] !== DRAIN_SECRET) {
      console.warn('[SIEM Receiver] Unauthorized log drain attempt rejected');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Unauthorized');
      return;
    }

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
      // Protection against oversized payloads (> 5MB)
      if (rawBody.length > 5 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'text/plain' });
        res.end('Payload Too Large');
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        let events = [];
        const trimmed = rawBody.trim();

        if (trimmed.startsWith('[')) {
          // Standard JSON array
          events = JSON.parse(trimmed);
        } else if (trimmed.includes('\n')) {
          // NDJSON format (one JSON per line)
          events = trimmed
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line) => JSON.parse(line));
        } else if (trimmed.startsWith('{')) {
          events = [JSON.parse(trimmed)];
        }

        let forwardedCount = 0;
        for (const ev of events) {
          const normalized = normalizeVercelLog(ev);
          forwardToWazuh(normalized);
          forwardedCount++;
        }

        console.log(`[SIEM Receiver] Ingested and forwarded ${forwardedCount} edge event(s) to Wazuh.`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', forwarded: forwardedCount }));
      } catch (parseError) {
        console.error('[SIEM Receiver JSON Parse Error]', parseError.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  Charis Vercel Log Drain SIEM Receiver active`);
  console.log(`📡 Listening for Vercel Drain: http://0.0.0.0:${PORT}/api/drain`);
  console.log(`🎯 Forwarding Syslog events to Wazuh: ${WAZUH_SYSLOG_HOST}:${WAZUH_SYSLOG_PORT}`);
  console.log(`=======================================================`);
});
