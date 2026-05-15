import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
    const token = await getValidToken();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/transactions/transfer`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to process transfer" }, { status: 500 });
    }
}
