# Cloud-Native SIEM/XDR Security Operations: Defending Serverless Applications with Vercel & Wazuh

**Author:** Cybersecurity Portfolio Project  
**Target Roles:** SOC Analyst Tier 1/2 · Cloud Security Engineer · Detection Engineer  
**Target Application:** [Charis Spiritual Discipline PWA](https://charis-six.vercel.app/)  
**GitHub Repository:** [github.com/okikijesutech/Charis-Spiritual-App](https://github.com/okikijesutech/Charis-Spiritual-App)

---

## 1. Executive Summary

Modern serverless and Jamstack architectures offload server infrastructure to edge networks, but introducing edge hosting also shifts the attack surface. Without centralized visibility, security teams cannot detect automated scanners, credential probes, or distributed denial-of-service attempts.

This project designs and implements an **enterprise-grade, open-source Cloud SIEM & XDR pipeline** protecting a live, production Progressive Web Application deployed on Vercel's global edge network.

By engineering a real-time log ingestion pipeline connecting **Vercel Log Drains** to **Wazuh SIEM & XDR (OpenSearch)**, this project demonstrates end-to-end security operations:
* Automated telemetry normalization and ingestion.
* Custom detection engineering mapped directly to the **MITRE ATT&CK® Enterprise Matrix**.
* Benign adversary simulation and SOC alert verification.
* Standard Operating Procedures (SOP) for incident triage and response.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────┐
│   Adversary / Threat Actor     │
│   (Recon, Fuzzing, Probes)     │
└───────────────┬────────────────┘
                │ HTTPS Requests
                ▼
┌────────────────────────────────┐
│      Vercel Edge Network       │  ◄── Hardened Headers (CSP, HSTS, DENY)
│   (charis-six.vercel.app)      │  ◄── Edge WAF & Firewall
└───────────────┬────────────────┘
                │ Real-Time HTTPS Log Drain (NDJSON)
                ▼
┌────────────────────────────────┐
│  Vercel Webhook SIEM Receiver  │  ◄── HMAC Signature Verification
│  (security/siem/vercel-receiver)│ ◄── Key-Value Normalization
└───────────────┬────────────────┘
                │ RFC 5424 Syslog (UDP 514)
                ▼
┌────────────────────────────────────────────────────────┐
│                   Wazuh SIEM & XDR                     │
│  ┌──────────────────┐           ┌───────────────────┐  │
│  │ Custom Decoders  │ ────────► │  Detection Rules  │  │
│  │ (vercel-decoders)│           │ (MITRE ATT&CK XML)│  │
│  └──────────────────┘           └─────────┬─────────┘  │
│                                           │            │
│  ┌──────────────────┐           ┌─────────▼─────────┐  │
│  │ Wazuh Dashboard  │ ◄──────── │ OpenSearch Indexer│  │
│  │ (SOC UI / Triage)│           │  (Storage & Query)│  │
│  └──────────────────┘           └───────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Threat Model & Ingestion Pipeline

### Attack Surface Analysis
1. **Initial Reconnaissance & Scanner Discovery (MITRE T1595):** Automated scanners (`Nikto`, `SQLMap`, `ffuf`) probing endpoints to profile technology stacks.
2. **Credential & Sensitive File Exposure (MITRE T1083 / T1552.001):** Malicious actors probing for exposed `.env` files, Git metadata (`/.git/config`), or legacy CMS configs (`/wp-config.php`).
3. **Web Application Fuzzing & Client Exploits (MITRE T1190):** Cross-site scripting (XSS) parameter injection targeting search inputs.
4. **Denial of Service / Resource Exhaustion (MITRE T1499.003):** Rapid request flooding intended to exhaust rate-limit thresholds.

### Log Ingestion & Normalization Engineering
Vercel emits edge logs formatted as JSON arrays or Newline Delimited JSON (NDJSON). Our forwarder ([`vercel-receiver.mjs`](../security/siem/vercel-receiver.mjs)):
1. Listens on an authenticated HTTPS endpoint (`/api/drain`).
2. Validates incoming requests using Vercel's drain signature header (`x-vercel-verify`).
3. Normalizes attributes into standardized syslog key-value pairs:
   ```
   charis-edge: VERCEL_SECURITY_EVENT srcip="203.0.113.19" method="GET" path="/.env" status="404" user_agent="curl/8.0" host="charis-six.vercel.app"
   ```
4. Emits the message over UDP port 514 to the Wazuh Manager daemon.

---

## 4. Custom Detection Rules & MITRE ATT&CK Mapping

All detection rules are declared in [`security/siem/rules/vercel-rules.xml`](../security/siem/rules/vercel-rules.xml):

| Rule ID | Severity | Threat Description | MITRE ATT&CK ID | MITRE Tactic |
| :--- | :--- | :--- | :--- | :--- |
| **`100001`** | Level 3 (Info) | Baseline Vercel Edge HTTP Request | `T1071.001` | Command & Control |
| **`100010`** | Level 8 (Medium) | Directory Brute-Force / Discovery (High 404 Count) | `T1595.002` | Reconnaissance: Vulnerability Scanning |
| **`100020`** | Level 8 (Medium) | Known Scanner User-Agent (`nikto`, `sqlmap`, `ffuf`) | `T1595.002` | Reconnaissance: Active Scanning |
| **`100030`** | Level 9 (High) | Sensitive File / Credential Probe (`/.env`, `/.git`) | `T1083` / `T1552` | Discovery / Credential Access |
| **`100040`** | Level 9 (High) | Cross-Site Scripting (XSS) Query Injection Probe | `T1190` | Initial Access: Exploit Public-Facing App |
| **`100050`** | Level 11 (Critical) | Rate-Limit Exhaustion / API Flooding (`429` Flood) | `T1499.003` | Impact: Endpoint DoS |
| **`100060`** | Level 10 (High) | Directory Traversal Probing (`../`, `/etc/passwd`) | `T1083` | Discovery: File & Directory Discovery |

---

## 5. Deployment & Quick Start Guide

### Step 1: Start the Wazuh SIEM Stack
Using Docker on your local workstation or a dedicated cloud VM:
```bash
docker compose -f security/siem/docker-compose.yml up -d
```
Access the SOC Web Interface at `https://localhost:5601` (Credentials: `admin` / `admin`).

### Step 2: Start the Vercel Webhook Receiver
```bash
node security/siem/vercel-receiver.mjs
```
The receiver starts listening on `http://0.0.0.0:8080/api/drain`.

### Step 3: Configure Vercel Log Drain
1. In the Vercel Dashboard, navigate to **Charis Project** $\rightarrow$ **Settings** $\rightarrow$ **Log Drains**.
2. Click **"Add Log Drain"**.
3. Choose **Webhook / HTTPS**.
4. Set URL to your receiver endpoint (e.g., via Cloudflare Tunnel, ngrok, or public IP: `https://your-domain.com/api/drain`).
5. Select **All Edge & Function Logs**.

---

## 6. Adversary Simulation & SOC Verification

To safely validate the detection rules without third-party vulnerability scanners, execute the automated simulation script:

```bash
node scripts/simulate-attacks.mjs https://charis-six.vercel.app
```

### Simulated Scenarios:
1. **Baseline Traffic:** Normal browser requests to `/` and `/manifest.webmanifest`.
2. **Credential Probing:** Requests to `/.env`, `/.git/config`, and `/wp-config.php`.
3. **Tool Fingerprinting:** Injected User-Agents for `Nikto/2.1.6` and `SQLMap`.
4. **Injection Probing:** URL-encoded `<script>` tags and event handlers.
5. **Directory Traversal:** Requests with `../../../../etc/passwd`.
6. **Fuzzing Burst:** Rapid 404 sequence across 9 administrative paths.

---

## 7. Incident Response Standard Operating Procedure (SOP)

When an alert fires in the Wazuh SOC Dashboard:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. Detection &  │ ──► │ 2. Investigation │ ──► │  3. Containment  │ ──► │ 4. Remediation & │
│  Classification  │     │   (Reputation)   │     │    (WAF Block)   │     │   Post-Mortem    │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

1. **Step 1: Triage & Classification:**
   * Review rule level ($> 8$ is actionable).
   * Verify source IP, timestamp, and target URI.
2. **Step 2: Threat Intelligence & Scope:**
   * Query IP reputation on AbuseIPDB or VirusTotal.
   * Determine whether the probe originated from an automated cloud bot or an active targeted attacker.
3. **Step 3: Containment (Edge Mitigation):**
   * If malicious intent is confirmed:
     * Add source IP to Vercel Firewall / WAF Block Rules.
     * Configure temporary rate-limit rules at the edge.
4. **Step 4: Post-Incident Review:**
   * Verify whether any requests bypassed headers or returned `200 OK` on unauthorized paths.
   * Tune rule threshold timeframes to minimize false positives.

---

## 8. Cybersecurity Interview Talking Points

* **"Tell me about a detection rule you built."**  
  * *"I wrote a stateful frequency rule in Wazuh (Rule `100010`) that detects web directory brute-forcing by tracking consecutive HTTP 404s from a single source IP over a 30-second sliding window, mapped to MITRE ATT&CK T1595.002."*
* **"How do you handle cloud applications with no virtual machine access?"**  
  * *"For serverless edge deployments like Vercel, traditional agent-based endpoint detection is impossible. Instead, I architected a stream-based log ingestion pipeline utilizing Vercel Log Drains, normalized the payload into RFC-compliant syslog, and parsed the attributes via custom regex decoders."*
* **"How do you ensure user privacy in a SIEM?"**  
  * *"In accordance with privacy-by-default, the receiver extracts only network metadata—IP, request path, status code, and latency—deliberately excluding sensitive request bodies or personal reflections."*
