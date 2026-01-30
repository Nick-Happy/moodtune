'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Music, Link as LinkIcon, Sparkles, Send, LogOut, Settings, 
  BarChart3, MessageCircle, Radio, Plus, X 
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MoodSelector } from '@/components/mood-selector'
import { MoodCard } from '@/components/mood-card'
import { createClient } from '@/lib/supabase/client'
import { MoodType } from '@/lib/utils'
import type { MoodEntry } from '@/types'

export default function DiaryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 表单状态
  const [showForm, setShowForm] = useState(false)
  const [musicUrl, setMusicUrl] = useState('')
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [aiDetecting, setAiDetecting] = useState(false)
  
  // 音乐解析状态
  const [musicParsing, setMusicParsing] = useState(false)
  const [parsedMusic, setParsedMusic] = useState<{
    title: string
    artist: string
    cover: string | null
  } | null>(null)

  // 获取用户信息和记录
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // 获取用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 获取心情记录
      const { data: entries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (entries) {
        setEntries(entries)
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  // 退出登录
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // 解析音乐链接
  const handleMusicUrlChange = async (url: string) => {
    setMusicUrl(url)
    setParsedMusic(null)
    
    if (!url.trim()) return
    
    // 检测是否是音乐链接
    if (url.includes('music.163.com') || url.includes('y.qq.com') || url.includes('spotify.com')) {
      setMusicParsing(true)
      try {
        const response = await fetch('/api/music/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.title && data.title !== '未能解析的链接') {
            setParsedMusic({
              title: data.title,
              artist: data.artist,
              cover: data.cover,
            })
          }
        }
      } catch (error) {
        console.error('解析音乐链接失败:', error)
      }
      setMusicParsing(false)
    }
  }

  // AI 检测心情
  const handleAiDetect = async () => {
    if (!content.trim()) return
    
    setAiDetecting(true)
    
    try {
      const response = await fetch('/api/ai/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      })

      if (response.ok) {
        const { mood } = await response.json()
        setSelectedMood(mood)
      } else {
        // 如果 AI 失败，使用简单的关键词匹配作为降级
        const text = content.toLowerCase()
        if (text.includes('开心') || text.includes('高兴') || text.includes('快乐')) {
          setSelectedMood('happy')
        } else if (text.includes('难过') || text.includes('伤心') || text.includes('哭')) {
          setSelectedMood('sad')
        } else if (text.includes('平静') || text.includes('安静') || text.includes('放松')) {
          setSelectedMood('calm')
        } else if (text.includes('燃') || text.includes('激动') || text.includes('兴奋')) {
          setSelectedMood('energetic')
        } else {
          setSelectedMood('healing')
        }
      }
    } catch (error) {
      console.error('AI 检测失败:', error)
      // 降级处理
      setSelectedMood('calm')
    }
    
    setAiDetecting(false)
  }

  // 提交心情记录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          content: content.trim(),
          mood_type: selectedMood,
          music_url: musicUrl.trim() || null,
          music_title: parsedMusic?.title || null,
          music_artist: parsedMusic?.artist || null,
          music_cover: parsedMusic?.cover || null,
        })
        .select()
        .single()

      if (error) throw error

      // 添加到列表顶部
      if (data) {
        setEntries([data, ...entries])
      }

      // 重置表单
      setShowForm(false)
      setMusicUrl('')
      setContent('')
      setSelectedMood(null)
      setParsedMusic(null)
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">MoodTune</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/heatmap">
              <Button variant="ghost" size="icon" title="情绪图谱">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/insights">
              <Button variant="ghost" size="icon" title="情绪洞察">
                <Sparkles className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="icon" title="AI 陪聊">
                <MessageCircle className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/radio">
              <Button variant="ghost" size="icon" title="心情电台">
                <Radio className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="设置">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="退出">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 新建记录按钮 */}
        <AnimatePresence>
          {!showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full h-14 text-base gap-3"
              >
                <Plus className="w-5 h-5" />
                记录此刻的心情
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 新建记录表单 */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    记录心情
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 音乐链接 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      音乐链接（可选）
                    </label>
                    <Input
                      placeholder="粘贴网易云/QQ音乐/Spotify 链接..."
                      value={musicUrl}
                      onChange={(e) => handleMusicUrlChange(e.target.value)}
                    />
                    
                    {/* 解析中状态 */}
                    {musicParsing && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-primary rounded-full animate-spin" />
                        正在解析...
                      </div>
                    )}
                    
                    {/* 解析成功显示歌曲信息 */}
                    {parsedMusic && !musicParsing && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                      >
                        {parsedMusic.cover ? (
                          <img
                            src={parsedMusic.cover + '?param=60y60'}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Music className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {parsedMusic.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {parsedMusic.artist || '未知歌手'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMusicUrl('')
                            setParsedMusic(null)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* 心情文字 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      想说点什么？
                    </label>
                    <Textarea
                      placeholder="今天的心情怎么样..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 心情选择 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        选择心情
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAiDetect}
                        disabled={!content.trim() || aiDetecting}
                        className="text-mood-healing"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {aiDetecting ? 'AI 分析中...' : 'AI 识别'}
                      </Button>
                    </div>
                    <MoodSelector
                      selected={selectedMood}
                      onSelect={setSelectedMood}
                    />
                  </div>

                  {/* 提交按钮 */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!selectedMood}
                    loading={submitting}
                  >
                    <Send className="w-4 h-4" />
                    记录这一刻
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 历史记录 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            最近记录
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>还没有心情记录</p>
              <p className="text-sm mt-1">点击上方按钮开始记录</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MoodCard entry={entry} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
