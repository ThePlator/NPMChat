"use client"

import { FaGithub, FaGoogle } from "react-icons/fa"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface OAuthButtonsProps {
  label?: string
}

function OAuthButtons({ label = "Continue" }: OAuthButtonsProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.2)" }} />
        <span style={{ fontSize: 14, fontWeight: "bold", color: "rgba(0,0,0,0.5)" }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.2)" }} />
      </div>

      
       <a href={`${API_URL}/api/v1/auth/google`}
        style={{ boxShadow: "4px 4px 0 0 #b39ddb", border: "2px solid black", background: "white", color: "black", fontWeight: 800, fontSize: 18, padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
      >
        <FaGoogle size={20} />
        {label} with Google
      </a>

      
       <a href={`${API_URL}/api/v1/auth/github`}
        style={{ boxShadow: "4px 4px 0 0 #39ff14", border: "2px solid black", background: "#24292e", color: "white", fontWeight: 800, fontSize: 18, padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
      >
        <FaGithub size={20} />
        {label} with GitHub
      </a>
    </>
  )
}

export default OAuthButtons