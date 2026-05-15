import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

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
        const response = await fetch(`${BACKEND_URL}/reports/expenses-report?from=${from}&to=${to}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json({ message: data.message || "Failed to fetch report" }, { status: response.status });
        }
        const blob = await response.blob();

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename=expenses-report.xlsx'
            }
        });

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch report" }, { status: 500 });
    }
}
