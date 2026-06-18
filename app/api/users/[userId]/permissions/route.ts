import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { userId } = await params;
    const body = await request.json();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users/${userId}/permissions`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Permissions update error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to update permissions" }, { status: 500 });
    }
}
