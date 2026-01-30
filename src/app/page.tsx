'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Heart, Sparkles, ArrowRight, Brain, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: Music,
      title: '音乐绑定心情',
      description: '粘贴音乐链接，自动识别歌曲信息',
    },
    {
      icon: Brain,
      title: 'AI 智能识别',
      description: '根据文字自动分析你的情绪状态',
    },
    {
      icon: Heart,
      title: 'AI 温暖陪聊',
      description: '像树洞一样，陪你聊聊心情',
    },
    {
      icon: BarChart3,
      title: '情绪图谱',
      description: '可视化你的年度情绪变化轨迹',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-mood-happy/20 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-60 h-60 bg-mood-healing/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-mood-calm/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-brand shadow-lg mb-8"
              animate={{ rotate: isHovered ? 10 : 0 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Music className="w-10 h-10 text-white" />
            </motion.div>

            {/* 标题 */}
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                MoodTune
              </span>
              <br />
              <span className="text-3xl sm:text-4xl font-medium text-gray-700">
                心声日记
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              用音乐记录每一天的心情
              <br />
              AI 陪你看见情绪的轨迹
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-brand text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  开始记录
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-medium rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <Sparkles className="w-5 h-5 text-mood-healing" />
                  体验演示
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-16"
          >
            为什么选择 MoodTune？
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-brand/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Colors Preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              用色彩表达情绪
            </h2>
            <p className="text-gray-600">
              每种心情都有专属的颜色，构建属于你的情绪图谱
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { emoji: '😊', name: '开心', color: 'bg-mood-happy' },
              { emoji: '😌', name: '平静', color: 'bg-mood-calm' },
              { emoji: '😢', name: '忧伤', color: 'bg-mood-sad' },
              { emoji: '🔥', name: '燃', color: 'bg-mood-energetic' },
              { emoji: '💜', name: '治愈', color: 'bg-mood-healing' },
            ].map((mood, index) => (
              <motion.div
                key={mood.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className={`${mood.color} w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg cursor-pointer`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-sm font-medium text-white/90">{mood.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">MoodTune</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 MoodTune. 用音乐记录心情。
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
