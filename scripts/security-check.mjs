/**
 * Phase 2 Security Review Gate Script
 * Automated verification of RLS enforcement, secret leakage prevention, and environment hygiene.
 */

import fs from 'node:fs';
import path from 'node:path';

let exitCode = 0;

function report(status, title, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${status}] ${title}`);
  if (details) {
    console.log(`   ${details}`);
  }
  if (status === 'FAIL') {
    exitCode = 1;
  }
}

// 1. Scan src/ and dist/ for prohibited secret tokens (service_role)
function checkClientBundleLeaks() {
  const forbiddenPatterns = [
    { name: 'service_role key reference', regex: /service_role/i },
    { name: 'Supabase secret key prefix', regex: /sbp_[a-zA-Z0-9_-]{20,}/ },
  ];

  const targetDirs = ['src'];
  if (fs.existsSync('dist')) {
    targetDirs.push('dist');
  }

  let leakFound = false;

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        scan(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx|html|css|json)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const pattern of forbiddenPatterns) {
          if (pattern.regex.test(content)) {
            report('FAIL', `Forbidden token found: ${pattern.name}`, `File: ${fullPath}`);
            leakFound = true;
          }
        }
      }
    }
  }

  for (const d of targetDirs) {
    scan(d);
  }

  if (!leakFound) {
    report('PASS', 'No service_role or secret tokens found in client code or distribution bundle.');
  }
}

// 2. Scan SQL migrations for Row Level Security (RLS) enforcement
function checkSqlMigrationsRLS() {
  const migrationsDir = path.join('supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    report('WARN', 'No migrations directory found at supabase/migrations');
    return;
  }

  const sqlFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  if (sqlFiles.length === 0) {
    report('WARN', 'No SQL migration files found');
    return;
  }

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find all created tables: CREATE TABLE [IF NOT EXISTS] public.<name>
    const tableMatches = [...content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi)];
    const createdTables = tableMatches.map(m => m[1]);

    for (const table of createdTables) {
      // Check for ENABLE ROW LEVEL SECURITY
      const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      if (rlsRegex.test(content)) {
        report('PASS', `RLS enabled on table '${table}' in ${file}`);
      } else {
        report('FAIL', `Missing RLS enablement for table '${table}' in ${file}`);
      }

      // Check for policy referencing auth.uid()
      const policyRegex = new RegExp(`CREATE\\s+POLICY\\s+.*?ON\\s+(?:public\\.)?${table}[\\s\\S]*?auth\\.uid\\(\\)`, 'i');
      if (policyRegex.test(content)) {
        report('PASS', `Table '${table}' has policies enforcing auth.uid() isolation`);
      } else {
        report('FAIL', `Table '${table}' lacks an explicit auth.uid() isolation policy in ${file}`);
      }
    }
  }
}

// 3. Scan environment and gitignore hygiene
function checkEnvironmentHygiene() {
  const gitignorePath = '.gitignore';
  if (!fs.existsSync(gitignorePath)) {
    report('FAIL', 'Missing .gitignore');
    return;
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignoreContent.includes('.env') && gitignoreContent.includes('!.env.example')) {
    report('PASS', '.gitignore properly ignores .env while allowing .env.example');
  } else {
    report('FAIL', '.gitignore does not safely ignore .env files');
  }

  // Check .env.example does not contain actual service_role assignments or secret keys
  const envExamplePath = '.env.example';
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    // Ensure no service_role env variable definition exists
    if (/^\s*[A-Z_]*SERVICE_ROLE[A-Z_]*\s*=/im.test(envExample)) {
      report('FAIL', '.env.example defines a service_role key variable');
    } else {
      report('PASS', '.env.example defines only public client-safe variables');
    }
  }
}

console.log('--- Charis Phase 2 Security Review Gate ---');
checkClientBundleLeaks();
checkSqlMigrationsRLS();
checkEnvironmentHygiene();
console.log('-------------------------------------------');

if (exitCode !== 0) {
  console.error('Security review gate FAILED. Please remediate the issues flagged above.');
  process.exit(exitCode);
} else {
  console.log('Security review gate PASSED cleanly.');
}
