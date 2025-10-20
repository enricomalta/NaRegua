"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { DataModeToggle } from "@/components/data-mode-toggle"
import { useAuth } from "@/lib/auth-context"
import { useRoleProtection, RoleBasedContent } from "@/hooks/use-role-protection"
import { useToast } from "@/hooks/use-toast"
import { getDefaultUserSettings, updateUserSettings } from "@/lib/firebase-service"
import type { UserAppearanceSettings, UserNotificationSettings, UserPrivacySettings, UserRole } from "@/lib/types"
import { User, Bell, Shield, Database, Moon, Globe } from "lucide-react"

export default function SettingsPage() {
  const { user, authUser, login } = useAuth()
  const { isAuthorized, loading: authLoading } = useRoleProtection({
    requireAuth: true
  })
  const { toast } = useToast()

  const defaultSettings = useMemo(() => {
    const role = (authUser?.role as UserRole) ?? "client"
    return getDefaultUserSettings(role)
  }, [authUser?.role])

  const [notifications, setNotifications] = useState<UserNotificationSettings>(defaultSettings.notifications)
  const [privacy, setPrivacy] = useState<UserPrivacySettings>(defaultSettings.privacy)
  const [appearance, setAppearance] = useState<UserAppearanceSettings>(defaultSettings.appearance)

  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [savingAppearance, setSavingAppearance] = useState(false)

  useEffect(() => {
    const target = user?.settings
      ? {
          notifications: {
            ...defaultSettings.notifications,
            ...user.settings.notifications,
          },
          privacy: {
            ...defaultSettings.privacy,
            ...user.settings.privacy,
          },
          appearance: {
            ...defaultSettings.appearance,
            ...user.settings.appearance,
          },
        }
      : defaultSettings

    setNotifications(target.notifications)
    setPrivacy(target.privacy)
    setAppearance(target.appearance)
  }, [user?.settings, defaultSettings])

  const handleSaveNotifications = async () => {
    if (!user) {
      return
    }

    try {
      setSavingNotifications(true)
      const updatedUser = await updateUserSettings(user.id, { notifications })
      if (updatedUser) {
        login(updatedUser)
        toast({
          title: "Preferências atualizadas",
          description: "Suas notificações foram salvas com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar notificações:", error)
      toast({
        title: "Não foi possível salvar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleSavePrivacy = async () => {
    if (!user) {
      return
    }

    try {
      setSavingPrivacy(true)
      const updatedUser = await updateUserSettings(user.id, { privacy })
      if (updatedUser) {
        login(updatedUser)
        toast({
          title: "Privacidade atualizada",
          description: "Suas preferências de privacidade foram salvas.",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar privacidade:", error)
      toast({
        title: "Não foi possível salvar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSavingPrivacy(false)
    }
  }

  const handleSaveAppearance = async () => {
    if (!user) {
      return
    }

    try {
      setSavingAppearance(true)
      const updatedUser = await updateUserSettings(user.id, { appearance })
      if (updatedUser) {
        login(updatedUser)
        toast({
          title: "Aparência atualizada",
          description: "Suas preferências de aparência foram salvas.",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar aparência:", error)
      toast({
        title: "Não foi possível salvar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setSavingAppearance(false)
    }
  }

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setAppearance((prev) => ({ ...prev, language: value }))
  }

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'client': return 'Cliente'
      case 'barber': return 'Barbeiro' 
      case 'admin': return 'Administrador'
      default: return 'Usuário'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue={user?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" defaultValue={user?.phone || ''} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getRoleDisplay(authUser?.role || 'client')}</p>
                        <p className="text-sm text-muted-foreground">Sua função na plataforma</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        authUser?.role === 'client' ? 'bg-blue-100 text-blue-600' :
                        authUser?.role === 'barber' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {authUser?.role?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Atualizar Senha</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Escolha quais notificações você deseja receber</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmação de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando um agendamento for confirmado
                    </p>
                  </div>
                  <Switch
                    checked={notifications.bookingConfirmed}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, bookingConfirmed: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">Receba lembretes 10 minutos antes do horário</p>
                  </div>
                  <Switch
                    checked={notifications.bookingReminder}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, bookingReminder: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novas Avaliações</Label>
                    <p className="text-sm text-muted-foreground">
                      {authUser?.role === 'barber' 
                        ? 'Notificações sobre novas avaliações da sua barbearia'
                        : 'Notificações sobre avaliações das suas barbearias favoritas'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newReview}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, newReview: checked }))
                    }
                  />
                </div>

                <RoleBasedContent allowedRoles={['client']}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promoções e Ofertas</Label>
                      <p className="text-sm text-muted-foreground">Receba ofertas especiais das barbearias</p>
                    </div>
                    <Switch
                      checked={notifications.promotions}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, promotions: checked }))
                      }
                    />
                  </div>
                </RoleBasedContent>

                <RoleBasedContent allowedRoles={['barber']}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos Agendamentos</Label>
                      <p className="text-sm text-muted-foreground">Notificações sobre novos agendamentos</p>
                    </div>
                    <Switch
                      checked={notifications.newBooking}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, newBooking: checked }))
                      }
                    />
                  </div>
                </RoleBasedContent>

                <Button onClick={handleSaveNotifications} disabled={savingNotifications || !user}>
                  {savingNotifications ? "Salvando..." : "Salvar Preferências"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Segurança</CardTitle>
                <CardDescription>Controle quem pode ver suas informações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil Público</Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros usuários vejam seu perfil</p>
                  </div>
                  <Switch
                    checked={privacy.isProfilePublic}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({ ...prev, isProfilePublic: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar Histórico de Avaliações</Label>
                    <p className="text-sm text-muted-foreground">Exibir suas avaliações publicamente</p>
                  </div>
                  <Switch
                    checked={privacy.showReviewHistory}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({ ...prev, showReviewHistory: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={privacy.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({ ...prev, twoFactorEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button onClick={handleSavePrivacy} disabled={savingPrivacy || !user}>
                    {savingPrivacy ? "Salvando..." : "Salvar Preferências"}
                  </Button>
                  <Button variant="destructive">Excluir Conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência do aplicativo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      {appearance.darkMode ? "Ativar tema escuro (atualmente ativo)" : "Ativar tema escuro"}
                    </p>
                  </div>
                  <Switch
                    checked={appearance.darkMode}
                    onCheckedChange={(checked) =>
                      setAppearance((prev) => ({ ...prev, darkMode: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={appearance.language}
                      onChange={handleLanguageChange}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>

                <Button onClick={handleSaveAppearance} disabled={savingAppearance || !user}>
                  {savingAppearance ? "Salvando..." : "Salvar Aparência"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Mode */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Modo de Dados</CardTitle>
                <CardDescription>Alterne entre dados de teste (Mock) e dados reais (Firebase)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="font-semibold mb-2">Modo Atual</h3>
                    <DataModeToggle />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Sobre os Modos:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Mock:</strong> Usa dados de exemplo locais. Ideal para
                        testes e desenvolvimento sem conexão com banco de dados.
                      </p>
                      <p>
                        <strong className="text-foreground">Firebase:</strong> Conecta ao Firebase para dados reais.
                        Requer configuração das variáveis de ambiente do Firebase.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <h4 className="font-medium text-primary mb-2">Configuração do Firebase</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Para usar o modo Firebase, adicione as seguintes variáveis de ambiente:
                    </p>
                    <ul className="text-xs font-mono space-y-1 text-muted-foreground">
                      <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                      <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                      <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                      <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
