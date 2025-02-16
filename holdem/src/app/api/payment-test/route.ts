import { NextRequest } from 'next/server';
import { createPayment } from '@/lib/main';

export async function POST(req: NextRequest) {
  try {
    const { positions } = await req.json();
    
    if (!Array.isArray(positions) || positions.length !== 3) {
      return new Response(JSON.stringify({ error: 'Invalid positions array. Must be exactly 3 numbers.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payments = await createPayment(positions);
    
    return new Response(JSON.stringify({ payments }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Payment test error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 