import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from '@/lib/auth';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const token = await getValidToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const res = await fetch(`${BACKEND_URL}/reports/expenses-pdf?from=${from || ''}&to=${to || ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { message: errorData?.message || "Failed to download PDF" }, 
        { status: res.status }
      );
    }

    // Proxy the PDF stream directly
    const buffer = await res.arrayBuffer();
    
    const displayDate = from === to ? from : `${from}-to-${to}`;
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=expense-report-${displayDate}.pdf`
      }
    });
  } catch (error: any) {
    console.error("PDF Proxy Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
