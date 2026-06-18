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


  if (pathname === '/login' || pathname === '/') {
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
  let newToken: string | undefined

  try {
    const verified = await jose.jwtVerify<JWTUser>(token || '', jwtSecret, {
      algorithms: ['HS256'],
    })
    payload = verified.payload
  } catch (err) {
    // Attempt to refresh if token is expired/invalid but refreshToken exists
    if (refreshToken) {
      try {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/token?refreshToken=${refreshToken}`)
        const json = await res.json()
        if (res.ok && json.success && json.data.token) {
          newToken = json.data.token
          const verified = await jose.jwtVerify<JWTUser>(newToken!, jwtSecret, {
            algorithms: ['HS256'],
          })
          payload = verified.payload
        } else {
          return NextResponse.redirect(new URL('/login', request.url))
        }
      } catch {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  if (newToken) {
    requestHeaders.set('cookie', `token=${newToken}; refreshToken=${refreshToken || ''}`)
  }

  let response: NextResponse
  
  if (pathname.startsWith('/dashboard/admin') && payload.role !== 'ADMIN') {
    response = NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  } else if (
    pathname.startsWith('/dashboard/supervisor') &&
    payload.role !== 'SUPERVISOR'
  ) {
    response = NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  } else if (
    pathname.startsWith('/dashboard/deliveryman') &&
    payload.role !== 'DELIVERY_MAN'
  ) {
    response = NextResponse.redirect(
      new URL(roleDashboard(payload.role), request.url)
    )
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (newToken) {
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
}
