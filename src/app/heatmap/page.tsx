'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { MOOD_TYPES, MoodType } from '@/lib/utils'
import type { MoodEntry } from '@/types'

export default function HeatmapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 获取指定年份的所有记录
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false })

      if (data) {
        setEntries(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [router, year])

  // 生成日历数据
  const generateCalendarData = () => {
    const weeks: { date: Date; mood: MoodType | null }[][] = []
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31)
    
    // 找到年初第一个周日
    const firstSunday = new Date(startOfYear)
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay())
    
    // 创建日期到心情的映射
    const dateToMood = new Map<string, MoodType>()
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0]
      // 只保留当天最后一条记录的心情
      if (!dateToMood.has(date)) {
        dateToMood.set(date, entry.mood_type as MoodType)
      }
    })

    let currentDate = new Date(firstSunday)
    let currentWeek: { date: Date; mood: MoodType | null }[] = []

    while (currentDate <= endOfYear || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const isInYear = currentDate.getFullYear() === year
      
      currentWeek.push({
        date: new Date(currentDate),
        mood: isInYear ? dateToMood.get(dateStr) || null : null,
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
      
      // 超过年末并且当前周已完成
      if (currentDate > endOfYear && currentWeek.length === 0) {
        break
      }
    }

    return weeks
  }

  // 获取某天的记录
  const getEntryForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.find(e => e.created_at.startsWith(dateStr))
  }

  // 点击日期
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const entry = getEntryForDate(date)
    setSelectedDate(dateStr)
    setSelectedEntry(entry || null)
  }

  // 统计数据
  const stats = {
    total: entries.length,
    byMood: Object.keys(MOOD_TYPES).reduce((acc, mood) => {
      acc[mood as MoodType] = entries.filter(e => e.mood_type === mood).length
      return acc
    }, {} as Record<MoodType, number>),
  }

  const weeks = generateCalendarData()
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-mood-calm" />
            年度情绪图谱
          </h1>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 年份选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear(y => y - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-2xl font-bold text-gray-900">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear(y => y + 1)}
            disabled={year >= new Date().getFullYear()}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">总记录数</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            {(Object.entries(MOOD_TYPES) as [MoodType, typeof MOOD_TYPES[MoodType]][]).map(([type, mood]) => (
              <div key={type} className="text-center">
                <p className="text-2xl font-bold" style={{ color: mood.color }}>
                  {stats.byMood[type] || 0}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{mood.emoji}</span>
                  {mood.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 热力图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto"
        >
          {/* 月份标签 */}
          <div className="flex mb-2 pl-8">
            {months.map((month, i) => (
              <div
                key={month}
                className="text-xs text-gray-400"
                style={{ width: `${100 / 12}%`, minWidth: 60 }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* 日历格子 */}
          <div className="flex gap-1">
            {/* 星期标签 */}
            <div className="flex flex-col gap-1 pr-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                <div
                  key={day}
                  className="w-4 h-4 text-xs text-gray-400 flex items-center justify-center"
                  style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 周列 */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const isCurrentYear = day.date.getFullYear() === year
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const dateStr = day.date.toISOString().split('T')[0]
                  
                  return (
                    <motion.button
                      key={dayIndex}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => isCurrentYear && handleDateClick(day.date)}
                      className={`w-4 h-4 rounded-sm transition-all ${
                        !isCurrentYear 
                          ? 'bg-transparent cursor-default' 
                          : day.mood 
                            ? 'cursor-pointer' 
                            : 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                      } ${isToday ? 'ring-2 ring-gray-400 ring-offset-1' : ''} ${
                        selectedDate === dateStr ? 'ring-2 ring-brand-primary ring-offset-1' : ''
                      }`}
                      style={{
                        backgroundColor: isCurrentYear && day.mood 
                          ? MOOD_TYPES[day.mood].color 
                          : undefined,
                      }}
                      title={isCurrentYear ? `${dateStr}${day.mood ? ` - ${MOOD_TYPES[day.mood].label}` : ''}` : ''}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">无记录</span>
            <div className="w-4 h-4 rounded-sm bg-gray-100" />
            <span className="text-xs text-gray-400 mx-2">→</span>
            {(Object.entries(MOOD_TYPES) as [MoodType, typeof MOOD_TYPES[MoodType]][]).map(([type, mood]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: mood.color }}
                />
                <span className="text-xs text-gray-500">{mood.emoji}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 选中日期的详情 */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">
              {new Date(selectedDate).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </h3>
            
            {selectedEntry ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {MOOD_TYPES[selectedEntry.mood_type as MoodType]?.emoji}
                  </span>
                  <span className="font-medium text-gray-700">
                    {MOOD_TYPES[selectedEntry.mood_type as MoodType]?.label}
                  </span>
                </div>
                {selectedEntry.content && (
                  <p className="text-gray-600">{selectedEntry.content}</p>
                )}
                {selectedEntry.music_title && (
                  <p className="text-sm text-gray-500">
                    🎵 {selectedEntry.music_title}
                    {selectedEntry.music_artist && ` - ${selectedEntry.music_artist}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">这一天没有心情记录</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
