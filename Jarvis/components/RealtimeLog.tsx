'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Wifi, WifiOff } from 'lucide-react'

interface LogEntry {
  timestamp: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

export default function RealtimeLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
      const ws = new WebSocket(`${wsUrl}?agent=jarvis-dashboard`)

      ws.onopen = () => {
        setConnected(true)
        addLog('success', 'Connected to gAIng-brAin')
      }

      ws.onclose = () => {
        setConnected(false)
        addLog('warning', 'Disconnected from server')
        // Attempt reconnection after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }

      ws.onerror = () => {
        addLog('error', 'WebSocket error')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          addLog('info', data.message || JSON.stringify(data))
        } catch (e) {
          addLog('info', event.data)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      addLog('error', 'Failed to connect to WebSocket')
    }
  }

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    setLogs(prev => [...prev.slice(-49), newLog]) // Keep last 50 logs
  }

  return (
    <div className="glass rounded-xl p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-brain-accent" />
          Real-time Log
        </h2>
        <div className="flex items-center space-x-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
        {logs.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Waiting for events...
          </p>
        )}
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              log.type === 'error' ? 'bg-red-500/10 text-red-300' :
              log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-300' :
              log.type === 'success' ? 'bg-green-500/10 text-green-300' :
              'bg-white/5 text-gray-300'
            }`}
          >
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              log.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }>
              {log.type.toUpperCase()}
            </span>:{' '}
            {log.message}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => setLogs([])}
          className="w-full px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
        >
          Clear Log
        </button>
      </div>
    </div>
  )
}
