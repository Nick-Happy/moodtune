import type { MusicInfo } from '@/types'

// 从 URL 中提取歌曲 ID
export function extractSongId(url: string): { platform: MusicInfo['platform']; id: string } | null {
  // 网易云音乐
  // https://music.163.com/#/song?id=123456
  // https://music.163.com/song?id=123456
  // https://y.music.163.com/m/song?id=123456
  const neteaseMatch = url.match(/music\.163\.com.*[?&]id=(\d+)/)
  if (neteaseMatch) {
    return { platform: 'netease', id: neteaseMatch[1] }
  }

  // QQ 音乐
  // https://y.qq.com/n/ryqq/songDetail/001234567
  // https://i.y.qq.com/v8/playsong.html?songmid=001234567
  const qqMatch1 = url.match(/y\.qq\.com.*songDetail\/(\w+)/)
  const qqMatch2 = url.match(/songmid=(\w+)/)
  if (qqMatch1) {
    return { platform: 'qqmusic', id: qqMatch1[1] }
  }
  if (qqMatch2) {
    return { platform: 'qqmusic', id: qqMatch2[1] }
  }

  // Spotify
  // https://open.spotify.com/track/1234567890
  const spotifyMatch = url.match(/open\.spotify\.com\/track\/(\w+)/)
  if (spotifyMatch) {
    return { platform: 'spotify', id: spotifyMatch[1] }
  }

  return null
}

// 获取网易云音乐信息
export async function fetchNeteaseSong(songId: string): Promise<MusicInfo | null> {
  try {
    // 使用网易云音乐的公开 API
    const detailUrl = `https://music.163.com/api/song/detail/?ids=[${songId}]`
    
    const response = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
      },
    })

    if (!response.ok) {
      console.error('NetEase API error:', response.status)
      return null
    }

    const data = await response.json()
    
    if (data.songs && data.songs.length > 0) {
      const song = data.songs[0]
      return {
        title: song.name,
        artist: song.artists?.map((a: any) => a.name).join(' / ') || '未知歌手',
        cover: song.album?.picUrl || null,
        url: `https://music.163.com/#/song?id=${songId}`,
        platform: 'netease',
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch NetEase song:', error)
    return null
  }
}

// 获取 QQ 音乐信息（简化版，实际需要更复杂的 API 调用）
export async function fetchQQMusicSong(songMid: string): Promise<MusicInfo | null> {
  // QQ 音乐 API 较复杂，这里返回基础信息
  return {
    title: '未能解析',
    artist: '未知歌手',
    cover: null,
    url: `https://y.qq.com/n/ryqq/songDetail/${songMid}`,
    platform: 'qqmusic',
  }
}

// 解析音乐链接
export async function parseMusicUrl(url: string): Promise<MusicInfo | null> {
  const extracted = extractSongId(url)
  
  if (!extracted) {
    return {
      title: '未能解析的链接',
      artist: '',
      cover: null,
      url,
      platform: 'unknown',
    }
  }

  switch (extracted.platform) {
    case 'netease':
      return fetchNeteaseSong(extracted.id)
    case 'qqmusic':
      return fetchQQMusicSong(extracted.id)
    case 'spotify':
      // Spotify 需要 OAuth，简化处理
      return {
        title: 'Spotify 歌曲',
        artist: '',
        cover: null,
        url,
        platform: 'spotify',
      }
    default:
      return null
  }
}
