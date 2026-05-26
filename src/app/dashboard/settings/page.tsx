'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { clearAuth } from '@/lib/auth'
import type { UserProfile } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'
import { User, Lock, LogOut, Check, Zap } from 'lucide-react'

// ---- schemas ----
function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0
  if (r !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0
  return r === parseInt(digits[10])
}

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

const profileSchema = z.object({
  name:  z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpf:   z.string().refine(v => !v || validateCpf(v), 'CPF inválido').optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Obrigatório'),
  newPassword:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:         z.string(),
}).refine(d => d.newPassword === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
})

const setPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:     z.string(),
}).refine(d => d.newPassword === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>
type SetPassForm   = z.infer<typeof setPasswordSchema>

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-night-300" />
        <p className="text-sm font-semibold text-night-100">{title}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile]   = useState<UserProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saved, setSaved]       = useState<string | null>(null)

  // Profile form
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })
  // Password form
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  // Set password (OAuth users)
  const setPassForm = useForm<SetPassForm>({ resolver: zodResolver(setPasswordSchema) })

  const [profileError,  setProfileError]  = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    api.users.me()
      .then(p => {
        setProfile(p)
        profileForm.setValue('name',  p.name)
        profileForm.setValue('email', p.email)
        profileForm.setValue('cpf',   p.cpf ?? '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const onSaveProfile = async (data: ProfileForm) => {
    setProfileError('')
    try {
      const updated = await api.users.updateProfile({ ...data, cpf: data.cpf || undefined })
      setProfile(updated)
      setSaved('profile')
      setTimeout(() => setSaved(null), 3000)
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordError('')
    try {
      await api.users.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      passwordForm.reset()
      setSaved('password')
      setTimeout(() => setSaved(null), 3000)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Erro ao alterar senha')
    }
  }

  const onSetPassword = async (data: SetPassForm) => {
    setPasswordError('')
    try {
      await api.users.setPassword(data.newPassword)
      setProfile(prev => prev ? { ...prev, hasPassword: true } : prev)
      setPassForm.reset()
      setSaved('password')
      setTimeout(() => setSaved(null), 3000)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Erro ao definir senha')
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const planBadgeVariant = (plan: string): 'green' | 'blue' | 'gray' =>
    plan === 'BLACK' || plan === 'DIAMOND' ? 'green' : plan === 'SMART' ? 'blue' : 'gray'

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-night-700 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-night-50">Configurações</h1>
        <p className="text-sm text-night-300 mt-1">Gerencie seu perfil, senha e sessão</p>
      </div>

      {/* Plano atual */}
      {profile && (
        <div className="flex items-center gap-3 p-4 bg-night-700 rounded-xl border border-night-600">
          <div className="flex-1">
            <p className="text-sm text-night-300">Plano atual</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-semibold text-night-50">{profile.plan}</p>
              <Badge variant={planBadgeVariant(profile.plan)}>Ativo</Badge>
            </div>
          </div>
          <a href="/dashboard/billing" className="text-sm text-brand-600 hover:underline font-medium">
            Gerenciar plano →
          </a>
        </div>
      )}

      {/* Perfil */}
      <SectionCard title="Informações Pessoais" icon={User}>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <Input
            label="Nome completo"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <Input
            type="email"
            label="E-mail"
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register('email')}
          />
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            maxLength={14}
            error={profileForm.formState.errors.cpf?.message}
            {...profileForm.register('cpf')}
            onChange={e => {
              const masked = maskCpf(e.target.value)
              profileForm.setValue('cpf', masked, { shouldValidate: true })
              e.target.value = masked
            }}
          />
          {profileError && (
            <p className="text-sm text-red-600">{profileError}</p>
          )}
          <Button type="submit" loading={profileForm.formState.isSubmitting} size="sm">
            {saved === 'profile' ? (
              <><Check className="w-3.5 h-3.5" /> Salvo!</>
            ) : 'Salvar alterações'}
          </Button>
        </form>
      </SectionCard>

      {/* Senha */}
      <SectionCard title="Segurança" icon={Lock}>
        {profile?.hasPassword ? (
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <Input
              type="password"
              label="Senha atual"
              placeholder="••••••••"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              type="password"
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              type="password"
              label="Confirmar nova senha"
              placeholder="••••••••"
              error={passwordForm.formState.errors.confirm?.message}
              {...passwordForm.register('confirm')}
            />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <Button type="submit" loading={passwordForm.formState.isSubmitting} size="sm">
              {saved === 'password' ? <><Check className="w-3.5 h-3.5" /> Senha alterada!</> : 'Alterar senha'}
            </Button>
          </form>
        ) : (
          <div>
            <p className="text-sm text-night-300 mb-4">
              Sua conta foi criada via Google. Defina uma senha para também poder fazer login com e-mail.
            </p>
            <form onSubmit={setPassForm.handleSubmit(onSetPassword)} className="space-y-4">
              <Input
                type="password"
                label="Nova senha"
                placeholder="Mínimo 8 caracteres"
                error={setPassForm.formState.errors.newPassword?.message}
                {...setPassForm.register('newPassword')}
              />
              <Input
                type="password"
                label="Confirmar senha"
                placeholder="••••••••"
                error={setPassForm.formState.errors.confirm?.message}
                {...setPassForm.register('confirm')}
              />
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <Button type="submit" loading={setPassForm.formState.isSubmitting} size="sm">
                {saved === 'password' ? <><Check className="w-3.5 h-3.5" /> Senha definida!</> : 'Definir senha'}
              </Button>
            </form>
          </div>
        )}
      </SectionCard>

      {/* Sessão */}
      <SectionCard title="Sessão" icon={LogOut}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-night-200 font-medium">Encerrar sessão</p>
            <p className="text-xs text-night-400 mt-0.5">Você será desconectado e redirecionado para o login</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </Button>
        </div>
      </SectionCard>

      {/* Integrações */}
      <SectionCard title="Integrações" icon={Zap}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-night-200 font-medium">Conectar serviços</p>
            <p className="text-xs text-night-400 mt-0.5">Gerenciar integrações com Mercado Livre e outros serviços</p>
          </div>
          <a href="/dashboard/settings/integrations" className="text-sm text-brand-600 hover:underline font-medium">
            Gerenciar →
          </a>
        </div>
      </SectionCard>
    </div>
  )
}
