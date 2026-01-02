# Database Setup Instructions

## The Problem
Your `DATABASE_URL` is using placeholder values (`user:password`) which don't have database access.

## Solution Options

### Option 1: Use Your System User (Easiest)
If PostgreSQL allows your system user to connect, try this:

1. **Update `.env` file:**
   ```env
   DATABASE_URL=postgresql://$(whoami)@localhost:5432/mnada
   ```
   
   Or manually replace with your username:
   ```env
   DATABASE_URL=postgresql://finley@localhost:5432/mnada
   ```

2. **Create the database** (if it doesn't exist):
   ```bash
   createdb mnada
   ```

3. **Run migration:**
   ```bash
   npm run prisma:migrate
   ```

### Option 2: Create a Database User (Recommended)

1. **Connect to PostgreSQL as postgres user:**
   ```bash
   sudo -u postgres psql
   ```

2. **Create user and database:**
   ```sql
   CREATE USER mnada_user WITH PASSWORD 'your_secure_password';
   CREATE DATABASE mnada OWNER mnada_user;
   GRANT ALL PRIVILEGES ON DATABASE mnada TO mnada_user;
   \q
   ```

3. **Update `.env` file:**
   ```env
   DATABASE_URL=postgresql://mnada_user:your_secure_password@localhost:5432/mnada
   ```

4. **Run migration:**
   ```bash
   npm run prisma:migrate
   ```

### Option 3: Use Existing PostgreSQL User

If you already have a PostgreSQL user with database access:

1. **Update `.env` file with your credentials:**
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/mnada
   ```

2. **Create database if needed:**
   ```bash
   psql -U your_username -d postgres -c "CREATE DATABASE mnada;"
   ```

3. **Run migration:**
   ```bash
   npm run prisma:migrate
   ```

## Quick Test

After updating your `.env`, test the connection:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

If this works, you can run the migration!

