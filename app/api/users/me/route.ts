import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
    const token = await getValidToken();

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return NextResponse.json({ message: errData.message || "Failed to fetch user data" }, { status: response.status });
        }

        const json = await response.json();
        // Support enveloped success responses (e.g. { success: true, data: { ... } })
        const rawUser = json.success && json.data ? json.data : (json.data || json);

        const formattedUser = {
            id: rawUser.id,
            name: rawUser.name,
            email: rawUser.email,
            phone: rawUser.phone,
            esId: rawUser.esId,
            role: rawUser.role,
            wallet: rawUser.wallet,
            permissions: rawUser.permissions || [],
            createdAt: rawUser.createdAt,
            updatedAt: rawUser.updatedAt
        };

        return NextResponse.json({ success: true, data: formattedUser }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch user me proxy:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch user profile" }, { status: 500 });
    }
}
