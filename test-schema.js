const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  // Handle keys that might have inline comments or quotes
  if (key && !key.startsWith('#')) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

async function check() {
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await response.json();
  console.log("TABLES:", Object.keys(data.definitions));
}
check();
