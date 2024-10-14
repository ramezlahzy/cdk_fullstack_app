import type { z } from 'zod'
import type {
  CreatePasswordRequestValidator,
  LoginRequestValidator,
  RegisterRequestValidator,
} from '../validators/user.validator'

import { Client } from './client.types'
import { User } from './user.types'


export class RegisterResponse {
  constructor(public token: string) { }
}

export class LoginResponse {
  constructor(public token: string | undefined, public session: string | undefined, public user: User | undefined, public client: Client | undefined) { }
}

export type CreateNewPasswordRequest = z.infer<typeof CreatePasswordRequestValidator>

export type RegisterRequest = z.infer<typeof RegisterRequestValidator>

export type LoginRequest = z.infer<typeof LoginRequestValidator>
