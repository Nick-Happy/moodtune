import type { AIProvider } from '@/types'

// AI 请求参数
interface AIRequestOptions {
  provider: AIProvider
  apiKey: string
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  maxTokens?: number
  temperature?: number
}

// AI 响应结果
interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

// OpenAI 兼容接口调用
async function callOpenAICompatible(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: AIRequestOptions['messages'],
  maxTokens = 1000,
  temperature = 0.7
): Promise<AIResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI API Error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
    } : undefined,
  }
}

// Claude API 调用
async function callClaude(
  apiKey: string,
  messages: AIRequestOptions['messages'],
  maxTokens = 1000,
  temperature = 0.7
): Promise<AIResponse> {
  // 提取 system message
  const systemMessage = messages.find(m => m.role === 'system')?.content
  const chatMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemMessage,
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API Error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
    },
  }
}

// 智谱 GLM API 调用
async function callZhipu(
  apiKey: string,
  messages: AIRequestOptions['messages'],
  maxTokens = 1000,
  temperature = 0.7
): Promise<AIResponse> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`智谱 API Error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
    } : undefined,
  }
}

// 通义千问 API 调用
async function callQwen(
  apiKey: string,
  messages: AIRequestOptions['messages'],
  maxTokens = 1000,
  temperature = 0.7
): Promise<AIResponse> {
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`通义 API Error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
    } : undefined,
  }
}

// 统一的 AI 调用接口
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const { provider, apiKey, messages, maxTokens, temperature } = options

  switch (provider) {
    case 'openai':
      return callOpenAICompatible(
        'https://api.openai.com/v1',
        'gpt-4o-mini',
        apiKey,
        messages,
        maxTokens,
        temperature
      )
    
    case 'anthropic':
      return callClaude(apiKey, messages, maxTokens, temperature)
    
    case 'zhipu':
      return callZhipu(apiKey, messages, maxTokens, temperature)
    
    case 'qwen':
      return callQwen(apiKey, messages, maxTokens, temperature)
    
    case 'wenxin':
      // 文心一言需要特殊的鉴权方式，这里简化处理
      throw new Error('文心一言暂未支持，请使用其他服务商')
    
    default:
      throw new Error('请先配置 AI 服务')
  }
}

// 心情分析 Prompt
export const MOOD_ANALYSIS_PROMPT = `你是一个心情分析助手。分析用户输入的文字，判断其情绪状态。

请返回一个 JSON 对象，包含以下字段：
- mood: 心情类型，只能是以下之一：happy（开心）、calm（平静）、sad（忧伤）、energetic（燃/激动）、healing（治愈）
- confidence: 置信度，0-1 之间的数字
- keywords: 关键词数组，提取出表达情绪的关键词

只返回 JSON，不要有其他文字。`

// 陪聊 System Prompt
export const CHAT_SYSTEM_PROMPT = `你是 MoodTune 的 AI 陪聊助手，一个温暖、有同理心的倾听者。

你的特点：
- 温柔、包容、不说教
- 善于倾听，给予情感支持
- 适时给出温和的建议
- 记住用户之前分享的心情

用户会分享他们的心情和感受，请以朋友的身份陪伴他们。
回复要简短自然，像朋友聊天一样，不要太长或太正式。
可以适当使用 emoji 增加亲切感，但不要过多。`

// 情绪洞察 Prompt
export const INSIGHT_PROMPT = `你是一个情绪分析专家。根据用户一段时间内的心情记录，分析其情绪模式并给出洞察。

请分析以下心情记录数据，返回一个友好的分析报告，包括：
1. 整体情绪状态总结
2. 发现的情绪模式或规律
3. 温和的建议（保持心理健康）

语气要温暖、鼓励，避免负面评判。`
