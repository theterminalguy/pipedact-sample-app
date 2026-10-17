#!/usr/bin/env node

/**
 * Pipedact End-to-End Acceptance & Regression Test Runner
 *
 * Validates pipedact static analysis engine against the official fixtures manifest:
 * - Expected rule violations, severities, and confidence levels
 * - Exit code contracts (default and strict modes)
 * - Zero sensitive data leakage (SIN, AWS keys, Stripe keys, secrets)
 * - Scan output determinism
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'fixtures', 'manifest.json');

// Locate pipedact binary
function getPipedactBin() {
  if (process.env.PIPEDACT_BIN && fs.existsSync(process.env.PIPEDACT_BIN)) {
    return process.env.PIPEDACT_BIN;
  }
  const homeBin = path.join(process.env.HOME || '', '.local', 'bin', 'pipedact');
  if (fs.existsSync(homeBin)) {
    return homeBin;
  }
  return 'pipedact';
}

const PIPEDACT_BIN = getPipedactBin();

console.log('🍁 Pipedact Test Runner — Fixture Acceptance Suite');
console.log(`   Binary: ${PIPEDACT_BIN}`);
console.log(`   Manifest: ${MANIFEST_PATH}\n`);

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Error: Manifest not found at ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runPipedact(args, options = {}) {
  try {
    const stdout = execFileSync(PIPEDACT_BIN, args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : '',
      exitCode: err.status || 1,
    };
  }
}

function parseJsonFromOutput(output) {
  // Finds opening brace of JSON in case of logging header
  const jsonStart = output.indexOf('{');
  if (jsonStart === -1) {
    throw new Error('No JSON output found in stdout');
  }
  return JSON.parse(output.slice(jsonStart));
}

// 1. Manifest Fixture Tests
console.log('--- 1. Validating Fixtures Against Manifest ---');

for (const fixture of manifest.fixtures) {
  totalTests++;
  const fixturePath = path.join(REPO_ROOT, fixture.file);
  const testId = `[${fixture.category.toUpperCase()}] ${fixture.id} (${fixture.file})`;

  if (!fs.existsSync(fixturePath)) {
    console.error(`❌ FAIL: ${testId} - File does not exist`);
    failedTests++;
    continue;
  }

  const result = runPipedact(['check', fixture.file, '--framework', 'soc2,pipeda', '--format', 'json']);

  let parsed;
  try {
    parsed = parseJsonFromOutput(result.stdout);
  } catch (e) {
    console.error(`❌ FAIL: ${testId} - Failed to parse JSON output: ${e.message}`);
    failedTests++;
    continue;
  }

  const violations = parsed.violations || [];
  let testPassed = true;
  const failureReasons = [];

  // Check expected violation count
  if (violations.length !== fixture.expectedViolationCount) {
    testPassed = false;
    failureReasons.push(`Expected ${fixture.expectedViolationCount} violations, got ${violations.length}`);
  }

  // Check expected exit code
  if (result.exitCode !== fixture.expectedExitCode) {
    testPassed = false;
    failureReasons.push(`Expected exit code ${fixture.expectedExitCode}, got ${result.exitCode}`);
  }

  // Check expected rules
  for (const expected of fixture.expectedViolations) {
    const match = violations.find(v => v.ruleId === expected.ruleId && v.line === expected.line);
    if (!match) {
      testPassed = false;
      failureReasons.push(`Missing expected violation: ${expected.ruleId} at line ${expected.line}`);
    } else {
      if (expected.severity && match.severity !== expected.severity) {
        testPassed = false;
        failureReasons.push(`Rule ${expected.ruleId} line ${expected.line}: expected severity ${expected.severity}, got ${match.severity}`);
      }
      if (expected.confidence && match.confidence !== expected.confidence) {
        testPassed = false;
        failureReasons.push(`Rule ${expected.ruleId} line ${expected.line}: expected confidence ${expected.confidence}, got ${match.confidence}`);
      }
    }
  }

  // Check for sensitive data leakage
  const rawCombined = result.stdout + result.stderr;
  if (/sk_live_[0-9a-zA-Z]{16,}/.test(rawCombined)) {
    testPassed = false;
    failureReasons.push('CRITICAL: Unmasked Stripe live secret leaked into output!');
  }
  if (/AKIA[0-9A-Z]{16}/.test(rawCombined)) {
    testPassed = false;
    failureReasons.push('CRITICAL: Unmasked AWS Access Key leaked into output!');
  }
  if (/\b046[-\s]?454[-\s]?286\b/.test(rawCombined)) {
    testPassed = false;
    failureReasons.push('CRITICAL: Unmasked valid Canadian SIN leaked into output!');
  }

  if (testPassed) {
    console.log(`✔ PASS: ${testId} (${violations.length} violations, exit ${result.exitCode})`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testId}`);
    failureReasons.forEach(r => console.error(`    - ${r}`));
    failedTests++;
  }
}

// 2. Strict Mode Verification
console.log('\n--- 2. Validating Strict Mode Enforcement ---');
totalTests++;
{
  // dsr_vulnerable has 1 MEDIUM violation. Under default it exits 0, under --strict it must exit 1
  const strictResult = runPipedact(['check', 'fixtures/vulnerable/dsr_vulnerable.ts', '--strict']);
  if (strictResult.exitCode === 1) {
    console.log('✔ PASS: [STRICT] Exits with code 1 on MEDIUM violation under --strict');
    passedTests++;
  } else {
    console.error(`❌ FAIL: [STRICT] Expected exit code 1 under --strict, got ${strictResult.exitCode}`);
    failedTests++;
  }
}

// 3. Dry-Run Autofix Preview Verification
console.log('\n--- 3. Validating Safe Dry-Run Autofix Preview ---');
totalTests++;
{
  const dryRunResult = runPipedact(['check', 'fixtures/vulnerable/telemetry_vulnerable.py', '--fix', '--dry-run']);
  if (dryRunResult.stdout.includes('[dry-run]') && dryRunResult.stdout.includes('--- ') && dryRunResult.stdout.includes('+++ ')) {
    console.log('✔ PASS: [AUTOFIX-DRYRUN] Generates unified diff preview without crashing');
    passedTests++;
  } else {
    console.error('❌ FAIL: [AUTOFIX-DRYRUN] Expected dry-run preview diff output');
    failedTests++;
  }
}

// 4. Scan Output Determinism Verification
console.log('\n--- 4. Validating Scan Output Determinism ---');
totalTests++;
{
  const run1 = runPipedact(['check', 'fixtures/vulnerable/auth_vulnerable.ts', '--format', 'json']);
  const run2 = runPipedact(['check', 'fixtures/vulnerable/auth_vulnerable.ts', '--format', 'json']);

  const json1 = parseJsonFromOutput(run1.stdout);
  const json2 = parseJsonFromOutput(run2.stdout);

  // Compare violations array determinism
  const str1 = JSON.stringify(json1.violations);
  const str2 = JSON.stringify(json2.violations);

  if (str1 === str2) {
    console.log(`✔ PASS: [DETERMINISM] Repeated scans produce byte-identical violation output (${json1.violations.length} violations)`);
    passedTests++;
  } else {
    console.error('❌ FAIL: [DETERMINISM] Violation ordering or content differed between runs');
    failedTests++;
  }
}

// Summary
console.log('\n=============================================');
console.log(`Total Verification Checks: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('=============================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All acceptance and regression tests passed successfully!');
  process.exit(0);
}
