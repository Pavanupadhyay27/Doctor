import { NextResponse } from 'next/server';
import { getDb } from '@/data/dbHelper';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ success: true, ...db });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
