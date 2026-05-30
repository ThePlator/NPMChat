'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setToken } from '../fetcher'       // ✅ in-memory token store
import { useAuth } from '../AuthContext'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`
}

export default function OAuthCallback() {
  const router = useRouter()
  const { checkAuth } = useAuth()           

  useEffect(() => {
    async function finish() {
    
      const accessToken = getCookie('oauthAccessToken')

      if (accessToken) {

        setToken(accessToken)

        deleteCookie('oauthAccessToken')
      }

 
      try {
        await checkAuth()
        router.replace('/chat')
      } catch {
        router.replace('/login?error=oauth_failed')
      }
    }

    finish()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3e8ff]">
      <div
        className="border-4 border-black bg-white p-8 font-bold text-xl animate-pulse"
        style={{ boxShadow: '6px 6px 0 0 #000' }}
      >
        Signing you in...
      </div>
    </div>
  )
}