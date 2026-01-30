'use client'

import { motion } from 'framer-motion'
import { cn, MOOD_TYPES, MoodType } from '@/lib/utils'

interface MoodSelectorProps {
  selected: MoodType | null
  onSelect: (mood: MoodType) => void
  disabled?: boolean
}

export function MoodSelector({ selected, onSelect, disabled }: MoodSelectorProps) {
  const moods = Object.entries(MOOD_TYPES) as [MoodType, typeof MOOD_TYPES[MoodType]][]

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {moods.map(([type, mood]) => (
        <motion.button
          key={type}
          type="button"
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && onSelect(type)}
          disabled={disabled}
          className={cn(
            'w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all',
            'border-2 border-transparent',
            selected === type 
              ? 'border-gray-900 shadow-lg scale-110' 
              : 'hover:shadow-md',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ backgroundColor: mood.color }}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium text-white/90 mt-0.5">
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
