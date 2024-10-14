import { Client } from "./client.types"

export enum UserType {
  USER = 'USER',
  CLIENT = 'CLIENT',
}

export interface User {
  userid: string
  email: string
  firstName: string
  lastName: string
  status: string
  clientid: string
  accesslevel: string
}

export interface GetCurrentUserResponse {
  currentUser: User | null;
  currentClient: Client | null;
}


