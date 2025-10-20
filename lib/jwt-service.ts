import Cookies from 'js-cookie'
import type { User } from './types'

const TOKEN_COOKIE_NAME = 'naregua-auth'

export interface AuthPayload {
  userId: string
  email: string
  role: string
  name: string
  avatar?: string
  timestamp: number
}

export class AuthService {
  // Salvar dados do usuário autenticado
  static saveAuth(user: User): void {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      timestamp: Date.now()
    }

    // Salvar como string JSON no cookie
    Cookies.set(TOKEN_COOKIE_NAME, JSON.stringify(payload), {
      expires: 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  // Obter dados do usuário autenticado
  static getAuth(): AuthPayload | null {
    try {
      const authData = Cookies.get(TOKEN_COOKIE_NAME)
      if (!authData) return null
      
      const payload = JSON.parse(authData) as AuthPayload
      
      // Verificar se não expirou (7 dias)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 dias em ms
      if (Date.now() - payload.timestamp > maxAge) {
        this.removeAuth()
        return null
      }
      
      return payload
    } catch (error) {
      console.error('Error parsing auth data:', error)
      this.removeAuth()
      return null
    }
  }

  // Remover autenticação (logout)
  static removeAuth(): void {
    Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' })
  }

  // Verificar se usuário está autenticado
  static isAuthenticated(): boolean {
    return !!this.getAuth()
  }

  // Obter dados do usuário atual
  static getCurrentUser(): AuthPayload | null {
    return this.getAuth()
  }

  // Verificar role do usuário
  static hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === requiredRole
  }

  // Verificar se tem uma das roles especificadas
  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser()
    return !!user && roles.includes(user.role)
  }

  // Atualizar dados do usuário
  static updateAuth(user: User): void {
    this.saveAuth(user)
  }

  // Verificar se o token está válido (não expirado)
  static isTokenValid(): boolean {
    const authData = this.getAuth()
    return !!authData
  }
}