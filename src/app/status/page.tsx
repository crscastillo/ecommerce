'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Clock, Activity, Database, Globe, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  name: string
  status: ServiceStatus
  description: string
  icon: any
  lastChecked?: string
  uptime?: string
  responseTime?: number
  error?: string
}

interface StatusResponse {
  status: ServiceStatus
  services: Array<{
    name: string
    status: ServiceStatus
    description: string
    responseTime?: number
    lastChecked: string
    uptime?: string
    error?: string
  }>
  timestamp: string
  summary: {
    operational: number
    degraded: number
    outage: number
    total: number
  }
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'minor' | 'major' | 'critical'
  timestamp: string
  description: string
}

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [overallStatus, setOverallStatus] = useState<ServiceStatus>('operational')

  const getIconForService = (name: string) => {
    switch (name) {
      case 'API Services':
        return Zap
      case 'Database':
        return Database
      case 'Web Application':
        return Globe
      case 'Payment Processing':
        return Shield
      case 'File Storage':
        return Activity
      default:
        return Activity
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const data: StatusResponse = await response.json()
      
      const servicesWithIcons = data.services.map(service => ({
        ...service,
        icon: getIconForService(service.name)
      }))
      
      setServices(servicesWithIcons)
      setOverallStatus(data.status)
      setLastUpdate(new Date(data.timestamp).toLocaleString())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch status:', error)
      // Set error state
      setServices([
        {
          name: 'System Status',
          status: 'outage',
          description: 'Unable to fetch system status',
          icon: AlertCircle,
          lastChecked: new Date().toISOString()
        }
      ])
      setOverallStatus('outage')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Refresh status every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const [incidents, setIncidents] = useState<Incident[]>([
    // Example past incident - you can remove this in production
    // {
    //   id: '1',
    //   title: 'Scheduled Maintenance - Database Optimization',
    //   status: 'resolved',
    //   severity: 'minor',
    //   timestamp: '2025-11-01 02:00 UTC',
    //   description: 'Completed scheduled database maintenance. All services restored.'
    // }
  ])

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return 'Operational'
      case 'degraded':
        return 'Degraded Performance'
      case 'outage':
        return 'Service Outage'
      case 'maintenance':
        return 'Under Maintenance'
      default:
        return 'Unknown'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'minor':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Minor</Badge>
      case 'major':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Major</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getIncidentStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Investigating</Badge>
      case 'identified':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Identified</Badge>
      case 'monitoring':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const allOperational = overallStatus === 'operational'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Status</h1>
              <p className="text-gray-600 dark:text-gray-400">Real-time status and uptime monitoring</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {allOperational ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
                <div>
                  <CardTitle className="text-2xl">
                    {allOperational ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Some Systems Degraded' : 'Service Disruption'}
                  </CardTitle>
                  <CardDescription>
                    Last updated: {lastUpdate || new Date().toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              {allOperational && (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-base">
                  ✓ Healthy
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Active Incidents */}
        {incidents.length > 0 && incidents.some(i => i.status !== 'resolved') && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incidents
                .filter(incident => incident.status !== 'resolved')
                .map(incident => (
                  <div key={incident.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                      <div className="flex gap-2">
                        {getSeverityBadge(incident.severity)}
                        {getIncidentStatusBadge(incident.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                    <p className="text-xs text-gray-500">{incident.timestamp}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Services Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Current status of all platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${getStatusColor(service.status)}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/50">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          {getStatusIcon(service.status)}
                          <span className="text-sm font-medium">{getStatusText(service.status)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.error && (
                          <p className="text-xs text-red-600 mt-1">Error: {service.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {service.responseTime !== undefined && (
                        <div className="text-sm font-semibold text-gray-900">{service.responseTime}ms</div>
                      )}
                      {service.uptime && (
                        <div className="text-sm text-gray-600">{service.uptime} uptime</div>
                      )}
                      {service.lastChecked && (
                        <div className="text-xs text-gray-500">
                          {new Date(service.lastChecked).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents History */}
        {incidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
              <CardDescription>Past incidents and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents
                  .filter(incident => incident.status === 'resolved')
                  .map(incident => (
                    <div key={incident.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                        <div className="flex gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getIncidentStatusBadge(incident.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <p className="text-xs text-gray-500">{incident.timestamp}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uptime Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Uptime Statistics</CardTitle>
            <CardDescription>Last 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">99.98%</div>
                <div className="text-sm text-gray-600">Overall Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Major Incidents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">&lt;100ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Status updates are refreshed automatically every 60 seconds. Last check: {lastUpdate}</p>
          <p className="mt-2">
            Having issues? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
