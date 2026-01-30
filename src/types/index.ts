import { MoodType } from '@/lib/utils'

// 心情记录
export interface MoodEntry {
  id: string
  user_id: string
  content: string
  mood_type: MoodType
  music_url: string | null
  music_title: string | null
  music_artist: string | null
  music_cover: string | null
  ai_analysis: AIAnalysis | null
  created_at: string
  updated_at: string
}

// AI 分析结果
export interface AIAnalysis {
  detected_mood: MoodType
  confidence: number
  keywords: string[]
  summary?: string
}

// 用户设置
export interface UserSettings {
  user_id: string
  ai_provider: AIProvider
  ai_api_key: string | null
  theme: 'light' | 'dark' | 'system'
  created_at: string
  updated_at: string
}

// AI 服务商
export type AIProvider = 
  | 'openai'
  | 'anthropic'
  | 'zhipu'
  | 'qwen'
  | 'wenxin'
  | null

// AI 服务商信息
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    placeholder: 'sk-...',
  },
  anthropic: {
    name: 'Claude (Anthropic)',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    placeholder: 'sk-ant-...',
  },
  zhipu: {
    name: '智谱 GLM',
    models: ['glm-4-plus', 'glm-4-flash'],
    placeholder: 'your-api-key',
  },
  qwen: {
    name: '通义千问',
    models: ['qwen-max', 'qwen-plus'],
    placeholder: 'sk-...',
  },
  wenxin: {
    name: '文心一言',
    models: ['ernie-4.0', 'ernie-3.5'],
    placeholder: 'your-api-key',
  },
} as const

// 音乐信息
export interface MusicInfo {
  title: string
  artist: string
  cover: string | null
  url: string
  platform: 'netease' | 'qqmusic' | 'spotify' | 'unknown'
}

// 聊天消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// 情绪报告
export interface MoodReport {
  period: 'week' | 'month' | 'year'
  start_date: string
  end_date: string
  total_entries: number
  mood_distribution: Record<MoodType, number>
  most_common_mood: MoodType
  insights: string[]
  highlights: {
    date: string
    mood: MoodType
    description: string
  }[]
}
