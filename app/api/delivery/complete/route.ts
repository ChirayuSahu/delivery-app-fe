import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest){

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/delivery/complete/${id}`, {
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
        return NextResponse.json({ message: "Failed to create Delivery" }, { status: 500 });
    }

}