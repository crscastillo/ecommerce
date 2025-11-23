'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Users, Trash2, Mail } from 'lucide-react'

interface TenantUser {
  id: string
  user_id: string
  role: string
  is_active: boolean
  invited_at: string
  type?: 'user' | 'invitation'
  user?: {
    email: string
  }
}

interface UsersTabProps {
  tenantUsers: TenantUser[]
  inviteEmail: string
  inviteRole: string
  saving: boolean
  onInviteEmailChange: (email: string) => void
  onInviteRoleChange: (role: string) => void
  onInviteUser: () => Promise<void>
  onUpdateUserRole: (userId: string, role: string) => Promise<void>
  onRemoveUser: (userId: string) => Promise<void>
  onResendInvitation: (invitationId: string) => Promise<void>
  getRoleBadgeVariant: (role: string) => 'default' | 'secondary' | 'outline'
}

export function UsersTab({
  tenantUsers,
  inviteEmail,
  inviteRole,
  saving,
  onInviteEmailChange,
  onInviteRoleChange,
  onInviteUser,
  onUpdateUserRole,
  onRemoveUser,
  onResendInvitation,
  getRoleBadgeVariant
}: UsersTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.inviteNewUser')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder={t('users.inviteEmail')}
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
              />
            </div>
            <Select value={inviteRole} onValueChange={onInviteRoleChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                <SelectItem value="staff">{t('users.roles.staff')}</SelectItem>
                <SelectItem value="viewer">{t('users.roles.viewer')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onInviteUser} disabled={saving || !inviteEmail.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('users.inviteButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.teamMembers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {tenantUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('users.noTeamMembers')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('users.inviteUsersHelp')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenantUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {user.user?.email || `${t('users.pendingInvitation')} (${user.user_id})`}
                      </span>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="secondary">{t('users.status.pending')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('users.invited')} {new Date(user.invited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={user.role} 
                      onValueChange={(value) => onUpdateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                        <SelectItem value="staff">{t('users.roles.staff')}</SelectItem>
                        <SelectItem value="viewer">{t('users.roles.viewer')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {!user.is_active && user.type === 'invitation' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onResendInvitation(user.id)}
                        disabled={saving}
                        title={t('users.resendInvitation')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('users.removeTeamMember')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('users.removeConfirmation')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemoveUser(user.id)}>
                            {tCommon('remove')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
