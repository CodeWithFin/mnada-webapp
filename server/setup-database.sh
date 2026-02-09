#!/bin/bash

# Database setup script for Mnada
# Run this script to create the database and user

echo "Setting up PostgreSQL database for Mnada..."

# Try to connect as postgres user
# If you need to use a different user, modify the commands below

# Option 1: If you have postgres user access
# Uncomment and run these commands manually:
# sudo -u postgres psql << EOF
# CREATE USER mnada_user WITH PASSWORD 'mnada_password';
# CREATE DATABASE mnada OWNER mnada_user;
# GRANT ALL PRIVILEGES ON DATABASE mnada TO mnada_user;
# \q
# EOF

# Option 2: If you're using your own PostgreSQL user
# Connect to PostgreSQL and run:
# CREATE DATABASE mnada;
# (The database should already exist if you created it)

echo ""
echo "After setting up the database, update your .env file with:"
echo "DATABASE_URL=postgresql://mnada_user:mnada_password@localhost:5432/mnada"
echo ""
echo "Or if using your own user:"
echo "DATABASE_URL=postgresql://your_username:your_password@localhost:5432/mnada"
echo ""
echo "Then run: npm run prisma:migrate"

