import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD;
const riderUsername = process.env.RIDER_USERNAME || 'rider';
const riderPassword = process.env.RIDER_PASSWORD || process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error('Missing ADMIN_PASSWORD in environment. Cannot sync admin credentials.');
  process.exit(1);
}

if (!riderPassword) {
  console.error('Missing RIDER_PASSWORD and ADMIN_PASSWORD in environment. Cannot sync rider credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function upsertSystemUser({ username, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data: existingUsers, error: lookupError } = await supabase
    .from('products')
    .select('id, name, mock_id, main_image_url')
    .eq('category', 'SYSTEM_AUTH')
    .eq('name', username);

  if (lookupError) {
    throw lookupError;
  }

  const existingUser = (existingUsers || []).find((record) =>
    record.main_image_url === role || record.mock_id?.startsWith(`system-${role}`)
  );

  const payload = {
    name: username,
    description: passwordHash,
    price: 0,
    image: `system-auth-${role}`,
    main_image_url: role,
    category: 'SYSTEM_AUTH',
    is_new: false,
    sizes: [],
  };

  if (existingUser) {
    const { error: updateError } = await supabase
      .from('products')
      .update(payload)
      .eq('id', existingUser.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Updated ${role} credentials for ${username}`);
    return;
  }

  const { error: insertError } = await supabase
    .from('products')
    .insert({
      ...payload,
      mock_id: `system-${role}-${Date.now()}`,
    });

  if (insertError) {
    throw insertError;
  }

  console.log(`Created ${role} credentials for ${username}`);
}

try {
  await upsertSystemUser({ username: adminUsername, password: adminPassword, role: 'admin' });
  await upsertSystemUser({ username: riderUsername, password: riderPassword, role: 'rider' });
  console.log('System auth sync complete. Runtime auth now uses Supabase records only.');
} catch (error) {
  console.error('Failed to sync system auth users:', error);
  process.exit(1);
}