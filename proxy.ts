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

  /* ---------- PUBLIC ---------- */

  if (pathname === '/login' && !token) {
    return NextResponse.next()
  }

  /* ---------- AUTH REQUIRED ---------- */

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!token) {
    return NextResponse.next()
  }

  /* ---------- VERIFY ---------- */

  let payload: JWTUser
  try {
    const verified = await jose.jwtVerify<JWTUser>(token, jwtSecret, {
      algorithms: ['HS256'],
    })
    payload = verified.payload
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  /* ---------- BLOCK LOGIN ---------- */

  if (pathname === '/login') {
    return NextResponse.redirect(new URL(roleDashboard(payload.role), request.url))
  }

  /* ---------- DASHBOARD ROOT ---------- */

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(roleDashboard(payload.role), request.url))
  }

  /* ---------- ROLE GUARDS ---------- */

  if (
    pathname.startsWith('/dashboard/admin') &&
    payload.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL(roleDashboard(payload.role), request.url))
  }

  if (
    pathname.startsWith('/dashboard/supervisor') &&
    payload.role !== 'SUPERVISOR'
  ) {
    return NextResponse.redirect(new URL(roleDashboard(payload.role), request.url))
  }

  if (
    pathname.startsWith('/dashboard/deliveryman') &&
    payload.role !== 'DELIVERY_MAN'
  ) {
    return NextResponse.redirect(new URL(roleDashboard(payload.role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
}
