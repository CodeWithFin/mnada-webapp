import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createRoleToken, findSystemUser } from '@/lib/systemAuth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const adminUser = await findSystemUser(username, 'admin');

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.description);



    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = createRoleToken(adminUser, 'admin');

    // Authentication successful
    return NextResponse.json(
      { success: true, message: 'Authentication successful', token, role: 'admin', username: adminUser.name },
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
