"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Basic validation
    if (!email || !password) {
      setMessage("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (isSignUp && password.length < 6) {
      setMessage("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          setMessage(error.message)
        } else {
          setMessage("Account created successfully! Check your email for the confirmation link.")
        }
      } else {
        console.log('Attempting to sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('Sign in error:', error)
          setMessage("Invalid email or password. Please try again.")
        } else {
          console.log('Sign in successful:', data.user?.email)
          setMessage("Signing in...")
          router.push("/")
          router.refresh()
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/20 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl shadow-lg border border-white/20">
            <Image 
              src="/flux-logo.png" 
              alt="Flux Logo" 
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-gray-700 bg-clip-text text-transparent">
              Flux
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-base font-medium">
              Stock Management Simplified
            </CardDescription>
            <CardDescription className="text-gray-500 mt-3 text-sm">
              {isSignUp ? "Create your account to get started" : "Welcome back! Please sign in"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Choose a secure password (min 6 chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                  required
                  minLength={isSignUp ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {message && (
              <div className={`text-sm p-4 rounded-lg border transition-all duration-300 ${
                message.includes("successfully") || message.includes("Check your email") 
                  ? "bg-green-50 text-green-800 border-green-200 shadow-sm" 
                  : "bg-red-50 text-red-800 border-red-200 shadow-sm"
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                    message.includes("successfully") || message.includes("Check your email")
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`} />
                  <span className="flex-1">{message}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || (!email || !password)}
              className="w-full bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 hover:from-slate-800 hover:via-gray-800 hover:to-slate-800 text-white font-medium py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {isSignUp ? "Create Account" : "Sign In"}
                </div>
              )}
            </Button>
          </form>



          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">
              {isSignUp ? "Already have an account?" : "New to Flux?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage("")
                setEmail("")
                setPassword("")
              }}
              className="text-sm text-slate-900 hover:text-slate-700 font-semibold transition-colors duration-200 hover:underline"
            >
              {isSignUp ? "Sign in here" : "Create account"}
            </button>
          </div>

          {/* TekvoLabs Branding */}
          <div className="text-center pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <span>Powered by</span>
              <a 
                href="https://tekvolabs.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <img 
                  src="/tekvolabs-logo.png" 
                  alt="TekvoLabs" 
                  className="w-4 h-4 object-contain"
                />
                <span className="font-medium">TekvoLabs</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
