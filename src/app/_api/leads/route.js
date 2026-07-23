import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, treatment, notes, source } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and Phone are required' }, { status: 400 });
    }

    const db = getDb();
    
    // Auto-prepend country code prefix (+91) for Indian standard format if not present
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Remove any leading zeroes
      const sanitizedNumber = formattedPhone.replace(/^0+/, '');
      formattedPhone = `+91 ${sanitizedNumber}`;
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      name: name.trim(),
      phone: formattedPhone,
      email: email ? email.trim() : 'inquiry@auraclinic.in',
      treatment,
      source: source || 'Website Form',
      status: 'New',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: notes || '',
      history: [
        { type: 'system', text: `Lead logged via ${source || 'Website Form'}`, date: new Date().toLocaleString() }
      ]
    };

    db.leads.unshift(newLead);
    saveDb(db);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
