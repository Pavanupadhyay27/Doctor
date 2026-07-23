import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { date } = body;

    const db = getDb();
    const aptIndex = db.appointments.findIndex(a => a.id === id);

    if (aptIndex === -1) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    const apt = db.appointments[aptIndex];
    const oldDate = apt.date;
    apt.date = date;

    // Log this change in the associated lead timeline too!
    const leadIndex = db.leads.findIndex(l => l.id === apt.leadId);
    if (leadIndex !== -1) {
      db.leads[leadIndex].history.push({
        type: 'note',
        text: `Rescheduled appointment from ${oldDate} to ${date} via Calendar drag/edit`,
        date: new Date().toLocaleString(),
        author: 'System Calendar'
      });
    }

    saveDb(db);
    return NextResponse.json({ success: true, appointment: apt });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
