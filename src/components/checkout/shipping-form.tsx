'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck } from 'lucide-react'

// Americas countries list (matching shipping configuration)
const AMERICAS_COUNTRIES = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GL', name: 'Greenland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  
  // Central America
  { code: 'BZ', name: 'Belize' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panama' },
  
  // Caribbean
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BB', name: 'Barbados' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'GD', name: 'Grenada' },
  { code: 'HT', name: 'Haiti' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  
  // Caribbean Dependencies
  { code: 'AI', name: 'Anguilla' },
  { code: 'AW', name: 'Aruba' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  
  // South America
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GY', name: 'Guyana' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'SR', name: 'Suriname' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' }
]

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo
  onUpdate: (info: ShippingInfo) => void
  onSubmit: (e: React.FormEvent) => void
  showSubmitButton?: boolean
  shippingMethods?: any[]
}

export function ShippingForm({ shippingInfo, onUpdate, onSubmit, showSubmitButton = true, shippingMethods = [] }: ShippingFormProps) {
  const t = useTranslations('checkout')
  
  const handleChange = (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...shippingInfo, [field]: e.target.value })
  }
  
  const handleCountryChange = (value: string) => {
    onUpdate({ ...shippingInfo, country: value })
  }
  
  // Filter countries based on available shipping methods
  const getAvailableCountries = () => {
    if (!shippingMethods || shippingMethods.length === 0) {
      return AMERICAS_COUNTRIES // Show all if no shipping methods loaded yet
    }
    
    const allowedCountries = new Set<string>()
    
    shippingMethods.forEach(method => {
      if (!method.enabled || !method.shipping_zones) {
        // If no zones configured or method disabled, skip
        return
      }
      
      const { allowed_countries, restricted_countries } = method.shipping_zones
      
      if (!allowed_countries || allowed_countries.length === 0) {
        // No restrictions means worldwide - add all countries
        AMERICAS_COUNTRIES.forEach(country => allowedCountries.add(country.code))
      } else {
        // Add specifically allowed countries
        allowed_countries.forEach(code => allowedCountries.add(code))
      }
      
      // Remove restricted countries
      if (restricted_countries) {
        restricted_countries.forEach(code => allowedCountries.delete(code))
      }
    })
    
    // Filter AMERICAS_COUNTRIES to only include allowed ones
    return AMERICAS_COUNTRIES.filter(country => allowedCountries.has(country.code))
  }
  
  const availableCountries = getAvailableCountries()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          {t('shipping.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t('shipping.firstName')} *</Label>
              <Input
                id="firstName"
                value={shippingInfo.firstName}
                onChange={handleChange('firstName')}
                placeholder={t('shipping.firstNamePlaceholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t('shipping.lastName')} *</Label>
              <Input
                id="lastName"
                value={shippingInfo.lastName}
                onChange={handleChange('lastName')}
                placeholder={t('shipping.lastNamePlaceholder')}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">{t('shipping.email')} *</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={handleChange('email')}
              placeholder={t('shipping.emailPlaceholder')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">{t('shipping.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingInfo.phone}
              onChange={handleChange('phone')}
              placeholder={t('shipping.phonePlaceholder')}
            />
          </div>
          
          <div>
            <Label htmlFor="address">{t('shipping.address')} *</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={handleChange('address')}
              placeholder={t('shipping.addressPlaceholder')}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{t('shipping.city')} *</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={handleChange('city')}
                placeholder={t('shipping.cityPlaceholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">{t('shipping.state')} *</Label>
              {shippingInfo.country === 'US' ? (
                <Select value={shippingInfo.state} onValueChange={(value) => onUpdate({ ...shippingInfo, state: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('shipping.selectState')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="state"
                  value={shippingInfo.state}
                  onChange={handleChange('state')}
                  placeholder={t('shipping.stateProvincePlaceholder')}
                  required
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">{t('shipping.zipCode')} *</Label>
              <Input
                id="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleChange('zipCode')}
                placeholder={t('shipping.zipCodePlaceholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">{t('shipping.country')} *</Label>
              <Select value={shippingInfo.country} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('shipping.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.length > 0 ? (
                    availableCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No countries available for shipping
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {showSubmitButton && (
            <Button type="submit" className="w-full mt-6">
              {t('shipping.continueToPayment')}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
