'use client'

import { useState, useEffect } from 'react'
import { Activity, Brain, Users, Database, Zap, TrendingUp } from 'lucide-react'
import SystemHealth from '@/components/SystemHealth'
import AgentStatus from '@/components/AgentStatus'
import MemoryMetrics from '@/components/MemoryMetrics'
import RealtimeLog from '@/components/RealtimeLog'

export default function Dashboard() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/health`)
      const data = await response.json()
      setSystemStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brain-dark via-indigo-950 to-brain-dark">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-brain-accent" />
              <div>
                <h1 className="text-2xl font-bold text-white">Jarvis Dashboard</h1>
                <p className="text-sm text-gray-400">gAIng-brAin Command Center</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="glass px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${
                      systemStatus?.status === 'healthy' ? 'bg-green-500' :
                      systemStatus?.status === 'degraded' ? 'bg-yellow-500' :
                      'bg-red-500'
                    } animate-pulse`} />
                  )}
                  <span className="text-sm text-gray-300">
                    {loading ? 'Connecting...' : systemStatus?.status?.toUpperCase() || 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="System Status"
            value={systemStatus?.status || 'Unknown'}
            color="brain-accent"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Uptime"
            value={formatUptime(systemStatus?.uptime)}
            color="brain-purple"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Memory Usage"
            value={formatMemory(systemStatus?.memory?.heapUsed)}
            color="brain-green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Version"
            value={systemStatus?.version || '1.0.0'}
            color="brain-accent"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <SystemHealth data={systemStatus} />
            <AgentStatus />
            <MemoryMetrics />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <RealtimeLog />
          </div>
        </div>
      </div>
    </main>
  )
}

// Stat Card Component
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="glass rounded-xl p-6 hover:glow transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-${color}`}>{icon}</div>
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

// Utility functions
function formatUptime(seconds: number | undefined): string {
  if (!seconds) return '0s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function formatMemory(bytes: number | undefined): string {
  if (!bytes) return '0 MB'
  return `${Math.round(bytes / 1024 / 1024)} MB`
}
