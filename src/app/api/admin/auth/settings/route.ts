import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { findSystemUser, verifyRoleRequest } from '@/lib/systemAuth';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

export async function PUT(request: Request) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword } = await request.json();

    const authUser = await verifyRoleRequest(request, 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authUser.username !== currentUsername) {
      return NextResponse.json({ error: 'Unauthorized user alteration' }, { status: 403 });
    }

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

    const adminUser = await findSystemUser(currentUsername, 'admin');

    if (!adminUser || !adminUser.description) {
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
    const updates: { name?: string; description?: string } = {};
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
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
