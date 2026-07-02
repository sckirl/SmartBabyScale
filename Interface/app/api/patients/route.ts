import { NextResponse } from 'next/server';
import pool from '../../../src/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const [result] = await pool.execute(
      `INSERT INTO patients (mrn, full_name, dob, gender, birth_weight_g, gestational_age_weeks, parent_name, contact_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.mrn || `MRN-${Date.now()}`,
        data.full_name || 'Bayi Anonim',
        data.dob || null,
        data.gender || 'L',
        data.birth_weight_g || 3100,
        data.gestational_age_weeks || 38,
        data.parent_name || '',
        data.contact_number || '',
        'active'
      ]
    );
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM patients WHERE status = "active" ORDER BY id DESC');
    return NextResponse.json({ success: true, patients: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
