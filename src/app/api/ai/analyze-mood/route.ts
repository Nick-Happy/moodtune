import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI, MOOD_ANALYSIS_PROMPT } from '@/lib/ai/providers'
import type { MoodType } from '@/lib/utils'

interface MoodAnalysisResult {
  mood: MoodType
  confidence: number
  keywords: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户的 AI 设置
    const { data: settings } = await supabase
      .from('user_settings')
      .select('ai_provider, ai_api_key')
      .eq('user_id', user.id)
      .single()

    if (!settings?.ai_provider || !settings?.ai_api_key) {
      return NextResponse.json({ error: '请先配置 AI 服务' }, { status: 400 })
    }

    const { text } = await request.json()

    if (!text || text.trim().length < 2) {
      return NextResponse.json({ error: '文字太短，无法分析' }, { status: 400 })
    }

    // 调用 AI 分析心情
    const result = await callAI({
      provider: settings.ai_provider,
      apiKey: settings.ai_api_key,
      messages: [
        { role: 'system', content: MOOD_ANALYSIS_PROMPT },
        { role: 'user', content: text },
      ],
      maxTokens: 200,
      temperature: 0.3, // 低温度以获得更稳定的结果
    })

    // 解析 AI 返回的 JSON
    let analysis: MoodAnalysisResult
    try {
      // 尝试提取 JSON
      const jsonMatch = result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch {
      // 解析失败，使用默认值
      analysis = {
        mood: 'calm',
        confidence: 0.5,
        keywords: [],
      }
    }

    // 验证 mood 类型
    const validMoods: MoodType[] = ['happy', 'calm', 'sad', 'energetic', 'healing']
    if (!validMoods.includes(analysis.mood)) {
      analysis.mood = 'calm'
    }

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Mood analysis error:', error)
    return NextResponse.json(
      { error: error.message || '分析失败' },
      { status: 500 }
    )
  }
}
