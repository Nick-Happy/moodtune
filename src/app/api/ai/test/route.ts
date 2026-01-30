import { NextRequest, NextResponse } from 'next/server'
import type { AIProvider } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json() as {
      provider: AIProvider
      apiKey: string
    }

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 根据 provider 直接测试 API
    let testUrl: string
    let testHeaders: Record<string, string>
    let testBody: any

    switch (provider) {
      case 'openai':
        testUrl = 'https://api.openai.com/v1/chat/completions'
        testHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        }
        testBody = {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
        }
        break

      case 'anthropic':
        testUrl = 'https://api.anthropic.com/v1/messages'
        testHeaders = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        }
        testBody = {
          model: 'claude-3-haiku-20240307',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say "ok"' }],
        }
        break

      case 'zhipu':
        testUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        testHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        }
        testBody = {
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: '说 ok' }],
          max_tokens: 5,
        }
        break

      case 'qwen':
        testUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        testHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        }
        testBody = {
          model: 'qwen-turbo',
          messages: [{ role: 'user', content: '说 ok' }],
          max_tokens: 5,
        }
        break

      default:
        return NextResponse.json({ error: '不支持的服务商' }, { status: 400 })
    }

    console.log(`Testing ${provider} API...`)
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify(testBody),
    })

    const responseText = await response.text()
    console.log(`${provider} response status:`, response.status)
    console.log(`${provider} response:`, responseText.substring(0, 500))

    if (!response.ok) {
      // 解析错误信息
      let errorMessage = '连接失败'
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData.error?.code) {
          errorMessage = `错误代码: ${errorData.error.code}`
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${responseText.substring(0, 100)}`
      }
      
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('AI test error:', error)
    return NextResponse.json(
      { error: error.message || '网络连接失败，请检查网络' },
      { status: 500 }
    )
  }
}
