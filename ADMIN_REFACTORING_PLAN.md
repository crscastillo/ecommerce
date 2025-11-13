# Admin Settings Refactoring Plan

## Current State
- `/src/app/admin/settings/page.tsx` - 2024 lines (MONOLITHIC)
- All logic and UI in one file
- Difficult to maintain and test

## Target Component Structure

```
src/components/admin/settings/
├── index.ts                           # Export all components & types
├── store-information-tab.tsx          # ✅ CREATED
├── configuration-tab.tsx              # ✅ CREATED  
├── theme-tab.tsx                      # TODO
├── payments-tab.tsx                   # TODO
├── plugins-tab.tsx                    # TODO
├── users-tab.tsx                      # TODO
├── security-tab.tsx                   # TODO
└── hooks/
    ├── use-settings.ts               # Settings state & API
    ├── use-payment-methods.ts        # Payment methods state & API
    ├── use-tenant-users.ts           # Tenant users state & API
    └── use-theme.ts                  # Theme state & API
```

## Component Responsibilities

### 1. StoreInformationTab ✅
- Store name, subdomain, country
- Languages (admin & store)
- Contact info (email, phone)
- Physical address
- ~270 lines

### 2. ConfigurationTab ✅
- Currency & timezone  
- Tax rate
- Low stock threshold
- Feature toggles (inventory, backorders, auto-fulfill, notifications)
- ~200 lines

### 3. ThemeTab (TODO)
- Brand assets (logo, favicon)
- Color scheme (primary, secondary, accent)
- Typography (font family)
- Custom CSS
- ~180 lines

### 4. PaymentsTab (TODO)
- Cash on Delivery toggle
- Stripe configuration & API keys
- TiloPay configuration & API keys
- Key visibility toggles
- ~350 lines

### 5. PluginsTab (TODO)
- Google Analytics
- Facebook Pixel
- Mailchimp
- WhatsApp Business
- Live Chat
- Low Stock Alerts
- ~280 lines

### 6. UsersTab (TODO)
- Invite new users (email + role)
- Team members list
- Role management
- Remove users with confirmation
- ~220 lines

### 7. SecurityTab (TODO)
- Account information (subscription, status, created date)
- Password reset
- Two-factor authentication (SMS, Authenticator App)
- Login sessions management
- Delete store (danger zone)
- ~320 lines

## Custom Hooks

### use-settings.ts
```typescript
export function useSettings(tenant: Tenant | null) {
  const [settings, setSettings] = useState<StoreSettings>()
  const [loading, setLoading] = useState(false)
  
  const loadSettings = async () => { /* ... */ }
  const saveSettings = async () => { /* ... */ }
  
  return { settings, loading, loadSettings, saveSettings, setSettings }
}
```

### use-payment-methods.ts  
```typescript
export function usePaymentMethods(tenantId: string | null) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>()
  const [loading, setLoading] = useState(false)
  
  const loadPaymentMethods = async () => { /* ... */ }
  const savePaymentMethods = async () => { /* ... */ }
  
  return { paymentMethods, loading, loadPaymentMethods, savePaymentMethods, setPaymentMethods }
}
```

### use-tenant-users.ts
```typescript
export function useTenantUsers(tenantId: string | null) {
  const [users, setUsers] = useState<TenantUser[]>([])
  const [loading, setLoading] = useState(false)
  
  const loadUsers = async () => { /* ... */ }
  const inviteUser = async (email: string, role: string) => { /* ... */ }
  const updateUserRole = async (id: string, role: string) => { /* ... */ }
  const removeUser = async (id: string) => { /* ... */ }
  
  return { users, loading, inviteUser, updateUserRole, removeUser }
}
```

## Main Page Structure (Simplified)

```typescript
export default function SettingsPage() {
  const { tenant, isLoading, error } = useTenant()
  const { settings, saveSettings, setSettings } = useSettings(tenant)
  const { themeSettings, saveTheme, setTheme } = useTheme(tenant)
  const { paymentMethods, savePaymentMethods, setPaymentMethods } = usePaymentMethods(tenant?.id)
  const { users, inviteUser, updateUserRole, removeUser } = useTenantUsers(tenant?.id)
  
  const [activeTab, setActiveTab] = useState('store')
  const [saving, setSaving] = useState(false)
  
  // Loading & error states (50 lines)
  
  return (
    <div className="space-y-6">
      <Header />
      <MessageDisplay />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* 7 tabs */}
        </TabsList>
        
        <TabsContent value="store">
          <StoreInformationTab 
            tenant={tenant}
            settings={settings}
            onSettingsChange={setSettings}
            onSave={async () => await saveSettings()}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="config">
          <ConfigurationTab 
            settings={settings}
            onSettingsChange={setSettings}
            onSave={async () => await saveSettings()}
            saving={saving}
          />
        </TabsContent>
        
        {/* More tabs... */}
      </Tabs>
    </div>
  )
}
```

## Benefits

1. **Maintainability**: Each component handles one concern
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components can be reused or extended
4. **Performance**: Can lazy-load tabs not currently visible
5. **Developer Experience**: Easier to find and modify specific features
6. **Code Review**: Smaller, focused PRs

## Migration Strategy

### Phase 1: Create Component Structure ✅
- [x] Create `/components/admin/settings/` directory
- [x] Create index.ts with exports & types
- [x] Create StoreInformationTab component
- [x] Create ConfigurationTab component

### Phase 2: Create Remaining Tab Components
- [ ] Create ThemeTab component
- [ ] Create PaymentsTab component
- [ ] Create PluginsTab component  
- [ ] Create UsersTab component
- [ ] Create SecurityTab component

### Phase 3: Create Custom Hooks
- [ ] Extract settings logic to use-settings.ts
- [ ] Extract payment methods logic to use-payment-methods.ts
- [ ] Extract tenant users logic to use-tenant-users.ts
- [ ] Extract theme logic to use-theme.ts

### Phase 4: Update Main Page
- [ ] Import all tab components
- [ ] Replace inline JSX with components
- [ ] Use custom hooks for state management
- [ ] Test all functionality

### Phase 5: Cleanup
- [ ] Remove unused code
- [ ] Add prop-types/TypeScript validation
- [ ] Add unit tests for components
- [ ] Update documentation

## Estimated Line Count After Refactoring

- Main page.tsx: ~200 lines (down from 2024)
- 7 tab components: ~1500 lines total
- 4 custom hooks: ~400 lines total
- Types & exports: ~100 lines

**Total: ~2200 lines** (organized vs 2024 monolithic)

## Next Steps

Run this command to create remaining components:

\`\`\`bash
# Create remaining tab components (I can do this for you)
touch src/components/admin/settings/theme-tab.tsx
touch src/components/admin/settings/payments-tab.tsx
touch src/components/admin/settings/plugins-tab.tsx
touch src/components/admin/settings/users-tab.tsx
touch src/components/admin/settings/security-tab.tsx

# Create hooks directory and files
mkdir -p src/components/admin/settings/hooks
touch src/components/admin/settings/hooks/use-settings.ts
touch src/components/admin/settings/hooks/use-payment-methods.ts
touch src/components/admin/settings/hooks/use-tenant-users.ts
touch src/components/admin/settings/hooks/use-theme.ts
\`\`\`
