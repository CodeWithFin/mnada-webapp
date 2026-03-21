import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type PortalRole = 'admin' | 'seller';

type SystemAuthRecord = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  password_hash?: string;
};

type AuthTokenPayload = {
  username: string;
  email?: string;
  id: string;
  role: PortalRole;
};

const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';
const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret';

export async function findSystemUser(username: string, role: PortalRole) {
  if (role === 'admin') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, description')
      .eq('category', SYSTEM_AUTH_CATEGORY)
      .eq('name', username)
      .maybeSingle();

    if (error) {
      console.error('Failed to look up admin user:', error);
      return null;
    }

    return (data as SystemAuthRecord | null) || null;
  }

  if (role === 'seller') {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('id, name, email, password_hash')
      .eq('email', username)
      .maybeSingle();

    if (error) {
      console.error('Failed to look up seller:', error);
      return null;
    }

    return (data as SystemAuthRecord | null) || null;
  }

  return null;
}

export function createRoleToken(user: { id: string; name: string }, role: PortalRole) {
  return jwt.sign(
    { username: user.name, id: user.id, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function verifyRoleRequest(req: Request, allowedRoles: PortalRole | PortalRole[]) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!payload.role || !roles.includes(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
