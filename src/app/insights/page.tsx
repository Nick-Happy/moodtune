'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, BarChart3, Loader2, Sparkles, TrendingUp, 
  Calendar, Music, RefreshCw, AlertCircle, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { MOOD_TYPES, MoodType } from '@/lib/utils'
import type { MoodEntry } from '@/types'

export default function InsightsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [hasApiKey, setHasApiKey] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 检查 API Key
      const { data: settings } = await supabase
        .from('user_settings')
        .select('ai_api_key, ai_provider')
        .eq('user_id', user.id)
        .single()

      setHasApiKey(!!settings?.ai_api_key && !!settings?.ai_provider)

      // 计算日期范围
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }

      // 获取记录
      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (data) {
        setEntries(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [router, period])

  // 计算统计数据
  const stats = {
    total: entries.length,
    byMood: (Object.keys(MOOD_TYPES) as MoodType[]).map(type => ({
      type,
      count: entries.filter(e => e.mood_type === type).length,
      percentage: entries.length > 0 
        ? Math.round((entries.filter(e => e.mood_type === type).length / entries.length) * 100)
        : 0,
    })).sort((a, b) => b.count - a.count),
    mostCommon: entries.length > 0 
      ? (Object.keys(MOOD_TYPES) as MoodType[]).reduce((a, b) => 
          entries.filter(e => e.mood_type === a).length >= entries.filter(e => e.mood_type === b).length ? a : b
        )
      : null,
    withMusic: entries.filter(e => e.music_url).length,
    avgPerDay: entries.length > 0
      ? (entries.length / getDaysInPeriod()).toFixed(1)
      : '0',
  }

  function getDaysInPeriod() {
    const now = new Date()
    switch (period) {
      case 'week': return 7
      case 'month': return now.getDate()
      case 'year': 
        const start = new Date(now.getFullYear(), 0, 1)
        return Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    }
  }

  // 生成 AI 洞察
  const generateInsight = async () => {
    if (!hasApiKey || entries.length === 0) return
    
    setGenerating(true)
    setAiInsight(null)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.map(e => ({
            date: e.created_at,
            mood: e.mood_type,
            content: e.content,
          })),
          period,
        }),
      })

      if (response.ok) {
        const { content } = await response.json()
        setAiInsight(content)
      } else {
        throw new Error('生成失败')
      }
    } catch (error) {
      console.error('生成洞察失败:', error)
    }

    setGenerating(false)
  }

  const periodLabels = {
    week: '本周',
    month: '本月',
    year: '今年',
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
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-mood-happy" />
            情绪洞察
          </h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* 时间段选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          {(['week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setPeriod(p)}
              className="rounded-full"
            >
              {periodLabels[p]}
            </Button>
          ))}
        </motion.div>

        {/* 统计概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" />
                总记录
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.avgPerDay}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                日均记录
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              {stats.mostCommon ? (
                <>
                  <p className="text-3xl">{MOOD_TYPES[stats.mostCommon].emoji}</p>
                  <p className="text-sm text-gray-500">最常心情</p>
                </>
              ) : (
                <>
                  <p className="text-3xl text-gray-300">-</p>
                  <p className="text-sm text-gray-500">暂无数据</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.withMusic}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Music className="w-4 h-4" />
                带音乐
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 心情分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">心情分布</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.byMood.map(({ type, count, percentage }) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{MOOD_TYPES[type].emoji}</span>
                      <span className="text-gray-700">{MOOD_TYPES[type].label}</span>
                    </span>
                    <span className="text-gray-500">{count} 次 ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: MOOD_TYPES[type].color }}
                    />
                  </div>
                </div>
              ))}

              {stats.total === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {periodLabels[period]}还没有心情记录
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI 洞察 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mood-healing" />
                AI 情绪洞察
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasApiKey ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    请先在<Link href="/settings" className="underline font-medium">设置页面</Link>配置 AI 服务
                  </p>
                </div>
              ) : entries.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  需要有心情记录才能生成洞察
                </p>
              ) : aiInsight ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    {aiInsight.split('\n').map((line, i) => (
                      <p key={i} className="text-gray-700">{line}</p>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={generateInsight}
                    disabled={generating}
                    className="w-full"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                    重新生成
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">
                    AI 将分析你{periodLabels[period]}的 {stats.total} 条心情记录，<br />
                    为你生成个性化的情绪洞察报告
                  </p>
                  <Button onClick={generateInsight} disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成洞察报告
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 最近记录 */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <span className="text-2xl">
                        {MOOD_TYPES[entry.mood_type as MoodType]?.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {entry.content || '(无文字)'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.created_at).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
