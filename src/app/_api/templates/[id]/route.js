import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/data/dbHelper';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, name } = body;

    const db = getDb();
    const tmplIndex = db.templates.findIndex(t => t.id === id);

    if (tmplIndex === -1) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    if (content !== undefined) db.templates[tmplIndex].content = content;
    if (name !== undefined) db.templates[tmplIndex].name = name;

    saveDb(db);
    return NextResponse.json({ success: true, template: db.templates[tmplIndex] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
