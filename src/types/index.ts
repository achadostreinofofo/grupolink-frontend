export interface User {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'SMART' | 'DIAMOND' | 'BLACK'
  whatsappIntegrated: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  userId: string
  email: string
  name: string
  plan: string
}

export interface Group {
  id: string
  name: string
  inviteLink: string | null
  memberCount: number
  maxMembers: number
  capacityPercentage: number
  clickCount: number
  status: 'ACTIVE' | 'FULL' | 'INACTIVE' | 'CREATING'
  sortOrder: number
}

export interface Structure {
  id: string
  name: string
  slug: string
  description: string | null
  maxMembersPerGroup: number
  fillThreshold: number
  active: boolean
  groups: Group[]
  smartLink: string
}

export interface CreateStructurePayload {
  name: string
  description?: string
  maxMembersPerGroup?: number
  fillThreshold?: number
}

export interface AddGroupPayload {
  name: string
  inviteLink?: string
  maxMembers?: number
}

export interface WhatsappAccount {
  id: string
  phoneNumberId: string
  displayName: string | null
  displayPhone: string | null
  active: boolean
}

export interface ConnectWhatsappPayload {
  phoneNumberId: string
  accessToken: string
}

export interface CheckoutResponse {
  checkoutUrl: string
  subscriptionId: string
  plan: string
  amount: number
}

export interface SubscriptionStatus {
  subscriptionId: string | null
  plan: string
  status: string
  payerEmail: string | null
  periodEndDate: string | null
}

export interface DailyClick {
  date: string
  clicks: number
}

export interface GroupAnalytics {
  groupId: string
  groupName: string
  memberCount: number
  maxMembers: number
  capacityPercentage: number
  clicksTotal: number
  status: string
}

export interface OverviewAnalytics {
  totalStructures: number
  totalGroups: number
  totalMembers: number
  totalClicks: number
  clicksLast7Days: number
  clicksByDay: DailyClick[]
}

export interface StructureAnalytics {
  structureId: string
  structureName: string
  smartLink: string
  totalClicks: number
  totalMembers: number
  clicksLast7Days: number
  clicksByDay: DailyClick[]
  groups: GroupAnalytics[]
}

export interface ScheduledMessage {
  id: string
  title: string
  content: string
  mediaUrl: string | null
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
  scheduledAt: string
  executedAt: string | null
  errorMessage: string | null
  structureId: string | null
  structureName: string | null
}

export interface CreateMessagePayload {
  title: string
  content: string
  mediaUrl?: string
  structureId?: string
  scheduledAt: string
}

export interface BlacklistEntry {
  id: string
  phoneNumber: string
  reason: string | null
  createdAt: string
}

export interface ShortLink {
  id: string
  code: string
  shortUrl: string
  targetUrl: string
  title: string | null
  clicks: number
  active: boolean
  expiresAt: string | null
  createdAt: string
}

export interface CreateShortLinkPayload {
  targetUrl: string
  code?: string
  title?: string
  expiresAt?: string
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  mediaUrl: string | null
  createdAt: string
}

export interface DailyExit { date: string; exits: number }
export interface GroupChurn { groupId: string; groupName: string; exits: number }

export interface ChurnAnalytics {
  structureId: string
  totalExits: number
  totalJoins: number
  churnRate: number
  exitsByDay: DailyExit[]
  exitsByGroup: GroupChurn[]
}

export interface UtmEntry { label: string; clicks: number; percentage: number }

export interface UtmAnalytics {
  structureId: string
  period: string
  bySources: UtmEntry[]
  byMedium: UtmEntry[]
  byCampaign: UtmEntry[]
}

export interface PendingAction {
  groupId: string
  groupName: string
  structureId: string
  structureName: string
  structureSlug: string
  sortOrder: number
  createdAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  cpf: string | null
  plan: string
  whatsappIntegrated: boolean
  hasPassword: boolean
  createdAt: string
}
