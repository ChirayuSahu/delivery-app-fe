import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest, { params }: { params: Promise<{ deliveryId: string }> }){
    const token = await getValidToken();
    const { deliveryId } = await params;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries/${deliveryId}/complete`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error){
        if(error instanceof Error){
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch routes" }, { status: 500 });
    }
}