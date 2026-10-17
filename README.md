# pipedact-sample-app 🍁

> A reference web & data application containing common **Canadian statutory privacy anti-patterns** to demonstrate and test compliance scanning with [`pipedact`](https://github.com/theterminalguy/pipedact).

---

## 🔍 Embedded Violations Matrix

This repository deliberately incorporates anti-patterns across multiple statutory principles of Canada's **Personal Information Protection and Electronic Documents Act (PIPEDA)** (Schedule 1):

| File | Statutory Principle | Finding Details | Severity |
|:---|:---|:---|:---|
| `src/controllers/auth.controller.ts:22` | **Principle 7: Safeguards** | Raw user PII & Canadian SIN leaking to application logger | `HIGH` |
| `src/controllers/auth.controller.ts:24` | **Principle 7: Safeguards (SIN)** | Hardcoded real Canadian SIN (`046-454-286`) passing federal Luhn check | `CRITICAL` |
| `src/controllers/auth.controller.ts:31` | **Principle 3: Consent** | Third-party tracking dispatched with `optInConfirmed: false` | `HIGH` |
| `src/controllers/auth.controller.ts:41` | **Principle 4: Limiting Collection** | Collecting provincial Health Card (`healthCardNumber`) during basic retail authentication | `HIGH` |
| `prisma/schema.prisma:11` | **Principle 5: Retention & Disposal** | `model UserAccount` declares no retention TTL index, expiration date, or purge hook | `MEDIUM` |
| `prisma/schema.prisma:14` | **Principle 2: Identifying Purposes** | `canadianSIN` and `creditCardToken` lack lawful `@privacy(purpose)` annotations | `MEDIUM` |
| `src/services/dsr.service.ts:11` | **Principle 9: Individual Access** | Data Subject Access Request (DSAR) export omits billing and audit trail tables | `MEDIUM` |
| `analytics/telemetry.py:9` | **Principle 7: Safeguards** | Unredacted email and SIN emitted to standard Python logging | `HIGH` |
| `analytics/telemetry.py:12` | **Principle 1: Accountability** | Customer identity payload dispatched to unvetted third-party endpoint (`unverified-metrics-cdn.com`) | `MEDIUM` |

---

## 🚀 Running the Audit

```bash
# 1. Initialize policy configuration in repo
pipedact init

# 2. Run statutory compliance check
pipedact check . --strict

# 3. Export OPC Schedule 1 Self-Assessment Compliance Dossier
pipedact dossier --format markdown --out PIPEDA_DOSSIER.md

# 4. Generate SARIF report for GitHub Code Scanning
pipedact check . --format sarif --out audit.sarif

# 5. Automatically patch safe violations
pipedact check . --fix
```
