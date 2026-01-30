import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 心情类型定义
export const MOOD_TYPES = {
  happy: { emoji: '😊', label: '开心', color: '#FFD93D' },
  calm: { emoji: '😌', label: '平静', color: '#6BCB77' },
  sad: { emoji: '😢', label: '忧伤', color: '#4D96FF' },
  energetic: { emoji: '🔥', label: '燃', color: '#FF6B6B' },
  healing: { emoji: '💜', label: '治愈', color: '#C9B1FF' },
} as const

export type MoodType = keyof typeof MOOD_TYPES

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 格式化相对时间
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return formatDate(d)
}
