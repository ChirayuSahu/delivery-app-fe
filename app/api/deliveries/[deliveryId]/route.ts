import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest, { params }: { params: Promise<{ deliveryId: string }> }){

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { deliveryId } = await params;
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries/${deliveryId}?location=${location}`, {
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ deliveryId: string }> }){

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { deliveryId } = await params;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries/${deliveryId}`, {
            method: 'DELETE',
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
        return NextResponse.json({ message: "Failed to delete delivery" }, { status: 500 });
    }
}