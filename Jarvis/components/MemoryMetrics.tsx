'use client'

import { useState, useEffect } from 'react'
import { Database, TrendingUp, Archive } from 'lucide-react'

export default function MemoryMetrics() {
  const [memories, setMemories] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, recent: 0 })

  useEffect(() => {
    fetchMemories()
    const interval = setInterval(fetchMemories, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchMemories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      // Note: This endpoint requires authentication in production
      // For now, we'll show mock data
      setStats({ total: Math.floor(Math.random() * 1000), recent: Math.floor(Math.random() * 50) })
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Database className="w-5 h-5 mr-2 text-brain-green" />
        Memory Metrics
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={<Archive className="w-5 h-5" />}
          label="Total Memories"
          value={stats.total}
          color="brain-accent"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Recent (24h)"
          value={stats.recent}
          color="brain-purple"
        />
        <MetricCard
          icon={<Database className="w-5 h-5" />}
          label="Active Sources"
          value={4}
          color="brain-green"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">The Hood (Collective)</span>
          <span className="text-white font-semibold">Active</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Street Knowledge (Individual)</span>
          <span className="text-white font-semibold">Synced</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Vector Store</span>
          <span className="text-white font-semibold">Ready</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-purple-300">
          Mem0 integration enables persistent memory across agent sessions
        </p>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-lg text-center">
      <div className={`text-${color} flex justify-center mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}
