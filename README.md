# pipedact-sample-app 🍁🛡️

[![GitHub release](https://img.shields.io/github/v/release/theterminalguy/pipedact-sample-app?color=blue)](https://github.com/theterminalguy/pipedact-sample-app/releases)
[![pipedact audit](https://img.shields.io/badge/pipedact-compliance%20gate-red)](https://github.com/theterminalguy/pipedact)
[![Jurisdiction: CA-PIPEDA](https://img.shields.io/badge/Jurisdiction-CA--PIPEDA%20%7C%20Law%2025-crimson.svg)](https://www.priv.gc.ca/)
[![Framework: SOC 2 Type II](https://img.shields.io/badge/Framework-AICPA%20SOC%202%20Type%20II-teal.svg)](https://www.aicpa-cima.com/)

> A reference web & data application containing common **Canadian statutory privacy anti-patterns** and **AICPA SOC 2 Type II control deficiencies** to demonstrate and test continuous compliance auditing with [`pipedact`](https://github.com/theterminalguy/pipedact).

---

## 🔍 Embedded Violations Matrix

This repository deliberately incorporates anti-patterns across Canadian Federal/Provincial privacy laws (**PIPEDA Schedule 1, Quebec Law 25**) and **AICPA SOC 2 Type II Trust Services Criteria**:

| File | Framework Criteria | Finding Details | Severity |
|:---|:---|:---|:---|
| `src/controllers/auth.controller.ts:4` | **SOC 2 CC6.1 / CC6.6** | Hardcoded production JWT secret (`super_production_secret_token_...`) | `CRITICAL` |
| `src/controllers/auth.controller.ts:25` | **PIPEDA Principle 7 / SOC 2 CC6.1** | Hardcoded valid Canadian SIN (`046-454-286`) passing federal Luhn check | `CRITICAL` |
| `src/controllers/auth.controller.ts:26` | **PIPEDA Principle 7 / SOC 2 CC6.7** | Raw user PII & Canadian SIN leaking to application logger | `HIGH` |
| `src/controllers/auth.controller.ts:32` | **PIPEDA Principle 3 / SOC 2 P2.1** | Third-party tracking dispatched with `optInConfirmed: false` | `HIGH` |
| `src/controllers/auth.controller.ts:37` | **SOC 2 CC6.6** | Broken cryptographic hashing algorithm (MD5) used for passwords | `HIGH` |
| `src/controllers/auth.controller.ts:44` | **PIPEDA Principle 4 / SOC 2 P3.1** | Collecting provincial Health Card (`healthCardNumber`) during basic retail auth | `HIGH` |
| `src/controllers/auth.controller.ts:49` | **SOC 2 CC6.7** | Insecure session cookie transmitted without `secure: true` flag | `HIGH` |
| `src/server.ts:10` | **SOC 2 CC6.6** | Permissive wildcard CORS (`origin: '*'`) configured on API server | `MEDIUM` |
| `prisma/schema.prisma:11` | **PIPEDA Principle 5 / SOC 2 P4.1** | `model UserAccount` declares no retention TTL index, expiration date, or purge hook | `MEDIUM` |
| `prisma/schema.prisma:15` | **PIPEDA Principle 2 / SOC 2 P1.1** | `canadianSIN` and `creditCardToken` lack lawful `@privacy(purpose)` annotations | `MEDIUM` |
| `src/services/dsr.service.ts:9` | **PIPEDA Principle 9 / SOC 2 P5.1** | Data Subject Access Request (DSAR) export omits billing and audit trail tables | `MEDIUM` |
| `analytics/telemetry.py:9` | **PIPEDA Principle 7 / SOC 2 CC6.7** | Unredacted email and SIN emitted to standard Python logging | `HIGH` |
| `analytics/telemetry.py:12` | **PIPEDA Principle 1 / SOC 2 CC6.4** | Customer identity payload dispatched to unvetted third-party endpoint | `MEDIUM` |

---

## 🚀 Running the Audits

### 🍁 Canadian Statutory PIPEDA Audit
```bash
# 1. Run statutory compliance check
pipedact check . --framework pipeda --strict

# 2. Export OPC Schedule 1 Self-Assessment Compliance Dossier
pipedact dossier --framework pipeda --format markdown --out PIPEDA_DOSSIER.md
```

### 🛡️ AICPA SOC 2 Type II Audit
```bash
# 1. Run Trust Services Criteria check
pipedact check . --framework soc2

# 2. Export SOC 2 Type II Auditor Evidence Pack
pipedact dossier --framework soc2 --format markdown --out SOC2_DOSSIER.md
```

### 🌐 Unified Multi-Framework Audit
```bash
# Run multi-framework audit covering PIPEDA, SOC 2, ISO 27701, and Law 25
pipedact check . --framework all

# Generate SARIF report for GitHub Code Scanning
pipedact check . --format sarif --out audit.sarif

# Automatically patch safe violations
pipedact check . --fix
```

### 📦 NPM Package Scripts
```bash
npm run lint:pipeda    # Check PIPEDA compliance
npm run lint:soc2      # Check SOC 2 criteria
npm run lint:all       # Check all frameworks
npm run dossier:pipeda # Generate PIPEDA dossier
npm run dossier:soc2   # Generate SOC 2 evidence pack
```

---

## 🏷️ Keywords & Index Terms

`pipeda`, `soc2`, `privacy-engineering`, `vulnerable-app`, `security-testing`, `sast-demo`, `typescript`, `prisma`, `python`, `quebec-law-25`, `pii-redaction`, `sin-validation`.
