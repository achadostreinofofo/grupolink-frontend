import type {
  AddGroupPayload, AuthResponse, AvailableGroup, BlacklistEntry, BroadcastRequest,
  BroadcastResponse, BroadcastStatusDetail, CheckoutResponse,
  ChurnAnalytics, ConnectWhatsappPayload, CreateMessagePayload,
  CreateMonitoredGroupPayload, CreateShortLinkPayload, CreateStructurePayload,
  MessageTemplate, MlStatus, MonitoredGroup, OverviewAnalytics, PendingAction,
  ScheduledMessage, ShortLink, Structure, StructureAnalytics,
  SubscriptionStatus, UpdateMessagePayload, UpdateMonitoredGroupPayload,
  User, UserProfile, UtmAnalytics, WebSessionStartResponse, WebSessionStatus,
  WhatsappAccount
} from '@/types'
import { clearPublicKeyCache, encryptField } from './encryption'

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
    if (body?.error === 'ENCRYPTION_KEY_EXPIRED') clearPublicKeyCache()
    const err = new Error(body?.message ?? body?.error ?? `Erro ${res.status}`) as Error & { code?: string }
    err.code = body?.error
    throw err
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    signup: async (data: { email: string; password: string; name: string; cpf?: string }) => {
      const [encPassword, encCpf] = await Promise.all([
        encryptField(data.password),
        data.cpf ? encryptField(data.cpf) : Promise.resolve(undefined),
      ])
      return request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...data, password: encPassword, cpf: encCpf }),
      })
    },

    login: async (data: { email: string; password: string }) => {
      const encPassword = await encryptField(data.password)
      return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ ...data, password: encPassword }),
      })
    },

    me: () => request<User>('/auth/me'),
  },

  structures: {
    list: () => request<Structure[]>('/structures'),
    get: (id: string) => request<Structure>(`/structures/${id}`),
    create: (data: CreateStructurePayload) =>
      request<Structure>('/structures', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/structures/${id}`, { method: 'DELETE' }),
    addGroup: (structureId: string, data: AddGroupPayload & { participantJids?: string[] }) =>
      request(`/structures/${structureId}/groups`, { method: 'POST', body: JSON.stringify(data) }),
    importGroup: (structureId: string, data: { whatsappGroupId: string; inviteLink?: string; maxMembersPerGroup?: number; fillThreshold?: number }) =>
      request(`/structures/${structureId}/groups/import`, { method: 'POST', body: JSON.stringify(data) }),
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
    listByStructure: (structureId: string) =>
      request<ScheduledMessage[]>(`/structures/${structureId}/messages`),
    create: (structureId: string, data: CreateMessagePayload) =>
      request<ScheduledMessage>(`/structures/${structureId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateMessagePayload) =>
      request<ScheduledMessage>(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    sendNow: (id: string, groupIds?: string[]) =>
      request<ScheduledMessage>(`/messages/${id}/send`, {
        method: 'POST',
        body: JSON.stringify({ groupIds: groupIds?.length ? groupIds : null }),
      }),
    delete: (id: string) => request<void>(`/messages/${id}`, { method: 'DELETE' }),
    // mantido para compatibilidade
    cancel: (id: string) => request<void>(`/messages/${id}`, { method: 'DELETE' }),
  },

  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      const form = new FormData()
      form.append('file', file)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      // Upload direto ao backend para evitar limite de 6MB do Lambda/Amplify proxy
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Erro ${res.status}`)
      }
      return res.json()
    },
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

  whatsappWeb: {
    startSession: () => request<WebSessionStartResponse>('/whatsapp/web/sessions', { method: 'POST' }),
    getStatus: (sessionId: string) => request<WebSessionStatus>(`/whatsapp/web/sessions/${sessionId}`),
    listSessions: () => request<WebSessionStatus[]>('/whatsapp/web/sessions'),
    listGroups: async (sessionId: string): Promise<{ groupId: string; name: string; participants: number }[]> => {
      // Chamada direta ao backend — evita timeout de 10s do Amplify Lambda
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const token = getToken()
      const res = await fetch(`${apiUrl}/api/whatsapp/web/sessions/${sessionId}/groups`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Erro ${res.status}`)
      }
      return res.json()
    },
    disconnect: (sessionId: string) => request<void>(`/whatsapp/web/sessions/${sessionId}`, { method: 'DELETE' }),
    reconnect: (sessionId: string) => request<WebSessionStatus>(`/whatsapp/web/sessions/${sessionId}/reconnect`, { method: 'POST' }),
    checkNumber: (phone: string) =>
      request<{ phone: string; exists: boolean; formattedPhone: string; jid: string }>('/whatsapp/web/check-number', {
        method: 'POST', body: JSON.stringify({ phone }),
      }),
  },

  broadcast: {
    send: (structureId: string, data: BroadcastRequest) =>
      request<BroadcastResponse>(`/structures/${structureId}/broadcast`, { method: 'POST', body: JSON.stringify(data) }),
    getStatus: (structureId: string, broadcastId: string) =>
      request<BroadcastStatusDetail>(`/structures/${structureId}/broadcast/${broadcastId}`),
    list: () => request<BroadcastStatusDetail[]>('/broadcasts'),
  },

  contact: {
    send: (data: { name: string; email: string; message: string }) =>
      request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(data) }),
  },

  monitoredGroups: {
    list:           () => request<MonitoredGroup[]>('/monitored-groups'),
    listAvailable:  async (sessionId: string): Promise<AvailableGroup[]> => {
      // Chamada direta ao backend — evita timeout de 10s do Amplify Lambda
      // groupFetchAllParticipating() pode demorar 15-30s em contas com muitos grupos
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const token = getToken()
      const res = await fetch(
        `${apiUrl}/api/monitored-groups/available?sessionId=${encodeURIComponent(sessionId)}`,
        { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Erro ${res.status}`)
      }
      return res.json()
    },
    create:         (data: CreateMonitoredGroupPayload) =>
      request<MonitoredGroup>('/monitored-groups', { method: 'POST', body: JSON.stringify(data) }),
    update:         (id: string, data: UpdateMonitoredGroupPayload) =>
      request<MonitoredGroup>(`/monitored-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:         (id: string) => request<void>(`/monitored-groups/${id}`, { method: 'DELETE' }),
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

  mercadolivre: {
    getStatus:  () => request<MlStatus>('/ml/status'),
    startOAuth: () => request<{ authorizationUrl: string }>('/ml/oauth/start'),
    disconnect: () => request<void>('/ml/disconnect', { method: 'DELETE' }),
  },
}
