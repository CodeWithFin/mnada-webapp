const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAdmin() {
  console.log("Checking for admin credentials in the 'products' table...");
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, description, created_at')
    .eq('category', 'SYSTEM_AUTH');

  if (error) {
    console.error("Error fetching admin credentials:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`Found ${data.length} admin record(s):`);
    data.forEach(user => {
      console.log(`- Username: ${user.name}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Password Hash (stored in description): ${user.description.substring(0, 10)}... (truncated)`);
      console.log(`  Created at: ${user.created_at}`);
    });
  } else {
    console.log("No admin credentials (SYSTEM_AUTH) found in the 'products' table.");
  }
}

checkAdmin();
