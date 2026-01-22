# Prisma Setup Guide

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**
   ```bash
   # From the root directory
   docker-compose up -d
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```
   Enter a migration name when prompted (e.g., "init" or "initial_schema")

5. **Seed the database:**
   ```bash
   npm run prisma:seed
   ```

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with sample data
- `npm run prisma:reset` - Reset database (WARNING: deletes all data)

## Schema Overview

### User Model
- UUID primary key
- Unique email with index
- Hashed password
- Role-based access (USER, ADMIN)
- Timestamps (createdAt, updatedAt)

### Task Model
- UUID primary key
- Status enum (TODO, IN_PROGRESS, COMPLETED, ARCHIVED)
- Priority system
- Optional due date and completion tracking
- Belongs to User (cascade delete)
- Timestamps (createdAt, updatedAt)

### Relations
- One User has many Tasks
- Task belongs to one User (required)
- Cascade delete: deleting a user deletes their tasks

## Indexes
- User: email
- Task: userId, status, createdAt

## Default Credentials (Seed Data)
- Admin: admin@tasksphere.com / password123
- User: user@tasksphere.com / password123
