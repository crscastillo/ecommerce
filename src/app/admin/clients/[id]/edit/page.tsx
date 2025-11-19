'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Tag,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

type Customer = Database['public']['Tables']['customers']['Row']

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptsMarketing, setAcceptsMarketing] = useState(false)
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id && params.id) {
      loadCustomer()
    }
  }, [tenant?.id, params.id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!tenant?.id) {
        setLoading(false)
        return
      }
      
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .eq('tenant_id', tenant.id)
        .single()

      if (error) {
        console.error('Error loading customer:', error)
        if (error.code === 'PGRST116') {
          setError(t('customerNotFound'))
          return
        }
        setError(t('errorLoadingCustomer'))
        return
      }

      setCustomer(customer)
      
      // Populate form fields
      setFirstName(customer.first_name || '')
      setLastName(customer.last_name || '')
      setEmail(customer.email || '')
      setPhone(customer.phone || '')
      setAcceptsMarketing(customer.accepts_marketing || false)
      setNotes(customer.notes || '')
      setTags(customer.tags?.join(', ') || '')
      
    } catch (error) {
      console.error('Error:', error)
      setError(t('errorLoadingCustomer'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      if (!tenant?.id || !customer) {
        return
      }

      // Validate required fields
      if (!email.trim()) {
        setError(t('emailRequired'))
        return
      }

      // Parse tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const updateData = {
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        accepts_marketing: acceptsMarketing,
        notes: notes.trim() || null,
        tags: tagArray.length > 0 ? tagArray : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customer.id)
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error updating customer:', error)
        if (error.code === '23505') {
          setError(t('emailAlreadyExists'))
        } else {
          setError(t('errorUpdatingCustomer'))
        }
        return
      }

      setSuccess(true)
      
      // Reload customer data
      await loadCustomer()
      
      // Redirect to customer details page after successful save
      setTimeout(() => {
        router.push(`/admin/clients/${customer.id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error:', error)
      setError(t('errorUpdatingCustomer'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(customer ? `/admin/clients/${customer.id}` : '/admin/clients')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !customer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-2 text-sm font-medium">{t('errorLoadingCustomer')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToCustomers')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('editCustomer')}
            </h1>
            <p className="text-muted-foreground">
              {customer?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {tCommon('save')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-green-700">{t('customerUpdated')}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('personalInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('enterFirstName')}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('enterLastName')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('email')} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterEmail')}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{t('phone')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('enterPhone')}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('accountSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {t('accountType')}
              </div>
              <Badge variant={customer?.user_id ? "default" : "secondary"}>
                {customer?.user_id ? t('registered') : t('guest')}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {customer?.user_id 
                  ? t('registeredAccountDescription')
                  : t('guestAccountDescription')
                }
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing">{t('marketingEmails')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('marketingEmailsDescription')}
                </p>
              </div>
              <Switch
                id="marketing"
                checked={acceptsMarketing}
                onCheckedChange={setAcceptsMarketing}
              />
            </div>

            <div>
              <Label htmlFor="tags">{t('customerTags')}</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t('enterTags')}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('tagsDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('customerNotes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">{t('internalNotes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('enterNotes')}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('notesDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Statistics (Read-only) */}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle>{t('customerStatistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded">
                <div className="text-2xl font-bold">{customer.orders_count || 0}</div>
                <div className="text-sm text-muted-foreground">{t('totalOrders')}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(customer.total_spent || 0)}
                </div>
                <div className="text-sm text-muted-foreground">{t('totalSpent')}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded">
                <div className="text-2xl font-bold">
                  {customer.orders_count && customer.orders_count > 0 
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format((customer.total_spent || 0) / customer.orders_count)
                    : '$0.00'
                  }
                </div>
                <div className="text-sm text-muted-foreground">{t('averageOrder')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}