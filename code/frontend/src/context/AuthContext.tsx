'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  email: string
  name: string
  contactPerson?: string
  phone?: string
  address?: string
  country?: string
  status: string
  createdAt: string
}

interface AuthContextType {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: UpdateProfileData) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  contactPerson?: string
  phone?: string
  address?: string
  country?: string
}

interface UpdateProfileData {
  name?: string
  contactPerson?: string
  phone?: string
  address?: string
  country?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('customer_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/customer-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        // Token invalid, clear it
        localStorage.removeItem('customer_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('customer_token')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/customer-auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const result = await response.json()

      // Save token and customer data
      localStorage.setItem('customer_token', result.access_token)
      setCustomer(result.customer)

      // Redirect to products page
      router.push('/products')
    } catch (error: any) {
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/customer-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const result = await response.json()

      // Save token and customer data
      localStorage.setItem('customer_token', result.access_token)
      setCustomer(result.customer)

      // Redirect to products page
      router.push('/products')
    } catch (error: any) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('customer_token')
    setCustomer(null)
    router.push('/')
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const token = localStorage.getItem('customer_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_URL}/customer-auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Update failed')
      }

      const result = await response.json()
      setCustomer(result)
    } catch (error: any) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
