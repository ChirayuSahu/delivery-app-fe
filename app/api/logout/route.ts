import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    if (token) {
        response.cookies.set({
            name: "token",
            value: "",
            maxAge: 0,
        });
    }

    return response;
}