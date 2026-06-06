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
    const res = await fetch(`${BACKEND_URL}/reports/attendance?from=${from || ''}&to=${to || ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { message: errorData?.message || "Failed to download Excel" }, 
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=attendance-report-${from}-to-${to}.xlsx`
      }
    });
  } catch (error: any) {
    console.error("Excel Proxy Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
