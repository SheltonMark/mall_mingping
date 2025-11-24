'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Salesperson {
  id: string
  name: string
  accountId: string
  email?: string
}

interface SalespersonAuthContextType {
  salesperson: Salesperson | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, salespersonData: Salesperson) => void
  logout: () => void
  checkAuth: () => void
}

const SalespersonAuthContext = createContext<SalespersonAuthContextType | undefined>(undefined)

export function SalespersonAuthProvider({ children }: { children: ReactNode }) {
  const [salesperson, setSalesperson] = useState<Salesperson | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = () => {
    const token = localStorage.getItem('salesperson_token')
    const salespersonData = localStorage.getItem('salesperson_data')

    if (token && salespersonData) {
      try {
        const parsed = JSON.parse(salespersonData)
        setSalesperson(parsed)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse salesperson data:', error)
        logout()
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = (token: string, salespersonData: Salesperson) => {
    localStorage.setItem('salesperson_token', token)
    localStorage.setItem('salesperson_data', JSON.stringify(salespersonData))
    setSalesperson(salespersonData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('salesperson_token')
    localStorage.removeItem('salesperson_data')
    setSalesperson(null)
    setIsAuthenticated(false)
  }

  return (
    <SalespersonAuthContext.Provider value={{ salesperson, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </SalespersonAuthContext.Provider>
  )
}

export function useSalespersonAuth() {
  const context = useContext(SalespersonAuthContext)
  if (context === undefined) {
    throw new Error('useSalespersonAuth must be used within a SalespersonAuthProvider')
  }
  return context
}
