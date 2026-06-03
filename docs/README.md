# 📚 UtilNest Documentation Hub

> **Your Complete Learning & Reference Guide for Production-Grade Serverless API Development**

---

## 🎯 Purpose

This documentation serves three primary audiences:
1. **Students & Learners** - Master modern API development and serverless architecture
2. **Job Seekers** - Prepare for technical interviews with real-world examples
3. **Developers** - Navigate and contribute to the UtilNest codebase

---

## 🗺️ Learning Paths

### Path 1: Complete Beginner (New to Serverless)
1. Start: [PROJECT_HANDBOOK](../PROJECT_HANDBOOK.md) - Understand Serverless vs Traditional
2. Next: [CODEBASE_STUDY_GUIDE](../.gemini/antigravity/brain/[conversation-id]/CODEBASE_STUDY_GUIDE.md) - Sections 1-3
3. Practice: Clone repo, run `npm run dev`, trace a request
4. Deep Dive: [02-ARCHITECTURE.md](./02-ARCHITECTURE.md)
5. Interview Prep: [12-INTERVIEW-PREPARATION.md](./12-INTERVIEW-PREPARATION.md)

### Path 2: Experienced Developer (API/Backend Background)
1. Start: [CODEBASE_STUDY_GUIDE](#) - Full read (1 hour)
2. Code Review: [13-ARCHITECTURE-DECISIONS.md](./13-ARCHITECTURE-DECISIONS.md) - Understand "why"
3. Hands-on: [05-API-GATEWAY.md](./05-API-GATEWAY.md) - Rate limiting implementation
4. Deep Dive: [04-AUTHENTICATION-SECURITY.md](./04-AUTHENTICATION-SECURITY.md) - OAuth & API Keys
5. Best Practices: [08-PRODUCTION-BEST-PRACTICES.md](./08-PRODUCTION-BEST-PRACTICES.md)

### Path 3: Interview Preparation (Technical Rounds)
1. [12-INTERVIEW-PREPARATION.md](./12-INTERVIEW-PREPARATION.md) - System design & scenarios
2. [CODEBASE_STUDY_GUIDE](../CODEBASE_STUDY_GUIDE.md) - Section 9 (Q&A)
3. [13-ARCHITECTURE-DECISIONS.md](./13-ARCHITECTURE-DECISIONS.md) - Trade-off discussions
4. Practice: Explain the request lifecycle on a whiteboard
5. Mock Interviews: \"Design a rate limiter\", \"Implement OAuth\"

---

## 📖 Documentation Index

### Core Concepts
| Document | Topics Covered | Time to Read |
|----------|---------------|--------------|
| [PROJECT_HANDBOOK](../PROJECT_HANDBOOK.md) | Serverless basics, Hono vs Express, D1/KV intro | 20 min |
| [CODEBASE_STUDY_GUIDE](../CODEBASE_STUDY_GUIDE.md) | Architecture, patterns, real code examples, Q&A | 60 min |
| [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) | Edge computing, Workers, V8 isolates, CAP theorem | 30 min |

### Implementation Guides
| Document | Topics Covered | Difficulty |
|----------|---------------|------------|
| [03-API-DEVELOPMENT.md](./03-API-DEVELOPMENT.md) | REST, design patterns, versioning, error handling | ⭐⭐ |
| [04-AUTHENTICATION-SECURITY.md](./04-AUTHENTICATION-SECURITY.md) | OAuth 2.0, API Keys, RBAC, hashing, JWKS | ⭐⭐⭐ |
| [05-API-GATEWAY.md](./05-API-GATEWAY.md) | Rate limiting, usage tracking, analytics | ⭐⭐⭐ |
| [06-DATA-PERSISTENCE.md](./06-DATA-PERSISTENCE.md) | D1 vs KV, schema design, indexing, migrations | ⭐⭐ |
| [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) | Unit, integration, E2E, mocking, coverage | ⭐⭐ |

### Production & Operations
| Document | Topics Covered | Role |
|----------|---------------|------|
| [08-PRODUCTION-BEST-PRACTICES.md](./08-PRODUCTION-BEST-PRACTICES.md) | Error handling, logging, fail-open vs fail-closed | DevOps/SRE |
| [09-DEPLOYMENT-OPERATIONS.md](./09-DEPLOYMENT-OPERATIONS.md) | CI/CD, secrets, environments, rollback | DevOps |
| [10-PERFORMANCE-OPTIMIZATION.md](./10-PERFORMANCE-OPTIMIZATION.md) | Caching, edge optimization, profiling | Performance Engineer |
| [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md) | Common errors, debugging, logs analysis | All Roles |

### Reference
| Document | Purpose | Use When |
|----------|---------|----------|
| [12-INTERVIEW-PREPARATION.md](./12-INTERVIEW-PREPARATION.md) | Technical & behavioral interview questions | Preparing for job interviews |
| [13-ARCHITECTURE-DECISIONS.md](./13-ARCHITECTURE-DECISIONS.md) | ADRs: Why we chose X over Y | Understanding trade-offs |

---

## 🔍 Quick Reference

### "Where Do I Find...?"

**Feature: Authentication**
- Concept: [04-AUTHENTICATION-SECURITY.md](./04-AUTHENTICATION-SECURITY.md)
- Code: `src/modules/auth/` and `src/modules/user-auth/`
- Guide: `src/modules/auth/IMPLEMENTATION_GUIDE.md`
- Tests: `test/modules/auth.test.ts`

**Feature: API Gateway (Rate Limiting)**
- Concept: [05-API-GATEWAY.md](./05-API-GATEWAY.md)
- Code: `src/common/middleware/gateway.ts`
- Tests: `test/modules/gateway.test.ts`
- Database: `schema.sql` (api_usage table)

**Feature: QR Code Generation**
- Concept: [PROJECT_HANDBOOK](../PROJECT_HANDBOOK.md) - Service pattern
- Code: `src/modules/qr-code/`
- Guide: `src/modules/qr-code/IMPLEMENTATION_GUIDE.md`
- Tests: `test/modules/qr-code.test.ts`

### "How Do I...?"

**Add a New API Module**
1. Read: [03-API-DEVELOPMENT.md](./03-API-DEVELOPMENT.md) - Section 4
2. Copy: `src/modules/demo/` as a template
3. Update: `src/index.ts` to mount your router
4. Test: Create `test/modules/your-module.test.ts`

**Test the Application Locally**
```bash
npm install
npm run dev              # Starts wrangler dev server
npm test                 # Runs vitest
```

**Deploy to Production**
```bash
npx wrangler deploy      # Deploy worker
npx wrangler d1 execute api-platform-db --remote --file=schema.sql  # Update DB
```

---

## 📊 Codebase Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| API Modules | 12 | Each in `src/modules/` |
| Middleware | 3 | Auth, Gateway, Chaos |
| Database Tables | 15 | D1 (SQLite) |
| KV Namespaces | 3 | Cache, Leases, Rate Limiting |
| Test Files | 10 | Unit + Integration |
| Documentation Files | 25+ | Guides + READMEs |

---

## 🎓 Interview Scenarios You Can Answer

After studying this documentation, you'll be able to confidently answer:

### System Design
- ✅ \"Design a rate limiter for an API gateway\"
- ✅ \"Build an authentication system with OAuth and API keys\"
- ✅ \"Design a caching strategy for a global API\"

### Technical Deep-Dives
- ✅ \"Explain the difference between D1 and KV\"
- ✅ \"How do you secure API keys?\"
- ✅ \"What is middleware and when would you use it?\"

### Behavioral
- ✅ \"Tell me about a time you optimized for edge performance\"
- ✅ \"How do you handle backward compatibility in APIs?\"
- ✅ \"Describe a production incident you debugged\"

---

## 🤝 Contributing to Documentation

Found a typo? Have a suggestion? Want to add an example?

1. Docs are in `docs/` (guides) and module-specific guides in `src/modules/*/IMPLEMENTATION_GUIDE.md`
2. Follow the existing structure (Concept → Code → Practice)
3. Include code examples from the actual codebase
4. Add to the appropriate learning path above

---

## 📞 Support

- **Technical Questions**: Check [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md)
- **Interview Help**: See [12-INTERVIEW-PREPARATION.md](./12-INTERVIEW-PREPARATION.md)
- **Architecture Decisions**: Read [13-ARCHITECTURE-DECISIONS.md](./13-ARCHITECTURE-DECISIONS.md)

---

**Happy Learning!** 🚀 This is a production-grade codebase - use it to level up your skills.
