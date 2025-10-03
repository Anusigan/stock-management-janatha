"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white rounded-3xl flex items-center justify-center animate-pulse p-2">
            <img 
              src="/flux-logo.png" 
              alt="Flux Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
            <p className="text-gray-500">Please wait while we verify your authentication</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect to login
  }

  return <>{children}</>
}
