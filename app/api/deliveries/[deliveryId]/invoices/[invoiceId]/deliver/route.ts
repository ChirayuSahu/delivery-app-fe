import {
    NextRequest,
    NextResponse
} from 'next/server';

import { cookies } from 'next/headers';

const BACKEND_URL =
    process.env.BACKEND_URL;

export async function POST(
    request: NextRequest,

    {
        params
    }: {
        params: Promise<{
            deliveryId: string;
            invoiceId: string;
        }>;
    }
) {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get('token')?.value;

    const {
        deliveryId,
        invoiceId
    } = await params;

    if (!token) {
        return NextResponse.json(
            {
                message: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }

    try {
        const formData =
            await request.formData();

        const response =
            await fetch(
                `${BACKEND_URL}/deliveries/${deliveryId}/invoices/${invoiceId}/deliver`,
                {
                    method: 'POST',

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

        const data =
            await response.json();

        return NextResponse.json(
            data,
            {
                status:
                    response.status
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    message:
                        error.message
                },
                {
                    status: 500
                }
            );
        }

        return NextResponse.json(
            {
                message:
                    'Failed to deliver invoice'
            },
            {
                status: 500
            }
        );
    }
}