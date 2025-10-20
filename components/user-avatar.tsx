"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  User, 
  Calendar, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronDown,
  MapPin,
  Star,
  Clock
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function UserAvatar() {
  const { user, authUser, logout, hasRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user || !authUser) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'client': return 'Cliente'
      case 'barber': return 'Barbeiro'
      case 'admin': return 'Administrador'
      default: return 'Usuário'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'text-blue-600 bg-blue-100'
      case 'barber': return 'text-green-600 bg-green-100'
      case 'admin': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleLogout = async () => {
    await logout()
    setSidebarOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                {getRoleDisplay(user.role)}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setSidebarOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            Perfil Completo
          </DropdownMenuItem>
          
          {hasRole('client') && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/client/dashboard">
                  <Calendar className="mr-2 h-4 w-4" />
                  Meus Agendamentos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/review">
                  <Star className="mr-2 h-4 w-4" />
                  Minhas Avaliações
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          {hasRole('barber') && (
            <DropdownMenuItem asChild>
              <Link href="/barber/dashboard">
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard Barbeiro
              </Link>
            </DropdownMenuItem>
          )}
          
          {hasRole('admin') && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <Settings className="mr-2 h-4 w-4" />
                Painel Admin
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{user.name}</SheetTitle>
                <SheetDescription>{user.email}</SheetDescription>
                <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getRoleColor(user.role)}`}>
                  {getRoleDisplay(user.role)}
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Informações do Usuário */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nome</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Menu de Navegação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Menu</h3>
              <div className="grid gap-2">
                {hasRole('client') && (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/client/dashboard" onClick={() => setSidebarOpen(false)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Meus Agendamentos
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/review" onClick={() => setSidebarOpen(false)}>
                        <Star className="mr-2 h-4 w-4" />
                        Minhas Avaliações
                      </Link>
                    </Button>
                  </>
                )}
                
                {hasRole('barber') && (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/barber/dashboard" onClick={() => setSidebarOpen(false)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Dashboard Barbeiro
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/barber/manage" onClick={() => setSidebarOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Gerenciar Barbearia
                      </Link>
                    </Button>
                  </>
                )}
                
                {hasRole('admin') && (
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Painel Administrativo
                    </Link>
                  </Button>
                )}
                
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/map" onClick={() => setSidebarOpen(false)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Encontrar Barbearias
                  </Link>
                </Button>
                
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/settings" onClick={() => setSidebarOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </Button>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ações</h3>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair da Conta
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}