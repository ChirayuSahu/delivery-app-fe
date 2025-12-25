import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get('invoice');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || '';

    try {
        const response = await fetch(`${BACKEND_URL}/orders/status/${encodeURIComponent(invoice || '')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: data.message || 'Failed to fetch order status' }, { status: response.status });
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}