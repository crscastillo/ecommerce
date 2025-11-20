# Admin Settings URL-Based Navigation

## Overview
The admin settings page now supports URL-based tab navigation, allowing direct links to specific settings tabs.

## Supported URL Formats

### Query Parameter Format
- **Store Settings (default)**: `/admin/settings` or `/admin/settings?tab=store`
- **Configuration**: `/admin/settings?tab=config`
- **Theme**: `/admin/settings?tab=theme`
- **Payment Methods**: `/admin/settings?tab=payments`
- **Users**: `/admin/settings?tab=users`
- **Security**: `/admin/settings?tab=security`
- **Plugins**: `/admin/settings?tab=plugins` (only visible when plugins are available)

## Features

### Automatic URL Updates
- When a user clicks on a tab, the URL automatically updates to reflect the current tab
- Users can bookmark specific tabs and return directly to them
- The browser back/forward buttons work correctly with tab navigation

### Default Behavior
- If no `tab` parameter is provided, defaults to the "store" tab
- Invalid tab parameters fall back to the "store" tab
- The URL is updated without page refresh using `router.replace()`

## Implementation Details

### Key Components
1. **useRouter**: Next.js router for URL manipulation
2. **useSearchParams**: Reading current URL parameters
3. **useEffect hooks**: Synchronizing URL and component state

### URL Synchronization Logic
```typescript
// Update URL when tab changes
useEffect(() => {
  const currentTab = searchParams.get('tab')
  if (currentTab !== activeTab) {
    const newParams = new URLSearchParams(searchParams.toString())
    if (activeTab === 'store') {
      newParams.delete('tab') // Clean URL for default tab
    } else {
      newParams.set('tab', activeTab)
    }
    const newUrl = newParams.toString() ? `?${newParams.toString()}` : '/admin/settings'
    router.replace(newUrl, { scroll: false })
  }
}, [activeTab, searchParams, router])

// Update activeTab when URL changes
useEffect(() => {
  const tabFromUrl = searchParams.get('tab') || 'store'
  if (tabFromUrl !== activeTab) {
    setActiveTab(tabFromUrl)
  }
}, [searchParams])
```

## Usage Examples

### Direct Links
```
<!-- Link to payment methods settings -->
<a href="/admin/settings?tab=payments">Payment Settings</a>

<!-- Link to user management -->
<a href="/admin/settings?tab=users">User Management</a>
```

### Programmatic Navigation
```typescript
// Navigate to specific tab
router.push('/admin/settings?tab=theme')

// Or update search params
const params = new URLSearchParams()
params.set('tab', 'security')
router.push(`/admin/settings?${params.toString()}`)
```

## Benefits

1. **Better UX**: Users can bookmark and share links to specific settings
2. **Navigation History**: Browser back/forward buttons work correctly
3. **Deep Linking**: External links can point directly to specific tabs
4. **SEO Friendly**: Each tab has a unique URL for better indexing
5. **Accessibility**: Screen readers and keyboard navigation benefit from proper URL structure

## Technical Notes

- Uses `router.replace()` instead of `router.push()` to avoid cluttering browser history
- The `scroll: false` option prevents unwanted scrolling during tab changes
- URL cleaning removes the `tab` parameter for the default "store" tab to keep URLs clean
- Bidirectional synchronization ensures URL and component state stay in sync