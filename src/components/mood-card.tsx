'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Music, Calendar } from 'lucide-react'
import { MOOD_TYPES, formatRelativeTime, MoodType } from '@/lib/utils'
import type { MoodEntry } from '@/types'

interface MoodCardProps {
  entry: MoodEntry
  onClick?: () => void
}

export function MoodCard({ entry, onClick }: MoodCardProps) {
  const mood = MOOD_TYPES[entry.mood_type as MoodType]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* 顶部色条 */}
      <div 
        className="h-2"
        style={{ backgroundColor: mood?.color || '#E5E7EB' }}
      />
      
      <div className="p-4">
        {/* 歌曲信息 */}
        {entry.music_title && (
          <div className="flex items-center gap-3 mb-3">
            {entry.music_cover ? (
              <Image
                src={entry.music_cover}
                alt={entry.music_title}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Music className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {entry.music_title}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {entry.music_artist || '未知歌手'}
              </p>
            </div>
          </div>
        )}

        {/* 心情文字 */}
        {entry.content && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {entry.content}
          </p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{mood?.emoji}</span>
            <span className="text-sm text-gray-500">{mood?.label}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Calendar className="w-3 h-3" />
            {formatRelativeTime(entry.created_at)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
