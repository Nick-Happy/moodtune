import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI, CHAT_SYSTEM_PROMPT } from '@/lib/ai/providers'

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

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    // 获取用户最近的心情记录，作为上下文
    const { data: recentMoods } = await supabase
      .from('mood_entries')
      .select('content, mood_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // 构建上下文增强的系统提示
    let enhancedSystemPrompt = CHAT_SYSTEM_PROMPT
    if (recentMoods && recentMoods.length > 0) {
      enhancedSystemPrompt += `\n\n用户最近的心情记录：\n`
      recentMoods.forEach(mood => {
        enhancedSystemPrompt += `- ${mood.mood_type}: "${mood.content || '(无文字)'}"\n`
      })
    }

    // 构建消息
    const messages = [
      { role: 'system' as const, content: enhancedSystemPrompt },
      ...(history || []),
      { role: 'user' as const, content: message },
    ]

    // 调用 AI
    const result = await callAI({
      provider: settings.ai_provider,
      apiKey: settings.ai_api_key,
      messages,
      maxTokens: 500,
      temperature: 0.8,
    })

    return NextResponse.json({ content: result.content })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || '聊天失败' },
      { status: 500 }
    )
  }
}
