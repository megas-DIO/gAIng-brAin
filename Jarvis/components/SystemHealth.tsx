'use client'

import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react'

export default function SystemHealth({ data }: any) {
  const status = data?.status || 'unknown'
  const warnings = data?.warnings || []

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-brain-accent" />
        System Health
      </h2>

      <div className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-3">
            {status === 'healthy' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {status === 'degraded' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
            {status === 'unhealthy' && <XCircle className="w-6 h-6 text-red-500" />}
            {status === 'unknown' && <Clock className="w-6 h-6 text-gray-500" />}
            <div>
              <p className="text-white font-semibold">Overall Status</p>
              <p className="text-sm text-gray-400">{status.toUpperCase()}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'healthy' ? 'bg-green-500/20 text-green-400' :
            status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
            status === 'unhealthy' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {status}
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-yellow-400">Warnings</p>
            {warnings.map((warning: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <p className="text-sm text-gray-300">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Services */}
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-3">Services</p>
          <div className="grid grid-cols-2 gap-3">
            <ServiceStatus name="Brain Core" status="online" />
            <ServiceStatus name="Memory" status={data?.services?.memory || 'unknown'} />
            <ServiceStatus name="WebSocket" status="online" />
            <ServiceStatus name="Database" status={data?.services?.database || 'unknown'} />
          </div>
        </div>

        {/* Timestamp */}
        {data?.timestamp && (
          <p className="text-xs text-gray-500 text-right">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

function ServiceStatus({ name, status }: { name: string; status: string }) {
  const isOnline = status === 'online' || status === 'healthy'
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <span className="text-sm text-gray-300">{name}</span>
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-500'
      } animate-pulse`} />
    </div>
  )
}
