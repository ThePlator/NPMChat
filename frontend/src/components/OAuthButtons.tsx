'use client'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

interface Props {
  label?: string
}

export default function OAuthButtons({ label = 'Continue' }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-[2px] bg-black" />
        <span className="font-bold text-sm text-black">OR</span>
        <div className="flex-1 h-[2px] bg-black" />
      </div>
      
       <a href={`${API}/api/v1/auth/google`}
        className="flex items-center justify-center gap-3 w-full border-2 border-black bg-white text-black font-bold py-2.5 px-4 transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ boxShadow: '4px 4px 0 0 #000' }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5"
        />
        {label} with Google
      </a>
      
      <a  href={`${API}/api/v1/auth/github`}
        className="flex items-center justify-center gap-3 w-full border-2 border-black bg-[#24292e] text-white font-bold py-2.5 px-4 transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ boxShadow: '4px 4px 0 0 #39ff14' }}
      >
        <FaGithub size={20} />
        {label} with GitHub
      </a>
    </div>
  )
}
