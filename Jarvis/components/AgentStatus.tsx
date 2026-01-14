'use client'

import { useState, useEffect } from 'react'
import { Users, Brain, Code, Sparkles, Zap } from 'lucide-react'

const AGENTS = [
  { name: 'Claude', role: 'Deep Reasoner', icon: Brain, color: 'brain-accent' },
  { name: 'Gemini', role: 'Strategy & Ops', icon: Sparkles, color: 'brain-purple' },
  { name: 'Codex', role: 'Technical Architect', icon: Code, color: 'brain-green' },
  { name: 'Grok', role: 'Real-time Intelligence', icon: Zap, color: 'yellow-400' },
]

export default function AgentStatus() {
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/members/names`)
      if (response.ok) {
        const text = await response.text()
        const names = text.split(',').map(n => n.trim())
        // Match fetched agents with our known agents
        const updatedAgents = AGENTS.map(agent => ({
          ...agent,
          active: names.some(name => name.toLowerCase().includes(agent.name.toLowerCase()))
        }))
        setAgents(updatedAgents)
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      setAgents(AGENTS.map(agent => ({ ...agent, active: false })))
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-brain-purple" />
        Agent Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(agents.length > 0 ? agents : AGENTS).map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.name}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${agent.color}/20`}>
                    <Icon className={`w-5 h-5 text-${agent.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  agent.active !== false ? 'bg-green-500' : 'bg-gray-500'
                } animate-pulse`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-blue-300">
          <span className="font-semibold">The Collective:</span> Multi-agent orchestration with shared memory and autonomous coordination.
        </p>
      </div>
    </div>
  )
}
