import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ deliveryId: string, invoiceId: string }> }){

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { deliveryId, invoiceId } = await params;

    const invType = invoiceId.slice(0, 2).toUpperCase();
    const invNo = invoiceId.slice(2).toUpperCase();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        
        const response = await fetch(`${BACKEND_URL}/deliveries/${deliveryId}/invoices/${invType}/${invNo}/expense`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        return NextResponse.json({ message: "Failed to update expense" }, { status: 500 });
    }
}
