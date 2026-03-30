import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 1. Check if the requester is an admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      const { data: { user: authUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      return NextResponse.json({
        ...profileData,
        email: authUser?.email || 'No email'
      });
    }

    // 2. Fetch all users from auth.users (to get emails)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // 3. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // 4. Merge data
    const mergedData = profiles.map(p => {
      const authUser = users.find(u => u.id === p.id);
      return {
        ...p,
        email: authUser?.email || 'No email'
      };
    });

    return NextResponse.json(mergedData);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in admin users API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
