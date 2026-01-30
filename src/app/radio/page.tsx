'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Radio, Shuffle, Music, Play, Pause, 
  SkipForward, Loader2, ExternalLink, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { MOOD_TYPES, MoodType } from '@/lib/utils'
import type { MoodEntry } from '@/types'

export default function RadioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all')
  const [currentEntry, setCurrentEntry] = useState<MoodEntry | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [history, setHistory] = useState<MoodEntry[]>([])

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 获取所有带音乐的记录
      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .not('music_url', 'is', null)
        .order('created_at', { ascending: false })

      if (data) {
        setEntries(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  // 获取过滤后的列表
  const filteredEntries = selectedMood === 'all'
    ? entries
    : entries.filter(e => e.mood_type === selectedMood)

  // 随机播放
  const playRandom = () => {
    if (filteredEntries.length === 0) return

    // 尝试避免重复
    const available = filteredEntries.filter(e => e.id !== currentEntry?.id)
    const pool = available.length > 0 ? available : filteredEntries
    
    const randomIndex = Math.floor(Math.random() * pool.length)
    const entry = pool[randomIndex]
    
    setCurrentEntry(entry)
    setIsPlaying(true)
    
    // 添加到历史
    if (currentEntry) {
      setHistory(prev => [currentEntry, ...prev].slice(0, 10))
    }
  }

  // 下一首
  const playNext = () => {
    playRandom()
  }

  // 切换播放/暂停
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // 播放历史中的歌曲
  const playFromHistory = (entry: MoodEntry) => {
    if (currentEntry) {
      setHistory(prev => [currentEntry, ...prev.filter(e => e.id !== entry.id)].slice(0, 10))
    }
    setCurrentEntry(entry)
    setIsPlaying(true)
  }

  // 打开音乐链接
  const openMusicLink = () => {
    if (currentEntry?.music_url) {
      window.open(currentEntry.music_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-mood-energetic" />
            心情电台
          </h1>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 心情选择器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm text-gray-500 mb-3 text-center">选择心情，随机播放</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedMood === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedMood('all')}
              className="rounded-full"
            >
              <Shuffle className="w-4 h-4 mr-1" />
              全部 ({entries.length})
            </Button>
            {(Object.entries(MOOD_TYPES) as [MoodType, typeof MOOD_TYPES[MoodType]][]).map(([type, mood]) => {
              const count = entries.filter(e => e.mood_type === type).length
              return (
                <Button
                  key={type}
                  variant={selectedMood === type ? 'default' : 'outline'}
                  onClick={() => setSelectedMood(type)}
                  className="rounded-full"
                  style={{
                    ...(selectedMood === type ? { background: mood.color } : {}),
                  }}
                >
                  <span className="mr-1">{mood.emoji}</span>
                  {mood.label} ({count})
                </Button>
              )
            })}
          </div>
        </motion.div>

        {/* 当前播放 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8"
        >
          {/* 封面区域 */}
          <div 
            className="aspect-square relative flex items-center justify-center"
            style={{
              background: currentEntry 
                ? `linear-gradient(135deg, ${MOOD_TYPES[currentEntry.mood_type as MoodType]?.color}40, ${MOOD_TYPES[currentEntry.mood_type as MoodType]?.color}10)`
                : 'linear-gradient(135deg, #f5f5f5, #e5e5e5)',
            }}
          >
            {currentEntry ? (
              <>
                {currentEntry.music_cover ? (
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-48 h-48 rounded-full overflow-hidden shadow-xl"
                  >
                    <Image
                      src={currentEntry.music_cover}
                      alt={currentEntry.music_title || ''}
                      width={192}
                      height={192}
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center shadow-xl"
                  >
                    <Music className="w-20 h-20 text-gray-400" />
                  </motion.div>
                )}
                
                {/* 播放状态指示 */}
                {isPlaying && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 20, 8] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="w-1 bg-white/80 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <Music className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">点击下方按钮开始播放</p>
              </div>
            )}
          </div>

          {/* 歌曲信息 */}
          <div className="p-6">
            {currentEntry ? (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {currentEntry.music_title || '未知歌曲'}
                </h2>
                <p className="text-gray-500">
                  {currentEntry.music_artist || '未知歌手'}
                </p>
                {currentEntry.content && (
                  <p className="mt-3 text-sm text-gray-600 italic">
                    "{currentEntry.content}"
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: `${MOOD_TYPES[currentEntry.mood_type as MoodType]?.color}20`,
                    color: MOOD_TYPES[currentEntry.mood_type as MoodType]?.color,
                  }}
                >
                  <span>{MOOD_TYPES[currentEntry.mood_type as MoodType]?.emoji}</span>
                  <span>{MOOD_TYPES[currentEntry.mood_type as MoodType]?.label}</span>
                </div>
              </div>
            ) : (
              <div className="text-center mb-6 py-4">
                <p className="text-gray-400">还没有开始播放</p>
              </div>
            )}

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={openMusicLink}
                disabled={!currentEntry?.music_url}
                title="打开原链接"
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                disabled={!currentEntry}
                className="w-14 h-14 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>

              <Button
                onClick={playRandom}
                disabled={filteredEntries.length === 0}
                className="w-14 h-14 rounded-full"
              >
                {currentEntry ? (
                  <SkipForward className="w-6 h-6" />
                ) : (
                  <Shuffle className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                title="喜欢"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 播放历史 */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-3">最近播放</h3>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {history.map((entry) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => playFromHistory(entry)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    {entry.music_cover ? (
                      <Image
                        src={entry.music_cover}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Music className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {entry.music_title || '未知歌曲'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {entry.music_artist || '未知歌手'}
                      </p>
                    </div>
                    <span className="text-xl">
                      {MOOD_TYPES[entry.mood_type as MoodType]?.emoji}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* 空状态 */}
        {entries.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">还没有带音乐的心情记录</p>
            <Link href="/diary">
              <Button variant="outline">去记录心情</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
