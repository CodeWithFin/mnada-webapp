# Database: Supabase (from scratch)

Mnada uses **Supabase** as the only database. No local Postgres, no migrations — one SQL file and one connection string.

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → name (e.g. `mnada`), set a **database password** (save it), choose a region.
3. Wait until the project is **Active** (if it says Paused, click **Restore project**).

---

## Step 2: Create the tables

1. In the project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file **`server/prisma/supabase-init.sql`** in this repo and copy its **entire** contents.
4. Paste into the SQL Editor and click **Run** (or Ctrl+Enter).
5. You should see “Success. No rows returned.” Tables will appear under **Table Editor**.

The script creates (and, if you run it again, **drops and recreates**) all tables: User, Otp, Product, CartItem, Order, OrderItem, Post, Comment, Like, Follow.

---

## Step 3: Get your connection string

1. In the project, click **Connect** (top right) or go to **Settings → Database**.
2. Under **Connection string**, select **URI**.
3. Choose **Session** (port **5432**). Do **not** use “Direct” — it often fails from many networks.
4. Copy the URI. It looks like:
   ```text
   postgres://postgres.XXXXXXXXXX:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
   ```
5. Replace `YOUR_PASSWORD` (or `[YOUR-PASSWORD]`) with your **database password** from Step 1.
6. Add `?sslmode=require` at the end if it’s not there:
   ```text
   postgres://postgres.XXXXXXXXXX:YourPassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

---

## Step 4: Set the env variable

1. Open **`server/.env`** (or create it from `server/.env.example`).
2. Set **only** this for the database:
   ```env
   DATABASE_URL=postgres://postgres.XXXXXXXXXX:YourPassword@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
   ```
   Use the exact URI from Step 3 (with your password and region).

There is no `DIRECT_URL` or other DB env vars — only `DATABASE_URL`.

---

## Step 4b: Supabase URL and keys (for image storage)

Images (posts, products) are stored in a Supabase Storage bucket instead of Cloudinary.

1. In the project, go to **Settings → API**.
2. Copy:
   - **Project URL** → set as `SUPABASE_URL` in `server/.env`.
   - **anon public** key → set as `SUPABASE_ANON_KEY`.
   - **service_role** key (optional but recommended for server uploads) → set as `SUPABASE_SERVICE_ROLE_KEY`.
3. In `server/.env` add:
   ```env
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   The server uses **service_role** for uploads (so it can create the bucket and write). You can use only **anon** if you create the bucket in the Dashboard and allow uploads; otherwise set **service_role** for the backend.

The app creates a public bucket named **mnada** on first upload if it doesn’t exist.

---

## Step 5: Generate Prisma client and run the app

From the **project root** (not inside `server/`):

```bash
npm run prisma:generate
```

Then start the server:

```bash
npm run dev:server
```

Or run both client and server:

```bash
npm run dev
```

---

## Optional: Seed data

To add sample products and feed data:

```bash
npm run seed
npm run seed:posts
```

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| **“Can't reach database server”** | 1) Restore the project if it’s Paused. 2) Use the **Session** pooler URI (port 5432), not Direct. 3) Check the region in the URI matches your project (e.g. `ap-south-1`, `us-east-1`). |
| **“Database tables missing”** | Run **`server/prisma/supabase-init.sql`** in Supabase SQL Editor (Step 2). |
| **“relation … does not exist”** | Same as above — run the init SQL once. |
| **Wrong region** | In Supabase: **Settings → General** to see **Region**. In your URI, the host must be `aws-0-<REGION>.pooler.supabase.com`. |

You only need **one** connection string: the **Session pooler** URI in `DATABASE_URL`.
