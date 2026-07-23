import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    if (cleanEmail === 'admin@auraclinic.in' && cleanPassword === 'AuraCRMProtect2026!') {
      return NextResponse.json({
        success: true,
        user: { email: cleanEmail, role: 'Doctor' },
        token: 'session_token_' + Date.now()
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
