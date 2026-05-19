import { api } from '../api'

// Mock encryption module
jest.mock('../encryption', () => ({
  encryptField: jest.fn().mockResolvedValue('encrypted-value'),
  clearPublicKeyCache: jest.fn(),
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

function mockOkResponse(data: unknown, status = 200, headers?: Record<string, string>) {
  return {
    ok: true,
    status,
    headers: { get: (h: string) => headers?.[h] ?? null },
    json: jest.fn().mockResolvedValue(data),
  }
}

function mockErrorResponse(status: number, body: unknown) {
  return {
    ok: false,
    status,
    json: jest.fn().mockResolvedValue(body),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockLocalStorage.clear()
  mockFetch.mockResolvedValue(mockOkResponse({}))
})

describe('request internals', () => {
  it('includes Authorization header when token exists', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('my-token')
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))

    await api.structures.list()

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer my-token')
  })

  it('omits Authorization header when no token', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null)
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))

    await api.structures.list()

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers.Authorization).toBeUndefined()
  })

  it('returns undefined for 204 responses', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    const result = await api.structures.delete('id-1')
    expect(result).toBeUndefined()
  })

  it('returns undefined when content-length is 0', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (h: string) => h === 'content-length' ? '0' : null }, json: jest.fn() })
    const result = await api.structures.delete('id-1')
    expect(result).toBeUndefined()
  })

  it('throws error with message from response body', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(400, { message: 'Bad request' }))
    await expect(api.structures.list()).rejects.toThrow('Bad request')
  })

  it('throws error with error code from response body', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(400, { error: 'SOME_CODE' }))
    const err = await api.structures.list().catch(e => e)
    expect(err.code).toBe('SOME_CODE')
  })

  it('falls back to status code when body has no message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: jest.fn().mockRejectedValue(new Error()) })
    await expect(api.structures.list()).rejects.toThrow('Erro 500')
  })

  it('clears encryption cache on ENCRYPTION_KEY_EXPIRED error', async () => {
    const { clearPublicKeyCache } = await import('../encryption')
    mockFetch.mockResolvedValueOnce(mockErrorResponse(400, { error: 'ENCRYPTION_KEY_EXPIRED' }))
    await api.structures.list().catch(() => {})
    expect(clearPublicKeyCache).toHaveBeenCalled()
  })
})

describe('api.auth', () => {
  it('auth.me calls GET /api/auth/me', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ id: '1' }))
    await api.auth.me()
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ headers: expect.any(Object) }))
  })

  it('auth.login encrypts password and calls POST /api/auth/login', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ token: 'tok' }))
    await api.auth.login({ email: 'a@b.com', password: 'pass' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body)
    expect(body.password).toBe('encrypted-value')
  })

  it('auth.signup encrypts password and optional cpf', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ token: 'tok' }))
    await api.auth.signup({ email: 'a@b.com', password: 'pass', name: 'User', cpf: '12345678900' })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.password).toBe('encrypted-value')
    expect(body.cpf).toBe('encrypted-value')
  })

  it('auth.signup without cpf sends undefined cpf', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ token: 'tok' }))
    await api.auth.signup({ email: 'a@b.com', password: 'pass', name: 'User' })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.cpf).toBeUndefined()
  })
})

describe('api.structures', () => {
  it('list calls GET /api/structures', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.structures.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/structures')
  })

  it('get calls GET /api/structures/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.structures.get('str-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/structures/str-1')
  })

  it('create calls POST /api/structures with body', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.structures.create({ name: 'My Structure' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body).name).toBe('My Structure')
  })

  it('delete calls DELETE /api/structures/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.structures.delete('str-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1')
    expect(init.method).toBe('DELETE')
  })

  it('addGroup calls POST /api/structures/:id/groups', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.structures.addGroup('str-1', { name: 'Group A' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1/groups')
    expect(init.method).toBe('POST')
  })
})

describe('api.whatsapp', () => {
  it('list calls GET /api/whatsapp/accounts', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.whatsapp.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/whatsapp/accounts')
  })

  it('connect calls POST /api/whatsapp/accounts', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.whatsapp.connect({ phoneNumberId: '123', accessToken: 'tok' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/whatsapp/accounts')
    expect(init.method).toBe('POST')
  })

  it('disconnect calls DELETE /api/whatsapp/accounts/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.whatsapp.disconnect('acc-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/whatsapp/accounts/acc-1')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.subscriptions', () => {
  it('current calls GET /api/subscriptions/current', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.subscriptions.current()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/subscriptions/current')
  })

  it('checkout calls POST /api/subscriptions/checkout with plan', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.subscriptions.checkout('SMART')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.plan).toBe('SMART')
  })

  it('cancel calls DELETE /api/subscriptions/cancel', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.subscriptions.cancel()
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/subscriptions/cancel')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.analytics', () => {
  it('overview calls GET /api/analytics/overview', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.analytics.overview()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/analytics/overview')
  })

  it('structure calls GET /api/analytics/structures/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.analytics.structure('str-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/analytics/structures/str-1')
  })

  it('churn calls GET /api/analytics/structures/:id/churn', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.analytics.churn('str-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/analytics/structures/str-1/churn')
  })

  it('utm calls with default 30 days', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.analytics.utm('str-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/analytics/structures/str-1/utm?days=30')
  })

  it('utm accepts custom days', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.analytics.utm('str-1', 7)
    expect(mockFetch.mock.calls[0][0]).toBe('/api/analytics/structures/str-1/utm?days=7')
  })
})

describe('api.templates', () => {
  it('list calls GET /api/templates', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.templates.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/templates')
  })

  it('create calls POST /api/templates', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.templates.create({ name: 'T1', content: 'Hello' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/templates')
    expect(init.method).toBe('POST')
  })

  it('update calls PUT /api/templates/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.templates.update('t-1', { name: 'T1', content: 'Hi' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/templates/t-1')
    expect(init.method).toBe('PUT')
  })

  it('delete calls DELETE /api/templates/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.templates.delete('t-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/templates/t-1')
  })
})

describe('api.messages', () => {
  it('list calls GET /api/messages', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.messages.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/messages')
  })

  it('update calls PUT /api/messages/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.messages.update('msg-1', { title: 'Updated', content: 'New content' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/messages/msg-1')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body).title).toBe('Updated')
  })

  it('delete calls DELETE /api/messages/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.messages.delete('msg-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/messages/msg-1')
    expect(init.method).toBe('DELETE')
  })

  it('listByStructure calls GET /api/structures/:id/messages', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.messages.listByStructure('str-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/structures/str-1/messages')
  })

  it('create calls POST /api/structures/:id/messages', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.messages.create('str-1', { title: 'Msg', content: 'Hi' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1/messages')
    expect(init.method).toBe('POST')
  })

  it('sendNow with groupIds sends array', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.messages.sendNow('msg-1', ['g1', 'g2'])
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.groupIds).toEqual(['g1', 'g2'])
  })

  it('sendNow without groupIds sends null', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.messages.sendNow('msg-1')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.groupIds).toBeNull()
  })

  it('cancel calls DELETE /api/messages/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.messages.cancel('msg-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/messages/msg-1')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.blacklist', () => {
  it('list calls GET /api/blacklist', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.blacklist.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/blacklist')
  })

  it('add calls POST with phoneNumber and reason', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.blacklist.add('5511999999999', 'spam')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.phoneNumber).toBe('5511999999999')
    expect(body.reason).toBe('spam')
  })

  it('remove calls DELETE /api/blacklist/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.blacklist.remove('bl-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/blacklist/bl-1')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.links', () => {
  it('list calls GET /api/links', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.links.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/links')
  })

  it('create calls POST /api/links', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.links.create({ targetUrl: 'https://example.com' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/links')
    expect(init.method).toBe('POST')
  })

  it('delete calls DELETE /api/links/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.links.delete('lnk-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/links/lnk-1')
    expect(init.method).toBe('DELETE')
  })

  it('toggle calls PATCH /api/links/:id/toggle', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.links.toggle('lnk-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/links/lnk-1/toggle')
    expect(init.method).toBe('PATCH')
  })
})

describe('api.export', () => {
  it('members fetches the CSV export URL with auth header', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('my-token')
    mockFetch.mockResolvedValueOnce({ ok: true })
    await api.export.members('str-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1/export/members.csv')
    expect(init.headers.Authorization).toContain('Bearer my-token')
  })

  it('redirects fetches the CSV export URL with auth header', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('my-token')
    mockFetch.mockResolvedValueOnce({ ok: true })
    await api.export.redirects('str-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1/export/redirects.csv')
    expect(init.headers.Authorization).toContain('Bearer my-token')
  })
})

describe('api.dashboard', () => {
  it('pendingActions calls GET /api/dashboard/pending-actions', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.dashboard.pendingActions()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/dashboard/pending-actions')
  })

  it('updateGroup calls PUT with correct URL', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.dashboard.updateGroup('str-1', 'grp-1', { name: 'New Name' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/dashboard/structures/str-1/groups/grp-1')
    expect(init.method).toBe('PUT')
  })
})

describe('api.whatsappWeb', () => {
  it('startSession calls POST /api/whatsapp/web/sessions', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.whatsappWeb.startSession()
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/whatsapp/web/sessions')
    expect(init.method).toBe('POST')
  })

  it('getStatus calls GET /api/whatsapp/web/sessions/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.whatsappWeb.getStatus('sess-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/whatsapp/web/sessions/sess-1')
  })

  it('listSessions calls GET /api/whatsapp/web/sessions', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.whatsappWeb.listSessions()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/whatsapp/web/sessions')
  })

  it('disconnect calls DELETE /api/whatsapp/web/sessions/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.whatsappWeb.disconnect('sess-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/whatsapp/web/sessions/sess-1')
    expect(init.method).toBe('DELETE')
  })

  it('checkNumber calls POST /api/whatsapp/web/check-number', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.whatsappWeb.checkNumber('+5511999999999')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/whatsapp/web/check-number')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body).phone).toBe('+5511999999999')
  })
})

describe('api.broadcast', () => {
  it('send calls POST /api/structures/:id/broadcast', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.broadcast.send('str-1', { content: 'Hello', messageType: 'TEXT' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/structures/str-1/broadcast')
    expect(init.method).toBe('POST')
  })

  it('getStatus calls GET /api/structures/:id/broadcast/:broadcastId', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.broadcast.getStatus('str-1', 'bc-1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/structures/str-1/broadcast/bc-1')
  })

  it('list calls GET /api/broadcasts', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.broadcast.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/broadcasts')
  })
})

describe('api.contact', () => {
  it('send calls POST /api/contact', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ message: 'ok' }))
    await api.contact.send({ name: 'John', email: 'j@b.com', message: 'Hi' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
  })
})

describe('api.monitoredGroups', () => {
  it('list calls GET /api/monitored-groups', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.monitoredGroups.list()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/monitored-groups')
  })

  it('listAvailable encodes sessionId', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse([]))
    await api.monitoredGroups.listAvailable('sess 1')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/monitored-groups/available?sessionId=sess%201')
  })

  it('create calls POST /api/monitored-groups', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.monitoredGroups.create({ sessionId: 's1', whatsappGroupId: 'g1', structureId: 'str-1' })
    expect(mockFetch.mock.calls[0][1].method).toBe('POST')
  })

  it('update calls PUT /api/monitored-groups/:id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.monitoredGroups.update('mg-1', { active: false })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/monitored-groups/mg-1')
    expect(init.method).toBe('PUT')
  })

  it('delete calls DELETE /api/monitored-groups/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.monitoredGroups.delete('mg-1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/monitored-groups/mg-1')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.users', () => {
  it('me calls GET /api/users/me', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.users.me()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/users/me')
  })

  it('updateProfile calls PUT /api/users/me', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.users.updateProfile({ name: 'Rafael', email: 'r@b.com' })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/users/me')
    expect(init.method).toBe('PUT')
  })

  it('changePassword calls PUT /api/users/me/password', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.users.changePassword({ currentPassword: 'old', newPassword: 'new' })
    expect(mockFetch.mock.calls[0][0]).toBe('/api/users/me/password')
  })

  it('setPassword calls POST /api/users/me/set-password', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.users.setPassword('newpass')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/users/me/set-password')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body).newPassword).toBe('newpass')
  })
})

describe('api.mercadolivre', () => {
  it('getStatus calls GET /api/ml/status', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({}))
    await api.mercadolivre.getStatus()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/ml/status')
  })

  it('startOAuth calls GET /api/ml/oauth/start', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ authorizationUrl: 'https://ml.com' }))
    await api.mercadolivre.startOAuth()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/ml/oauth/start')
  })

  it('disconnect calls DELETE /api/ml/disconnect', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null }, json: jest.fn() })
    await api.mercadolivre.disconnect()
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/ml/disconnect')
    expect(init.method).toBe('DELETE')
  })
})

describe('api.upload', () => {
  it('image calls POST /api/upload/image with form data', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('tok')
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ url: 'https://cdn.com/img.jpg' }) })
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await api.upload.image(file)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/upload/image')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
    expect(result).toEqual({ url: 'https://cdn.com/img.jpg' })
  })

  it('image throws when upload fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 413, json: jest.fn().mockResolvedValue({ message: 'Too large' }) })
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(api.upload.image(file)).rejects.toThrow('Too large')
  })
})
