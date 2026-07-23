import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadId, patientName, date, time, treatment, notes } = body;

    const db = getDb();
    const newApt = {
      id: `apt-${Date.now()}`,
      leadId,
      patientName,
      date,
      time,
      treatment,
      status: 'Scheduled',
      notes: notes || ''
    };

    db.appointments.push(newApt);
    saveDb(db);

    return NextResponse.json({ success: true, appointment: newApt });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
