import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI, INSIGHT_PROMPT } from '@/lib/ai/providers'

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

    const { entries, period } = await request.json()

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: '没有可分析的数据' }, { status: 400 })
    }

    // 构建分析数据
    const periodLabels: Record<string, string> = {
      week: '本周',
      month: '本月',
      year: '今年',
    }

    const dataForAI = entries.map((e: any) => ({
      日期: new Date(e.date).toLocaleDateString('zh-CN'),
      心情: e.mood,
      内容: e.content || '(无文字)',
    }))

    const prompt = `${INSIGHT_PROMPT}

时间段：${periodLabels[period] || period}
记录数量：${entries.length} 条

心情记录数据：
${JSON.stringify(dataForAI, null, 2)}

请用温暖鼓励的语气，生成一份简洁的情绪洞察报告（300字以内）。`

    // 调用 AI
    const result = await callAI({
      provider: settings.ai_provider,
      apiKey: settings.ai_api_key,
      messages: [
        { role: 'user', content: prompt },
      ],
      maxTokens: 800,
      temperature: 0.7,
    })

    return NextResponse.json({ content: result.content })
  } catch (error: any) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: error.message || '生成洞察失败' },
      { status: 500 }
    )
  }
}
