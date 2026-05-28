import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ deliveryId: string }> }){
    const token = await getValidToken();
    const { deliveryId } = await params;
    const body = await request.json();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries/${deliveryId}/expense`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error){
        if(error instanceof Error){
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to update delivery expense" }, { status: 500 });
    }
}
