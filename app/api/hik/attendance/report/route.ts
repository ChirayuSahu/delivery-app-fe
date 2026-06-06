import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        
        let targetUrl = `${process.env.BACKEND_URL}/hik/attendance/report`;
        if (date) {
            targetUrl += `?date=${date}`;
        }
        
        // Fetch from backend
        const backendRes = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // If there's authentication token needed, add it here. e.g.,
                // 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
            },
        });
        
        if (!backendRes.ok) {
            const errorText = await backendRes.text();
            console.error('Backend report error:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch report from backend', details: errorText },
                { status: backendRes.status }
            );
        }
        
        // Return the response as a blob/file to the client
        const headers = new Headers();
        
        // Pass through content-type and content-disposition if the backend sets them
        const contentType = backendRes.headers.get('content-type');
        const contentDisposition = backendRes.headers.get('content-disposition');
        
        if (contentType) headers.set('Content-Type', contentType);
        else headers.set('Content-Type', 'application/octet-stream');
        
        if (contentDisposition) headers.set('Content-Disposition', contentDisposition);
        else {
            const displayDate = date || 'today';
            headers.set('Content-Disposition', `attachment; filename="attendance-report-${displayDate}.pdf"`);
        }
        
        return new NextResponse(backendRes.body, {
            status: 200,
            headers,
        });
        
    } catch (error: any) {
        console.error('Proxy error generating report:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}
