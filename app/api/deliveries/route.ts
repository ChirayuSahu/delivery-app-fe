import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries?date=${date}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const refreshToken = cookieStore.get('refreshToken')?.value;
            if (!refreshToken) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }

            // Try to refresh token
            const refreshResponse = await fetch(`${BACKEND_URL}/auth/token?refreshToken=${refreshToken}`, {
                method: 'GET',
            });

            const refreshData = await refreshResponse.json();

            if (!refreshResponse.ok) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }

            // Update cookies
            cookieStore.set("token", refreshData.data.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            });
        }

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch routes" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/deliveries`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch routes" }, { status: 500 });
    }
}
