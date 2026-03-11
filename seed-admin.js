const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data: existing } = await supabase.from('products').select('*').eq('category', 'SYSTEM_AUTH').eq('name', 'admin');
  if (existing && existing.length > 0) {
     console.log("Already seeded!");
     return;
  }

  const { data, error } = await supabase.from('products').insert({
    mock_id: 'SYSTEM_AUTH',
    name: 'admin',
    price: 0,
    category: 'SYSTEM_AUTH',
    description: '$2b$10$ZN3.z92y2/39sSGRR6Xug.4aCV8tEzcKwdFw.7az4EEajw9KHw/p.',
    image: 'https://via.placeholder.com/150',
    main_image_url: 'https://via.placeholder.com/150',
    is_new: false,
    sizes: []
  });
  console.log("Seed complete:", error || "Success");
}
seed();
