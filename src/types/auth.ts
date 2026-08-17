/**
 * Auth types — shared shapes for authentication and authorization.
 */

export interface LoginCredentials {
  username: string
  password: string
}

export interface SessionUser {
  id: string
  username: string
  email: string
  fullName: string
  fullNameAr: string | null
  roleId: string | null
  roleCode: string | null
  roleName: string | null
  roleNameAr: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  mustChangePassword: boolean
}

export interface Session {
  user: SessionUser
  permissionCodes: string[]
  loginAt: number
  expiresAt: number
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status: AuthStatus
  session: Session | null
  error: string | null
}

export interface LoginResult {
  success: boolean
  mustChangePassword: boolean
  error?: string
}

export interface ChangePasswordResult {
  success: boolean
  error?: string
}
