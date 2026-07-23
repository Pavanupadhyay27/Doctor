import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, visitData, fields, docName } = body;

    const db = getDb();
    const patientIndex = db.patients.findIndex(p => p.id === id);

    if (patientIndex === -1) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    const patient = db.patients[patientIndex];

    if (action === 'add_visit') {
      patient.visitHistory.unshift({
        date: new Date().toISOString().split('T')[0],
        ...visitData
      });
    } else if (action === 'update_fields') {
      db.patients[patientIndex] = { ...patient, ...fields };
    } else if (action === 'add_document') {
      const docs = patient.documents || [];
      patient.documents = [
        ...docs,
        {
          name: docName,
          size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          date: new Date().toISOString().split('T')[0]
        }
      ];
    }

    saveDb(db);
    return NextResponse.json({ success: true, patient: db.patients[patientIndex] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
