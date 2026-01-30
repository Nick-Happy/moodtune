import { NextRequest, NextResponse } from 'next/server'
import { parseMusicUrl, extractSongId, fetchNeteaseSong } from '@/lib/music/parser'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: '请提供音乐链接' }, { status: 400 })
    }

    const musicInfo = await parseMusicUrl(url)

    if (!musicInfo) {
      return NextResponse.json({ error: '无法解析该链接' }, { status: 400 })
    }

    return NextResponse.json(musicInfo)
  } catch (error: any) {
    console.error('Music parse error:', error)
    return NextResponse.json(
      { error: error.message || '解析失败' },
      { status: 500 }
    )
  }
}

// 也支持 GET 请求方便测试
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: '请提供 url 参数' }, { status: 400 })
  }

  try {
    const musicInfo = await parseMusicUrl(url)
    return NextResponse.json(musicInfo || { error: '无法解析' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
