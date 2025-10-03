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
          <div className="mx-auto w-16 h-16 animate-pulse">
            <img 
              src="/flux-logo.png" 
              alt="Flux Logo" 
              className="w-full h-full object-cover rounded-3xl shadow-xl"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
            <p className="text-gray-500">Please wait while we verify your authentication</p>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/30">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="font-medium">Powered by</span>
                <a 
                  href="https://tekvolabs.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
                >
                  <img 
                    src="/tekvolabs-logo.png" 
                    alt="TekvoLabs" 
                    className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                  />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600">TekvoLabs</span>
                </a>
              </div>
            </div>
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
