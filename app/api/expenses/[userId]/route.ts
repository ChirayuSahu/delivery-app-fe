import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const token = await getValidToken();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let url = `${BACKEND_URL}/expenses/${userId}`;
    const queryParams = new URLSearchParams();
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch user expenses" }, { status: 500 });
    }
}
