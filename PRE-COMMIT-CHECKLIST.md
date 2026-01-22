# Pre-Commit Checklist for TaskSphere

Before committing and pushing your code to GitHub, please verify the following:

## ✅ Security Checklist

### Environment Files
- [ ] ✅ `.env` files are in `.gitignore`
- [ ] ✅ `.env.example` files exist (backend and frontend)
- [ ] ✅ No actual secrets in `.env.example` files
- [ ] ✅ All sensitive values use placeholder text

### Secrets & Credentials
- [ ] ✅ No API keys in code
- [ ] ✅ No database passwords in code
- [ ] ✅ No JWT secrets in code
- [ ] ✅ No private keys (.pem, .key files) committed

### Dependencies
- [ ] ✅ `node_modules/` is ignored
- [ ] ✅ `package-lock.json` is committed (for reproducible builds)

## ✅ Code Quality Checklist

### Backend
- [ ] ✅ All TypeScript files compile without errors
- [ ] ✅ No console.log statements in production code
- [ ] ✅ Error handling is implemented
- [ ] ✅ Validation schemas are in place

### Frontend
- [ ] ✅ All TypeScript files compile without errors
- [ ] ✅ No hardcoded API URLs (using environment variables)
- [ ] ✅ All components are properly typed
- [ ] ✅ Loading and error states handled

## ✅ Files to Include

### Root Level
- [x] ✅ README.md (comprehensive documentation)
- [x] ✅ .gitignore (comprehensive ignore rules)
- [ ] LICENSE (if applicable)

### Backend
- [x] ✅ backend/.env.example
- [x] ✅ backend/package.json
- [x] ✅ backend/tsconfig.json
- [x] ✅ backend/prisma/schema.prisma
- [x] ✅ backend/src/ (all source files)
- [ ] backend/.env (should be IGNORED)

### Frontend
- [x] ✅ frontend/.env.example
- [x] ✅ frontend/package.json
- [x] ✅ frontend/tsconfig.json
- [x] ✅ frontend/tailwind.config.ts
- [x] ✅ frontend/src/ (all source files)
- [ ] frontend/.env.local (should be IGNORED)

## ✅ Files to Exclude (Auto-ignored)

- [ ] ❌ .env files (all variants)
- [ ] ❌ node_modules/
- [ ] ❌ dist/ or build/
- [ ] ❌ .next/
- [ ] ❌ coverage/
- [ ] ❌ *.log files
- [ ] ❌ *.db files
- [ ] ❌ Database dumps

## 🔍 Quick Verification Commands

### Check for secrets in staged files
\`\`\`bash
git diff --cached | grep -i "password\|secret\|key\|token" || echo "No secrets found"
\`\`\`

### Verify .env files are not staged
\`\`\`bash
git status | grep ".env" && echo "WARNING: .env file detected!" || echo "Safe to commit"
\`\`\`

### Check TypeScript compilation
\`\`\`bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npm run type-check
\`\`\`

## 📋 Git Commands for Initial Commit

\`\`\`bash
# Initialize git (if not already done)
git init

# Check status
git status

# Review what will be committed
git diff

# Stage all files
git add .

# Verify staged files
git status

# Create initial commit
git commit -m "Initial commit: Full-stack task management system

- Backend: Express + TypeScript + Prisma + PostgreSQL
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Authentication: JWT with refresh tokens
- Security: bcrypt, httpOnly cookies, CORS, rate limiting
- Features: Complete task CRUD with pagination, search, filters
- Architecture: Clean architecture with separation of concerns"

# Set main branch
git branch -M main

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/tasksphere.git

# Push to GitHub
git push -u origin main
\`\`\`

## ⚠️ Common Pitfalls to Avoid

1. **Committing .env files**
   - Always double-check before pushing
   - Use `git status` to verify

2. **Hardcoded credentials**
   - Search for: `password`, `secret`, `key`, `token`
   - Ensure all use environment variables

3. **Large files**
   - node_modules/ should be ignored
   - Database files should be ignored
   - Build outputs should be ignored

4. **Debugging code**
   - Remove console.log statements
   - Remove debugger statements
   - Remove commented-out code blocks

## ✅ Final Verification

Before pushing, answer these questions:

1. **Can someone else run this project with just the README?**
   - Yes ✅

2. **Are all secrets in environment variables?**
   - Yes ✅

3. **Does .env.example have placeholder values?**
   - Yes ✅

4. **Is the README documentation complete?**
   - Yes ✅

5. **Do both backend and frontend start without errors?**
   - Test with: `npm run dev` in both directories

## 🎉 Ready to Push!

If all checkboxes are marked ✅, you're ready to push to GitHub!

\`\`\`bash
git push -u origin main
\`\`\`

---

**Remember**: Once something is pushed to GitHub, it's very difficult to completely remove it from the history. Always verify before pushing!
