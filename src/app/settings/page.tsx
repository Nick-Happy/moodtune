'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Settings, Key, Palette, User, LogOut, 
  Check, Eye, EyeOff, Loader2, Trash2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { AI_PROVIDERS, type AIProvider } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | string | null>(null)
  
  // 设置状态
  const [aiProvider, setAiProvider] = useState<AIProvider>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  // 获取用户信息和设置
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 获取用户设置
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settings) {
        setAiProvider(settings.ai_provider)
        setApiKey(settings.ai_api_key || '')
        setTheme(settings.theme || 'system')
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  // 保存设置
  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ai_provider: aiProvider,
        ai_api_key: apiKey || null,
        theme,
        updated_at: new Date().toISOString(),
      })

    if (!error) {
      setTestResult('success')
      setTimeout(() => setTestResult(null), 2000)
    }
    setSaving(false)
  }

  // 测试 API Key
  const handleTestApiKey = async () => {
    if (!apiKey || !aiProvider) return
    
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, apiKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResult('success')
      } else {
        setTestResult(data.error || '连接失败，请检查 API Key')
      }
    } catch (err: any) {
      setTestResult(err.message || '网络连接失败')
    }

    setTesting(false)
  }

  // 退出登录
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // 删除账号
  const handleDeleteAccount = async () => {
    if (!confirm('确定要删除账号吗？此操作不可恢复，所有数据将被永久删除。')) {
      return
    }
    
    // TODO: 实现删除账号逻辑
    alert('账号删除功能即将上线')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            设置
          </h1>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* AI 配置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-mood-healing" />
                AI 服务配置
              </CardTitle>
              <CardDescription>
                配置你的 AI 服务，用于智能心情识别、陪聊等功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 选择服务商 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  选择 AI 服务商
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.entries(AI_PROVIDERS) as [AIProvider, typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS]][]).map(([key, provider]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setAiProvider(key)
                        setApiKey('')
                        setTestResult(null)
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        aiProvider === key
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">
                        {provider.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key 输入 */}
              {aiProvider && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <label className="text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={AI_PROVIDERS[aiProvider].placeholder}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value)
                          setTestResult(null)
                        }}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestApiKey}
                      disabled={!apiKey || testing}
                    >
                      {testing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '测试'
                      )}
                    </Button>
                  </div>
                  
                  {/* 测试结果 */}
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-start gap-2 text-sm ${
                        testResult === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {testResult === 'success' ? (
                        <>
                          <Check className="w-4 h-4 mt-0.5" />
                          <span>连接成功！</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="break-all">{testResult}</span>
                        </>
                      )}
                    </motion.div>
                  )}

                  <p className="text-xs text-gray-500">
                    你的 API Key 会被加密存储，仅用于调用 AI 服务
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 主题设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-mood-happy" />
                外观设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  主题
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'light', label: '浅色' },
                    { value: 'dark', label: '深色' },
                    { value: 'system', label: '跟随系统' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as typeof theme)}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        theme === option.value
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 账号信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-mood-calm" />
                账号信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">邮箱</label>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">昵称</label>
                <p className="font-medium text-gray-900">
                  {user?.user_metadata?.name || '未设置'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4" />
                  删除账号
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 保存按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            className="w-full" 
            onClick={handleSave}
            loading={saving}
          >
            <Check className="w-4 h-4" />
            保存设置
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
