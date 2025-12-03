'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, CreditCard, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TenantDatabase } from '@/lib/supabase/tenant-database';
import { useToast } from '@/lib/contexts/toast-context';

interface NewCustomerFormData {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Address Information
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Account Settings
  status: 'active' | 'inactive' | 'suspended';
  accepts_marketing: boolean;
  
  // Notes
  notes: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const t = useTranslations('customers');
  const { tenant } = useTenant();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NewCustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    status: 'active',
    accepts_marketing: false,
    notes: ''
  });

  const handleInputChange = (field: keyof NewCustomerFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Get current user and tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Authentication required');
        return;
      }

      // Check if tenant is available
      if (!tenant?.id) {
        showError('Tenant information not found');
        return;
      }

      // Create the customer data object for TenantDatabase
      const customerData = {
        user_id: null, // Admin-created customers don't have a user_id initially
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        accepts_marketing: formData.accepts_marketing,
        notes: formData.notes,
        status: formData.status,
        // Convert address fields to addresses JSONB array
        addresses: formData.address_line_1 || formData.city ? [{
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          is_default: true
        }] : [],
        // Initialize calculated fields
        total_spent: 0,
        orders_count: 0,
        last_order_date: null
      };

      // Create the customer using TenantDatabase
      const tenantDb = new TenantDatabase(tenant.id);
      const { data: customer, error } = await tenantDb.createCustomer(customerData);

      if (error) {
        showError(`Failed to create customer: ${error.message}`);
        return;
      }

      showSuccess('Customer created successfully');
      router.push(`/admin/customers/${customer.id}`);
    } catch (error) {
      showError('Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/customers')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('actions.back')}</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('actions.create')}</h1>
            <p className="text-muted-foreground">{t('new.description')}</p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? t('actions.saving') : t('actions.save')}</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{t('details.personalInfo')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('fields.firstName')} *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder={t('placeholders.firstName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t('fields.lastName')} *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder={t('placeholders.lastName')}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{t('fields.email')} *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('placeholders.email')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{t('fields.phone')}</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('placeholders.phone')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{t('details.addressInfo')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line_1">{t('fields.addressLine1')}</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                placeholder={t('placeholders.addressLine1')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address_line_2">{t('fields.addressLine2')}</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                placeholder={t('placeholders.addressLine2')}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('fields.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={t('placeholders.city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('fields.state')}</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={t('placeholders.state')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">{t('fields.postalCode')}</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder={t('placeholders.postalCode')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">{t('fields.country')}</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">{t('countries.US')}</SelectItem>
                  <SelectItem value="CA">{t('countries.CA')}</SelectItem>
                  <SelectItem value="MX">{t('countries.MX')}</SelectItem>
                  <SelectItem value="GB">{t('countries.GB')}</SelectItem>
                  <SelectItem value="DE">{t('countries.DE')}</SelectItem>
                  <SelectItem value="FR">{t('countries.FR')}</SelectItem>
                  <SelectItem value="ES">{t('countries.ES')}</SelectItem>
                  <SelectItem value="IT">{t('countries.IT')}</SelectItem>
                  <SelectItem value="AU">{t('countries.AU')}</SelectItem>
                  <SelectItem value="JP">{t('countries.JP')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>{t('details.accountSettings')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('fields.status')}</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive' | 'suspended')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                  <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="accepts_marketing">{t('fields.acceptsMarketing')}</Label>
                <p className="text-sm text-muted-foreground">{t('descriptions.acceptsMarketing')}</p>
              </div>
              <Switch
                id="accepts_marketing"
                checked={formData.accepts_marketing}
                onCheckedChange={(checked) => handleInputChange('accepts_marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('fields.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={t('placeholders.notes')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/customers')}
          >
            {t('actions.cancel')}
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? t('actions.saving') : t('actions.save')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}