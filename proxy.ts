import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export type JWTUser = {
  id: string
  email: string
  role: 'ADMIN' | 'SUPERVISOR' | 'DELIVERY_MAN'
  esId?: string
}

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

function roleDashboard(role: JWTUser['role']) {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin'
    case 'SUPERVISOR':
      return '/dashboard/supervisor'
    case 'DELIVERY_MAN':
      return '/dashboard/deliveryman'
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value


  if (pathname === '/login') {
    if (!token) return NextResponse.next()

    // verify token only once
    try {
      const { payload } = await jose.jwtVerify<JWTUser>(token, jwtSecret, {
        algorithms: ['HS256'],
      })
      return NextResponse.redirect(
        new URL(roleDashboard(payload.role), request.url)
      )
    } catch {
      return NextResponse.next()
    }
  }


  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }


  if (!token) return NextResponse.next()


  let payload: JWTUser
  try {
    const verified = await jose.jwtVerify<JWTUser>(token, jwtSecret, {
      algorithms: ['HS256'],
    })
    payload = verified.payload
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }


  if (pathname === '/dashboard') {
    return NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  }

  if (pathname.startsWith('/dashboard/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  }

  if (
    pathname.startsWith('/dashboard/supervisor') &&
    payload.role !== 'SUPERVISOR'
  ) {
    return NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  }

  if (
    pathname.startsWith('/dashboard/deliveryman') &&
    payload.role !== 'DELIVERY_MAN'
  ) {
    return NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
