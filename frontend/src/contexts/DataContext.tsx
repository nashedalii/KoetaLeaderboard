'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { dummyUsers, User, SkorBulanan } from '@/data/dummyUsers'

interface PendingValidation {
  id: string
  driverId: number
  bulan: string
  petugas: User
  skor: {
    etikaAdab: number
    disiplin: number
    loyalitas: number
    skillMengemudi: number
    perawatanKendaraan: number
    performa: number
  }
  totalSkor: number
  catatanPetugas?: string
  buktiFiles?: File[]
  statusValidasi: 'pending' | 'approved' | 'rejected'
  catatanAdmin?: string
  tanggalSubmit: string
}

interface DataContextType {
  pendingValidations: PendingValidation[]
  addPendingValidation: (validation: Omit<PendingValidation, 'id' | 'tanggalSubmit' | 'statusValidasi'>) => void
  approvePendingValidation: (id: string) => void
  rejectPendingValidation: (id: string, catatanAdmin: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [pendingValidations, setPendingValidations] = useState<PendingValidation[]>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('pendingValidations')
      console.log('Initial load from localStorage:', savedData)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          console.log('Parsed initial data:', parsed)
          return parsed
        } catch (error) {
          console.error('Error parsing saved data:', error)
        }
      }
    }
    return []
  })

  // Also load on mount (backup)
  useEffect(() => {
    const savedData = localStorage.getItem('pendingValidations')
    console.log('useEffect load from localStorage:', savedData)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log('useEffect parsed data:', parsed)
        if (parsed.length > 0) {
          setPendingValidations(parsed)
        }
      } catch (error) {
        console.error('Error loading pending validations:', error)
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (pendingValidations.length > 0 || typeof window !== 'undefined') {
      const dataToSave = JSON.stringify(pendingValidations)
      console.log('Saving to localStorage:', dataToSave)
      localStorage.setItem('pendingValidations', dataToSave)
      
      // Verify save
      const verification = localStorage.getItem('pendingValidations')
      console.log('Verification - saved data:', verification)
    }
  }, [pendingValidations])

  const addPendingValidation = (validation: Omit<PendingValidation, 'id' | 'tanggalSubmit' | 'statusValidasi'>) => {
    // Convert File objects to filenames for storage
    const fileNames = validation.buktiFiles?.map(f => f.name) || []
    
    const newValidation: PendingValidation = {
      ...validation,
      buktiFiles: fileNames as any, // Store as string array instead of File array
      id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      statusValidasi: 'pending',
      tanggalSubmit: new Date().toISOString()
    }
    
    console.log('Adding pending validation:', newValidation)
    
    // Immediately save to localStorage
    const currentData = localStorage.getItem('pendingValidations')
    const currentArray = currentData ? JSON.parse(currentData) : []
    const updatedArray = [...currentArray, newValidation]
    localStorage.setItem('pendingValidations', JSON.stringify(updatedArray))
    console.log('Immediately saved to localStorage:', updatedArray)
    
    setPendingValidations(prev => {
      const updated = [...prev, newValidation]
      console.log('Updated pending validations in state:', updated)
      return updated
    })
  }

  const approvePendingValidation = (id: string) => {
    setPendingValidations(prev => 
      prev.map(val => 
        val.id === id 
          ? { ...val, statusValidasi: 'approved' as const }
          : val
      )
    )
  }

  const rejectPendingValidation = (id: string, catatanAdmin: string) => {
    setPendingValidations(prev => 
      prev.map(val => 
        val.id === id 
          ? { ...val, statusValidasi: 'rejected' as const, catatanAdmin }
          : val
      )
    )
  }

  return (
    <DataContext.Provider value={{
      pendingValidations,
      addPendingValidation,
      approvePendingValidation,
      rejectPendingValidation
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}