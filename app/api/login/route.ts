import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {

    const { email, password } = await request.json();
    const cookieStore = await cookies();

    try {

        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: data.message || "Login failed" }, { status: response.status });
        }

        // Set cookie
        cookieStore.set("token", data.data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 60 * 60 * 12,
        });

        cookieStore.set("refreshToken", data.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ message: "Login successful", token: data.data.token }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : error },
            { status: 500 }
        );
    }
}