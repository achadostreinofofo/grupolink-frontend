import type {
  AddGroupPayload, AuthResponse, BlacklistEntry, CheckoutResponse,
  ChurnAnalytics, ConnectWhatsappPayload, CreateMessagePayload,
  CreateShortLinkPayload, CreateStructurePayload, MessageTemplate,
  OverviewAnalytics, PendingAction, ScheduledMessage, ShortLink,
  Structure, StructureAnalytics, SubscriptionStatus, User,
  UserProfile, UtmAnalytics, WhatsappAccount
} from '@/types'

const BASE = '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string; name: string; cpf?: string }) =>
      request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    me: () => request<User>('/auth/me'),

    verifyEmail: (token: string) =>
      request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: 'POST' }),

    resendVerification: () =>
      request<{ message: string }>('/auth/resend-verification', { method: 'POST' }),
  },

  structures: {
    list: () => request<Structure[]>('/structures'),
    get: (id: string) => request<Structure>(`/structures/${id}`),
    create: (data: CreateStructurePayload) =>
      request<Structure>('/structures', { method: 'POST', body: JSON.stringify(data) }),
    addGroup: (structureId: string, data: AddGroupPayload) =>
      request(`/structures/${structureId}/groups`, { method: 'POST', body: JSON.stringify(data) }),
  },

  whatsapp: {
    list: () => request<WhatsappAccount[]>('/whatsapp/accounts'),
    connect: (data: ConnectWhatsappPayload) =>
      request<WhatsappAccount>('/whatsapp/accounts', { method: 'POST', body: JSON.stringify(data) }),
    disconnect: (accountId: string) =>
      request<void>(`/whatsapp/accounts/${accountId}`, { method: 'DELETE' }),
  },

  subscriptions: {
    current: () => request<SubscriptionStatus>('/subscriptions/current'),
    checkout: (plan: string) =>
      request<CheckoutResponse>('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
    cancel: () => request<void>('/subscriptions/cancel', { method: 'DELETE' }),
  },

  analytics: {
    overview:  () => request<OverviewAnalytics>('/analytics/overview'),
    structure: (id: string) => request<StructureAnalytics>(`/analytics/structures/${id}`),
    churn:     (id: string) => request<ChurnAnalytics>(`/analytics/structures/${id}/churn`),
    utm:       (id: string, days = 30) => request<UtmAnalytics>(`/analytics/structures/${id}/utm?days=${days}`),
  },

  templates: {
    list:   () => request<MessageTemplate[]>('/templates'),
    create: (data: { name: string; content: string; mediaUrl?: string }) =>
      request<MessageTemplate>('/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name: string; content: string; mediaUrl?: string }) =>
      request<MessageTemplate>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/templates/${id}`, { method: 'DELETE' }),
  },

  messages: {
    list: () => request<ScheduledMessage[]>('/messages'),
    create: (data: CreateMessagePayload) =>
      request<ScheduledMessage>('/messages', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) => request<void>(`/messages/${id}`, { method: 'DELETE' }),
  },

  blacklist: {
    list: () => request<BlacklistEntry[]>('/blacklist'),
    add: (phoneNumber: string, reason?: string) =>
      request<BlacklistEntry>('/blacklist', { method: 'POST', body: JSON.stringify({ phoneNumber, reason }) }),
    remove: (id: string) => request<void>(`/blacklist/${id}`, { method: 'DELETE' }),
  },

  links: {
    list: () => request<ShortLink[]>('/links'),
    create: (data: CreateShortLinkPayload) =>
      request<ShortLink>('/links', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/links/${id}`, { method: 'DELETE' }),
    toggle: (id: string) => request<ShortLink>(`/links/${id}/toggle`, { method: 'PATCH' }),
  },

  export: {
    members: (structureId: string) =>
      fetch(`/api/structures/${structureId}/export/members.csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }
      }),
    redirects: (structureId: string) =>
      fetch(`/api/structures/${structureId}/export/redirects.csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }
      }),
  },

  dashboard: {
    pendingActions: () => request<PendingAction[]>('/dashboard/pending-actions'),
    updateGroup: (structureId: string, groupId: string, data: { name?: string; inviteLink?: string; maxMembers?: number }) =>
      request(`/dashboard/structures/${structureId}/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  users: {
    me:             () => request<UserProfile>('/users/me'),
    updateProfile:  (data: { name: string; email: string; cpf?: string }) =>
      request<UserProfile>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<void>('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),
    setPassword:    (newPassword: string) =>
      request<void>('/users/me/set-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),
  },
}
