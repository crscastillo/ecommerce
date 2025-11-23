# User Roles and Permissions

This document outlines the three user roles available in the ecommerce platform and their respective permissions.

## Role Hierarchy

The platform follows a hierarchical permission structure:

**Administrador > Personal > Visualizador**

Each higher role includes all permissions of lower roles plus additional capabilities.

---

## 🔴 Administrador (Admin)

**Full platform control** - Complete access to all features and settings.

### Core Permissions
- ✅ **User Management**: Invite, remove, and change roles of team members
- ✅ **Store Configuration**: Modify store settings, payment methods, and integrations
- ✅ **Theme & Branding**: Customize store appearance, upload assets, modify themes
- ✅ **Product Management**: Create, edit, delete products and categories
- ✅ **Inventory Control**: Manage stock levels and inventory tracking
- ✅ **Order Management**: View, process, modify, and manage all orders
- ✅ **Customer Management**: Access and manage customer data and profiles
- ✅ **Financial Reports**: Access revenue, sales, and financial analytics
- ✅ **System Settings**: Configure shipping, taxes, and business rules
- ✅ **Data Export**: Export reports and customer/order data

### Use Cases
- Store owners and business managers
- Technical administrators
- Users who need complete platform control

---

## 🟡 Personal (Staff)

**Operational management** - Day-to-day store operations without administrative control.

### Core Permissions
- ✅ **Product Management**: Create, edit, delete products and categories
- ✅ **Inventory Control**: Manage stock levels and inventory tracking
- ✅ **Order Processing**: View, process, and fulfill customer orders
- ✅ **Customer Support**: Access customer information and order history
- ✅ **Basic Reports**: View sales reports and inventory analytics
- ✅ **Content Management**: Update product descriptions and images

### Restrictions
- ❌ **User Management**: Cannot invite or manage team members
- ❌ **Store Settings**: Cannot modify store configuration or integrations
- ❌ **Theme Changes**: Cannot customize store appearance or branding
- ❌ **Financial Access**: Limited access to revenue and financial data
- ❌ **System Configuration**: Cannot change shipping, tax, or business rules

### Use Cases
- Store employees and operators
- Product managers
- Customer service representatives
- Inventory managers

---

## 🟢 Visualizador (Viewer)

**Read-only access** - Monitoring and reporting without modification capabilities.

### Core Permissions
- ✅ **View Products**: Browse product catalog and inventory levels
- ✅ **View Orders**: Access order history and status information
- ✅ **View Customers**: Browse customer profiles and purchase history
- ✅ **Reports & Analytics**: Access dashboards and generate reports
- ✅ **Data Export**: Export reports for external analysis

### Restrictions
- ❌ **No Modifications**: Cannot create, edit, or delete any data
- ❌ **No Order Processing**: Cannot process or fulfill orders
- ❌ **No Inventory Changes**: Cannot modify stock levels
- ❌ **No Settings Access**: Cannot view or modify any configuration
- ❌ **No User Management**: Cannot access team or user settings

### Use Cases
- External stakeholders and investors
- Accountants and financial analysts
- Business consultants
- Supervisors requiring oversight without operational control
- Third-party integrations requiring read access

---

## Permission Matrix

| Feature | Administrador | Personal | Visualizador |
|---------|:-------------:|:--------:|:------------:|
| **User Management** | ✅ | ❌ | ❌ |
| **Store Settings** | ✅ | ❌ | ❌ |
| **Theme & Branding** | ✅ | ❌ | ❌ |
| **Product Management** | ✅ | ✅ | 👁️ View Only |
| **Inventory Control** | ✅ | ✅ | 👁️ View Only |
| **Order Processing** | ✅ | ✅ | 👁️ View Only |
| **Customer Management** | ✅ | ✅ | 👁️ View Only |
| **Reports & Analytics** | ✅ | ✅ (Limited) | ✅ |
| **Financial Data** | ✅ | ❌ | 👁️ View Only |
| **System Configuration** | ✅ | ❌ | ❌ |

---

## Security Notes

### Multi-Tenant Isolation
- All roles are scoped to a specific tenant/store
- Users cannot access data from other tenants
- Role permissions are enforced at both API and database levels

### Row Level Security (RLS)
- Database policies ensure data isolation
- API routes validate user permissions before data access
- Frontend components conditionally render based on user role

### Best Practices
1. **Principle of Least Privilege**: Assign the minimum role necessary for each user's responsibilities
2. **Regular Audits**: Review user roles and permissions periodically
3. **Onboarding/Offboarding**: Promptly add new users and remove departing team members
4. **Role Transitions**: Update roles when responsibilities change

---

## Implementation Details

### Database Structure
```sql
-- Users are managed through tenant_users_invitations table
CREATE TABLE tenant_users_invitations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'staff', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Validation
- Role-based middleware validates permissions for each endpoint
- Service-level authorization checks prevent unauthorized access
- Frontend components use role context to show/hide features

### Translation Keys
```json
{
  "users": {
    "roles": {
      "admin": "Administrador",
      "staff": "Personal", 
      "viewer": "Visualizador"
    }
  }
}
```

---

*Last updated: November 23, 2025*