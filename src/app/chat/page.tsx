'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MessageCircle, Send, Loader2, Bot, User, 
  Sparkles, AlertCircle, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from '@/types'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 获取用户和聊天记录
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 检查是否配置了 API Key
      const { data: settings } = await supabase
        .from('user_settings')
        .select('ai_api_key, ai_provider')
        .eq('user_id', user.id)
        .single()

      setHasApiKey(!!settings?.ai_api_key && !!settings?.ai_provider)

      // 获取聊天记录
      const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (chatMessages) {
        setMessages(chatMessages)
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || sending || !hasApiKey) return

    const userMessage = input.trim()
    setInput('')
    setSending(true)

    const supabase = createClient()

    // 添加用户消息到界面
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      // 保存用户消息到数据库
      const { data: savedUserMsg } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content: userMessage,
        })
        .select()
        .single()

      // 调用 AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('AI 响应失败')
      }

      const { content } = await response.json()

      // 保存 AI 回复到数据库
      const { data: savedAiMsg } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'assistant',
          content,
        })
        .select()
        .single()

      // 更新消息列表
      setMessages(prev => {
        const filtered = prev.filter(m => !m.id.startsWith('temp-'))
        return [...filtered, savedUserMsg, savedAiMsg].filter(Boolean) as ChatMessage[]
      })

    } catch (error) {
      console.error('发送失败:', error)
      // 添加错误提示
      setMessages(prev => [
        ...prev.filter(m => !m.id.startsWith('temp-')),
        {
          id: `error-${Date.now()}`,
          user_id: user.id,
          role: 'assistant',
          content: '抱歉，我遇到了一些问题。请稍后再试，或检查你的 AI 配置。',
          created_at: new Date().toISOString(),
        } as ChatMessage,
      ])
    }

    setSending(false)
  }

  // 按回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-mood-healing" />
            AI 陪聊
          </h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* 欢迎消息 */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-mood-healing" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hi，我是你的 AI 伙伴 👋
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                有什么想聊的吗？我会陪你聊聊心情，倾听你的故事。
              </p>
            </motion.div>
          )}

          {/* 消息列表 */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-brand' 
                    : 'bg-mood-healing/20'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-mood-healing" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-brand text-white rounded-tr-sm'
                      : 'bg-white shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI 正在输入 */}
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-mood-healing/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-mood-healing" />
              </div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 未配置 API Key 提示 */}
      {!hasApiKey && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              请先在<Link href="/settings" className="underline font-medium">设置页面</Link>配置 AI 服务，才能开始聊天。
            </p>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Textarea
              placeholder={hasApiKey ? "想聊点什么..." : "请先配置 AI 服务"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!hasApiKey || sending}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending || !hasApiKey}
              className="h-11 px-4"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
