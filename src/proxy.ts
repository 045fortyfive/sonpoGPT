import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    // 許可するIPアドレスのリスト
    const allowedIPs = ['182.169.22.84', '162.120.184.18']

    // クライアントのIPアドレスを取得
    const clientIP = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip')

    // IPアドレスが取得できない、または許可リストにない場合はアクセス拒否
    if (!clientIP || !allowedIPs.some(ip => clientIP.includes(ip))) {
        return NextResponse.redirect(new URL('/access-denied', request.url))
    }

    return NextResponse.next()
}

// 適用するパスを指定（API、静的ファイル、画像、faviconを除外）
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|access-denied).*)'],
}
