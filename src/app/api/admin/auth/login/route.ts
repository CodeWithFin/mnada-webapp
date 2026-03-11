import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Fetch the admin user from the alternative storage in products table
    const { data: adminUser, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', 'SYSTEM_AUTH')
      .eq('name', username)
      .single();

    if (error || !adminUser) {
      console.log("Login Error (DB or not found):", error, adminUser ? "User found" : "No user");
      // Return a generic error to prevent username enumeration
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Compare the provided password with the hashed password (stored in description)
    const isPasswordValid = await bcrypt.compare(password, adminUser.description);

    if (!isPasswordValid) {
      console.log("Login Error (Invalid password)");
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: adminUser.name, id: adminUser.id },
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret',
      { expiresIn: '24h' }
    );

    // Authentication successful
    return NextResponse.json(
      { success: true, message: 'Authentication successful', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
