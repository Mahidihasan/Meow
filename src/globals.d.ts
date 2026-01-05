import type { ReactNode } from 'react'

declare module './context/AuthContext.jsx' {
  export function AuthProvider(props: { children: ReactNode }): JSX.Element
  export function useAuth(): {
    user: any
    loading: boolean
    authMissing: boolean
    signIn: (username: string, password: string) => Promise<void>
    signOut: () => Promise<void>
  }
}

declare module './context/DataContext.jsx' {
  export function DataProvider(props: { children: ReactNode }): JSX.Element
  export function useData(): {
    doc: any
    ready: boolean
    error: string
    setError: (value: string) => void
    update: (path: string, value: unknown) => Promise<void>
  }
}

declare module './services/finance.service.js' {
  export function addDeposit(doc: any, profile: any, entry: any): Promise<void>
  export function addExpense(doc: any, profile: any, entry: any): Promise<void>
}

declare module './services/task.service.js' {
  export function addTask(doc: any, profile: any, task: any): Promise<void>
  export function toggleTask(doc: any, profile: any, index: number): Promise<void>
}

declare module './services/planner.service.js' {
  export function addBuy(doc: any, profile: any, entry: any): Promise<void>
  export function addDate(doc: any, profile: any, entry: any): Promise<void>
  export function toggleBuy(doc: any, profile: any, index: number): Promise<void>
}

declare module './services/period.service.js' {
  export function updatePeriod(doc: any, lastStart: string, cycleLength: number): Promise<void>
}
