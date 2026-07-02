import { NextResponse } from 'next/server';
import pool from '../../../src/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ success: false, error: 'Missing patientId' }, { status: 400 });
    }

    const [vitalRows] = await pool.execute(
      'SELECT * FROM vital_records WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 50',
      [patientId]
    );
    
    const [predRows] = await pool.execute(
      'SELECT * FROM predictions WHERE patient_id = ? ORDER BY predicted_at DESC LIMIT 50',
      [patientId]
    );

    return NextResponse.json({ success: true, vitals: vitalRows, predictions: predRows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
