-- Create the admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: The following password hash is generated using bcrypt for the password 'mnada2025'.
-- You should change this password from the Settings page once you log in.
INSERT INTO admin_users (username, password_hash)
VALUES (
  'admin',
  '$2b$10$ZN3.z92y2/39sSGRR6Xug.4aCV8tEzcKwdFw.7az4EEajw9KHw/p.'
) ON CONFLICT (username) DO NOTHING;
