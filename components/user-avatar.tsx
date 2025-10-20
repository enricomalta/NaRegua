"use client"
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
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronDown,
  Star,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function UserAvatar() {
  const { user, authUser, logout, hasRole } = useAuth()

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
          
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user.id}`}>
              <User className="mr-2 h-4 w-4" />
              Perfil Completo
            </Link>
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

    </>
  )
}