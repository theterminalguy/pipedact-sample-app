# pipedact-sample-app 🍁🛡️

[![CI](https://github.com/theterminalguy/pipedact-sample-app/actions/workflows/pipeda.yml/badge.svg)](https://github.com/theterminalguy/pipedact-sample-app/actions/workflows/pipeda.yml)
[![pipedact audit](https://img.shields.io/badge/pipedact-acceptance%20suite-blue)](https://github.com/theterminalguy/pipedact)
[![Jurisdiction: CA-PIPEDA](https://img.shields.io/badge/Jurisdiction-CA--PIPEDA%20%7C%20Law%2025-crimson.svg)](https://www.priv.gc.ca/)
[![Framework: SOC 2 Type II](https://img.shields.io/badge/Framework-AICPA%20SOC%202%20Type%20II-teal.svg)](https://www.aicpa-cima.com/)

> Official end-to-end acceptance, regression, and demonstration test suite for [`pipedact`](https://github.com/theterminalguy/pipedact).
>
> Provides categorized positive, negative, and adversarial fixtures demonstrating privacy anti-patterns, secure remediations, and edge cases across Canadian statutory privacy frameworks (PIPEDA, Quebec Law 25), SOC 2 Trust Services Criteria, and ISO/IEC 27701.

---

## 📁 Repository Structure

The suite is organized into distinct fixture tiers:

```
fixtures/
├── manifest.json              # Machine-readable test contract for all fixtures
├── vulnerable/                # Deficient implementations triggering specific rules
│   ├── auth_vulnerable.ts     # Multi-violation authentication endpoint
│   ├── server_vulnerable.ts   # Wildcard CORS and missing policy route
│   ├── dsr_vulnerable.ts      # Incomplete data subject access export
│   ├── telemetry_vulnerable.py# Unvetted subprocessor & logging sinks
│   ├── schema_vulnerable.prisma # Missing retention policy & untagged columns
│   └── unauthorized_export.ts # Documented negative test (unsupported static rule)
├── secure/                    # Remediated, clean implementations (0 violations)
│   ├── auth_secure.ts         # Environment secrets, bcrypt, masked logs, secure cookies
│   ├── server_secure.ts       # Explicit CORS whitelist, /privacy endpoint
│   ├── dsr_secure.ts          # Comprehensive subject export (profile, billing, logs)
│   ├── authorized_export.ts   # Auth middleware and ownership verification
│   ├── telemetry_secure.py    # Domestic Canadian endpoint, SHA-256 pseudonymization
│   └── schema_secure.prisma   # autoPurge retention TTL hook & @privacy annotations
└── adversarial/               # Edge cases, comment resilience & parser stability
    ├── comment_guards.ts      # Comments mentioning consent must not bypass active calls
    ├── mixed_cookies.ts       # Secure cookie must not suppress detection of insecure cookie
    ├── multiline_cookie.ts    # Multiline cookie calls correctly extracted & inspected
    ├── env_fallback_secret.ts # Secret embedded in env fallback caught & redacted in logs
    ├── sanitized_logging.ts   # Masked / hashed identifiers produce 0 false positives
    ├── policy_exception.ts    # Statutory exception configuration toggles
    └── malformed.ts           # Syntax errors handled gracefully without crash
```

---

## 🧪 Running the Test Suite

### 1. Automated Acceptance Runner (`manifest.json` Verification)

The automated test runner executes pipedact against all 19 fixtures and validates violation counts, exact rule IDs, severities, confidence levels, exit codes, output determinism, and zero sensitive token leakage:

```bash
# Run acceptance test suite via npm
npm test

# Or run directly with node
node scripts/verify-fixtures.js
```

### 2. Manual Inspection Commands

You can run `pipedact` directly against individual tiers:

```bash
# 1. Scan vulnerable fixtures (fails gate with exit code 1)
pipedact check fixtures/vulnerable/auth_vulnerable.ts --framework soc2,pipeda

# 2. Scan secure fixtures (passes cleanly with 100% score)
pipedact check fixtures/secure/ --strict

# 3. Preview safe automated remediation (dry-run mode)
pipedact check fixtures/vulnerable/telemetry_vulnerable.py --fix --dry-run

# 4. Generate PIPEDA compliance dossier
pipedact dossier fixtures/secure/ --framework pipeda --format markdown --out PIPEDA_DOSSIER.md
```

---

## 🔍 Fixture Coverage Matrix

| Fixture ID | Category | Target File | Expected Rules | Supported |
|:---|:---|:---|:---|:---:|
| `vuln-auth` | Vulnerable | `fixtures/vulnerable/auth_vulnerable.ts` | `SOC2-CC6-HARDCODED-SECRET`, `PIPEDA-7-RAW-SIN`, `PIPEDA-7-SAFEGUARD-LOG`, `PIPEDA-3-OPTIN-MISSING` (x2), `PIPEDA-4-OVER-COLLECTION` (x2), `SOC2-CC6-WEAK-CRYPTO`, `SOC2-CC6-INSECURE-COOKIE` | Yes |
| `vuln-server` | Vulnerable | `fixtures/vulnerable/server_vulnerable.ts` | `PIPEDA-8-POLICY-ROUTE-MISSING`, `SOC2-CC6-WILDCARD-CORS` | Yes |
| `vuln-dsr` | Vulnerable | `fixtures/vulnerable/dsr_vulnerable.ts` | `PIPEDA-9-INCOMPLETE-DSR` | Yes |
| `vuln-telemetry` | Vulnerable | `fixtures/vulnerable/telemetry_vulnerable.py` | `PIPEDA-7-SAFEGUARD-LOG`, `PIPEDA-1-UNVETTED-SUBPROCESSOR`, `PIPEDA-7-RAW-SIN` | Yes |
| `vuln-schema` | Vulnerable | `fixtures/vulnerable/schema_vulnerable.prisma` | `PIPEDA-5-RETENTION-DISPOSAL`, `PIPEDA-2-PURPOSE-UNTAGGED` (x3) | Yes |
| `vuln-unauthorized-export` | Vulnerable | `fixtures/vulnerable/unauthorized_export.ts` | *(Documented limitation: static regex analysis cannot determine RBAC/route authorization boundaries)* | No |
| `sec-auth` | Secure | `fixtures/secure/auth_secure.ts` | *(Clean: 0 violations, score 100%)* | Yes |
| `sec-server` | Secure | `fixtures/secure/server_secure.ts` | *(Clean: 0 violations, score 100%)* | Yes |
| `sec-dsr` | Secure | `fixtures/secure/dsr_secure.ts` | *(Clean: 0 violations, score 100%)* | Yes |
| `sec-authorized-export` | Secure | `fixtures/secure/authorized_export.ts` | *(Clean: 0 violations, score 100%)* | Yes |
| `sec-telemetry` | Secure | `fixtures/secure/telemetry_secure.py` | *(Clean: 0 violations, score 100%)* | Yes |
| `sec-schema` | Secure | `fixtures/secure/schema_secure.prisma` | *(Clean: 0 violations, score 100%)* | Yes |
| `adv-comment-guards` | Adversarial | `fixtures/adversarial/comment_guards.ts` | `PIPEDA-3-OPTIN-MISSING` (x2; comments ignored) | Yes |
| `adv-mixed-cookies` | Adversarial | `fixtures/adversarial/mixed_cookies.ts` | `SOC2-CC6-INSECURE-COOKIE` (isolated per call) | Yes |
| `adv-multiline-cookie` | Adversarial | `fixtures/adversarial/multiline_cookie.ts` | `SOC2-CC6-INSECURE-COOKIE` (multiline parsed) | Yes |
| `adv-env-fallback-secret` | Adversarial | `fixtures/adversarial/env_fallback_secret.ts` | `SOC2-CC6-HARDCODED-SECRET` (redacted in output) | Yes |
| `adv-sanitized-logging` | Adversarial | `fixtures/adversarial/sanitized_logging.ts` | *(Clean: masked identifiers produce 0 false positives)* | Yes |
| `adv-policy-exception` | Adversarial | `fixtures/adversarial/policy_exception.ts` | `PIPEDA-4-OVER-COLLECTION` (configurable exception) | Yes |
| `adv-malformed` | Adversarial | `fixtures/adversarial/malformed.ts` | *(Clean: syntax errors handled without crash)* | Yes |

---

## 🏷️ Keywords & Index Terms

`pipeda`, `soc2`, `privacy-as-code`, `static-analysis`, `security-testing`, `regression-suite`, `quebec-law-25`, `iso-27701`, `pii-redaction`, `sin-validation`, `luhn-algorithm`.
