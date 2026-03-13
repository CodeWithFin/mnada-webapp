import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword } = await request.json();

    /*
    // Verify auth token to ensure they are actually logged in as the user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.username !== currentUsername) {
      return NextResponse.json({ error: 'Unauthorized user alteration' }, { status: 403 });
    }
    */

    if (!currentUsername || !currentPassword) {
      return NextResponse.json(
        { error: 'Current credentials are required to verify identity' },
        { status: 400 }
      );
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: 'Nothing to update' },
        { status: 400 }
      );
    }

    // Fetch the current admin user to verify identity
    const { data: adminUser, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', 'SYSTEM_AUTH')
      .eq('name', currentUsername)
      .single();

    if (error || !adminUser) {
      return NextResponse.json(
        { error: 'Invalid current credentials' },
        { status: 401 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.description);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid current credentials' },
        { status: 401 }
      );
    }

    // Prepare update payload
    const updates: any = {};
    if (newUsername) {
      updates.name = newUsername;
    }
    if (newPassword) {
      updates.description = await bcrypt.hash(newPassword, 10);
    }

    // Update the record in the database
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', adminUser.id);

    if (updateError) {
      console.error('Update profile error from Supabase:', updateError);
      return NextResponse.json(
        { error: 'Failed to update credentials. Username might already exist.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Settings updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
