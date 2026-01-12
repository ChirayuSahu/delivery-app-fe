import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(req: NextRequest) {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const backendUrl = new URL(`${BACKEND_URL}/reports/delivery-report`);

    if (from) backendUrl.searchParams.set('from', from);
    if (to) backendUrl.searchParams.set('to', to);

    const backendRes = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers: {
            cookie: req.headers.get('cookie') || '',
            authorization: 'Bearer ' + token,
        },
    });

    if (!backendRes.ok) {
        const text = await backendRes.text();
        console.error('Backend error:', backendRes.status, text);

        return new Response(
            `Failed to fetch report: ${backendRes.status}`,
            { status: backendRes.status }
        );
    }

    return new Response(backendRes.body, {
        status: 200,
        headers: {
            'Content-Type':
                backendRes.headers.get('content-type') ||
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition':
                backendRes.headers.get('content-disposition') ||
                'attachment; filename=invoice-report.xlsx',
        },
    });
}
