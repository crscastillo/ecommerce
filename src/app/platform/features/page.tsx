'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Globe,
  Zap,
  Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  category: 'platform' | 'tenant' | 'user' | 'experimental'
  is_enabled: boolean
  rollout_percentage: number
  target_tiers: string[]
  created_at: string
  updated_at: string
}

const defaultFeatureFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'Advanced Analytics',
    key: 'advanced_analytics',
    description: 'Enable advanced analytics and reporting features for tenants',
    category: 'tenant',
    is_enabled: true,
    rollout_percentage: 100,
    target_tiers: ['pro', 'enterprise'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Multi-Currency Support',
    key: 'multi_currency',
    description: 'Allow tenants to accept payments in multiple currencies',
    category: 'tenant',
    is_enabled: false,
    rollout_percentage: 0,
    target_tiers: ['enterprise'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'API Rate Limiting',
    key: 'api_rate_limiting',
    description: 'Enhanced API rate limiting and throttling',
    category: 'platform',
    is_enabled: true,
    rollout_percentage: 100,
    target_tiers: ['basic', 'pro', 'enterprise'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'AI Product Recommendations',
    key: 'ai_recommendations',
    description: 'AI-powered product recommendations for customers',
    category: 'experimental',
    is_enabled: false,
    rollout_percentage: 25,
    target_tiers: ['pro', 'enterprise'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function FeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(defaultFeatureFlags)
  const [filteredFlags, setFilteredFlags] = useState<FeatureFlag[]>(defaultFeatureFlags)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)

  // Form state for new/edit feature flag
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    category: 'tenant' as FeatureFlag['category'],
    is_enabled: false,
    rollout_percentage: 100,
    target_tiers: [] as string[]
  })

  const supabase = createClient()

  useEffect(() => {
    filterFlags()
  }, [featureFlags, searchTerm, categoryFilter])

  const filterFlags = () => {
    let filtered = [...featureFlags]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(flag => 
        flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(flag => flag.category === categoryFilter)
    }

    setFilteredFlags(filtered)
  }

  const handleToggleFlag = async (flagId: string) => {
    try {
      const flag = featureFlags.find(f => f.id === flagId)
      if (!flag) return

      const updatedFlag = { ...flag, is_enabled: !flag.is_enabled, updated_at: new Date().toISOString() }
      setFeatureFlags(flags => flags.map(f => f.id === flagId ? updatedFlag : f))

      // In a real implementation, you'd update the database here
      setMessage(`Feature flag "${flag.name}" ${updatedFlag.is_enabled ? 'enabled' : 'disabled'}`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Error toggling feature flag:', err)
      setError('Failed to toggle feature flag')
    }
  }

  const handleUpdateRollout = async (flagId: string, percentage: number) => {
    try {
      const updatedFlag = featureFlags.find(f => f.id === flagId)
      if (!updatedFlag) return

      updatedFlag.rollout_percentage = percentage
      updatedFlag.updated_at = new Date().toISOString()
      
      setFeatureFlags(flags => flags.map(f => f.id === flagId ? updatedFlag : f))
      setMessage(`Rollout percentage updated to ${percentage}%`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Error updating rollout:', err)
      setError('Failed to update rollout percentage')
    }
  }

  const handleCreateFlag = () => {
    setEditingFlag(null)
    setFormData({
      name: '',
      key: '',
      description: '',
      category: 'tenant',
      is_enabled: false,
      rollout_percentage: 100,
      target_tiers: []
    })
    setIsDialogOpen(true)
  }

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag)
    setFormData({
      name: flag.name,
      key: flag.key,
      description: flag.description,
      category: flag.category,
      is_enabled: flag.is_enabled,
      rollout_percentage: flag.rollout_percentage,
      target_tiers: flag.target_tiers
    })
    setIsDialogOpen(true)
  }

  const handleSaveFlag = () => {
    try {
      if (!formData.name || !formData.key) {
        setError('Name and key are required')
        return
      }

      const now = new Date().toISOString()
      
      if (editingFlag) {
        // Update existing flag
        const updatedFlag: FeatureFlag = {
          ...editingFlag,
          ...formData,
          updated_at: now
        }
        setFeatureFlags(flags => flags.map(f => f.id === editingFlag.id ? updatedFlag : f))
        setMessage(`Feature flag "${formData.name}" updated`)
      } else {
        // Create new flag
        const newFlag: FeatureFlag = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          created_at: now,
          updated_at: now
        }
        setFeatureFlags(flags => [...flags, newFlag])
        setMessage(`Feature flag "${formData.name}" created`)
      }

      setIsDialogOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Error saving feature flag:', err)
      setError('Failed to save feature flag')
    }
  }

  const handleDeleteFlag = async (flagId: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return

    try {
      const flag = featureFlags.find(f => f.id === flagId)
      setFeatureFlags(flags => flags.filter(f => f.id !== flagId))
      setMessage(`Feature flag "${flag?.name}" deleted`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Error deleting feature flag:', err)
      setError('Failed to delete feature flag')
    }
  }

  const getCategoryIcon = (category: FeatureFlag['category']) => {
    switch (category) {
      case 'platform': return <Globe className="h-4 w-4" />
      case 'tenant': return <Users className="h-4 w-4" />
      case 'user': return <Shield className="h-4 w-4" />
      case 'experimental': return <Zap className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: FeatureFlag['category']) => {
    switch (category) {
      case 'platform': return 'bg-blue-100 text-blue-800'
      case 'tenant': return 'bg-green-100 text-green-800'
      case 'user': return 'bg-purple-100 text-purple-800'
      case 'experimental': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
            <p className="text-gray-600">Manage platform and tenant feature availability</p>
          </div>
        </div>
        
        <Button onClick={handleCreateFlag}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature Flag
        </Button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
          <CheckCircle className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search feature flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFlags.map((flag) => (
          <Card key={flag.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(flag.category)}
                  <Badge className={getCategoryColor(flag.category)}>
                    {flag.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditFlag(flag)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteFlag(flag.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{flag.name}</CardTitle>
              <CardDescription className="text-sm">
                {flag.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enabled</span>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={() => handleToggleFlag(flag.id)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rollout</span>
                  <span className="text-sm text-gray-600">{flag.rollout_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${flag.rollout_percentage}%` }}
                  />
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={flag.rollout_percentage}
                  onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <span className="text-sm font-medium block mb-2">Target Tiers</span>
                <div className="flex flex-wrap gap-1">
                  {flag.target_tiers.map(tier => (
                    <Badge key={tier} variant="outline" className="text-xs">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="text-xs text-gray-500">
                <p>Key: <code className="bg-gray-100 px-1 rounded">{flag.key}</code></p>
                <p>Updated: {new Date(flag.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feature flags found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Create your first feature flag to get started'
              }
            </p>
            {(!searchTerm && categoryFilter === 'all') && (
              <Button onClick={handleCreateFlag}>
                <Plus className="h-4 w-4 mr-2" />
                Create Feature Flag
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </DialogTitle>
            <DialogDescription>
              Configure feature availability and rollout settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="flag-name">Name</Label>
              <Input
                id="flag-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Feature name"
              />
            </div>

            <div>
              <Label htmlFor="flag-key">Key</Label>
              <Input
                id="flag-key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="feature_key"
              />
            </div>

            <div>
              <Label htmlFor="flag-description">Description</Label>
              <Textarea
                id="flag-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Feature description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="flag-category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: FeatureFlag['category']) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="flag-enabled">Enabled by default</Label>
              <Switch
                id="flag-enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFlag}>
                <Save className="h-4 w-4 mr-2" />
                {editingFlag ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}