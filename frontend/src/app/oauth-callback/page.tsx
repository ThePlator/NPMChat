'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../AuthContext'

export default function OAuthCallback() {
  const router   = useRouter()
  const params   = useSearchParams()
  const { checkAuth, setToken } = useAuth() 

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      router.replace('/login?error=oauth_failed')
      return
    }

    if (token) {
      localStorage.setItem('token', token)  
      checkAuth().then(() => router.replace('/chat'))
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3e8ff]">
      <div className="border-4 border-black bg-white p-8 font-bold text-xl"
           style={{ boxShadow: '6px 6px 0 0 #000' }}>
        Signing you in...
      </div>
    </div>
  )
}