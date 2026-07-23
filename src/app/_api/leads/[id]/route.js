import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, status, text, author, notesContent, time } = body;

    const db = getDb();
    const leadIndex = db.leads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const lead = db.leads[leadIndex];
    const timestamp = new Date().toLocaleString();

    if (action === 'update_status') {
      const oldStatus = lead.status;
      lead.status = status;
      lead.history.push({
        type: 'system',
        text: `Pipeline status updated from ${oldStatus} to ${status}`,
        date: timestamp
      });

      // Conversion logic: if converted, create a patient profile automatically in DB
      if (status === 'Converted') {
        const patientExists = db.patients.some(p => p.leadId === id);
        if (!patientExists) {
          const newPatient = {
            id: `pat-${Date.now()}`,
            leadId: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            historyNotes: lead.notes || 'No previous medical notes.',
            treatmentPlan: `Consulted for ${lead.treatment}. Plan pending.`,
            visitHistory: [
              { date: new Date().toISOString().split('T')[0], type: 'Consultation', doctor: 'Dr. Ananya Sharma', notes: 'Converted from website lead.' }
            ],
            documents: []
          };
          db.patients.unshift(newPatient);
        }
      }
    } else if (action === 'add_note') {
      lead.history.push({
        type: 'note',
        text: text,
        date: timestamp,
        author: author || 'Staff'
      });
    } else if (action === 'save_notes_content') {
      lead.notes = notesContent;
    }

    saveDb(db);
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
