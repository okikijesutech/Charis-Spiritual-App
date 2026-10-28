/**
 * Benign Security Simulation Script for Charis SIEM Portfolio
 * Safely tests detection rules and generates real-world SOC alerts in Wazuh.
 * Usage: node scripts/simulate-attacks.mjs [target_url]
 */

const TARGET = process.argv[2] || 'https://charis-six.vercel.app';

console.log(`=======================================================`);
console.log(`🎯 Charis SIEM Attack Simulation Tool`);
console.log(`📡 Target Application: ${TARGET}`);
console.log(`🛡️  Purpose: Generating safe events for Wazuh SIEM detection`);
console.log(`=======================================================\n`);

async function sendRequest(label, path, options = {}) {
  const url = `${TARGET}${path}`;
  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': options.userAgent || 'Charis-DevSecOps-Simulation-Agent/1.0',
        ...options.headers,
      },
    });
    console.log(`  [${res.status}] ${label} -> ${path}`);
    return res.status;
  } catch (err) {
    console.error(`  [ERR] ${label} -> ${err.message}`);
    return 0;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSimulation() {
  // 1. Normal Baseline Traffic
  console.log(`--- [Step 1: Establishing Legitimate Baseline Traffic] ---`);
  await sendRequest('Legitimate Home View', '/');
  await sendRequest('Legitimate PWA Manifest', '/manifest.webmanifest');
  await sleep(1000);

  // 2. Scenario A: Sensitive File / Credential Probing (MITRE T1083 / T1552.001)
  console.log(`\n--- [Step 2: Simulating Sensitive Environment File Probing] ---`);
  await sendRequest('Probe for Root .env', '/.env');
  await sendRequest('Probe for Git Configuration', '/.git/config');
  await sendRequest('Probe for WordPress Config', '/wp-config.php');
  await sleep(1000);

  // 3. Scenario B: Automated Vulnerability Scanner User-Agents (MITRE T1595.002)
  console.log(`\n--- [Step 3: Simulating Known Security Scanner User-Agents] ---`);
  await sendRequest('Scanner User-Agent: Nikto', '/', {
    userAgent: 'Mozilla/5.0 (compatible; Nikto/2.1.6; Open Source Web Scanner)',
  });
  await sendRequest('Scanner User-Agent: SQLMap', '/?id=1', {
    userAgent: 'sqlmap/1.7.2#stable (https://sqlmap.org)',
  });
  await sleep(1000);

  // 4. Scenario C: Cross-Site Scripting (XSS) Query Injection (MITRE T1190)
  console.log(`\n--- [Step 4: Simulating XSS / Client Injection Probing] ---`);
  await sendRequest('XSS Script Tag in Query', '/?q=%3Cscript%3Ealert(%27charis-security-test%27)%3C/script%3E');
  await sendRequest('XSS Event Handler in Query', '/?search=test%22+onload%3D%22alert(1)');
  await sleep(1000);

  // 5. Scenario D: Path Traversal Probing (MITRE T1083)
  console.log(`\n--- [Step 5: Simulating Directory Traversal Probing] ---`);
  await sendRequest('Path Traversal Probe', '/../../../../etc/passwd');
  await sendRequest('Windows INI Traversal Probe', '/..%2f..%2fwindows%2fwin.ini');
  await sleep(1000);

  // 6. Scenario E: High-Frequency Directory Discovery (Burst 404s)
  console.log(`\n--- [Step 6: Simulating Rapid Content Discovery / Fuzzing] ---`);
  const fuzzPaths = [
    '/admin',
    '/login.php',
    '/api/v1/debug',
    '/dashboard/admin',
    '/backup.zip',
    '/database.sql',
    '/server-status',
    '/phpmyadmin',
    '/internal/metrics',
  ];
  for (const p of fuzzPaths) {
    await sendRequest('Directory Discovery Probe', p);
    await sleep(150); // Rapid sequence
  }

  console.log(`\n=======================================================`);
  console.log(`✅ Simulation Completed Successfully!`);
  console.log(`🔍 Check your Wazuh SIEM Dashboard (https://localhost:5601)`);
  console.log(`   Navigate to: Security Events -> Charis Edge Stream`);
  console.log(`=======================================================`);
}

runSimulation();
