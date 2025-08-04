'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../AuthContext'

import ProtectedRoute from '../../components/ProtectedRoute'
import { toast } from 'sonner'

const accent = '#b39ddb' // pastel purple
const accentGreen = '#39ff14' // neon green

function LoginPageContent() {
	const router = useRouter()
	const { login, error: authError, loading: authLoading } = useAuth()
	const [form, setForm] = useState({ email: '', password: '' })
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{}
	)
	const [loading, setLoading] = useState(false)

	function validate() {
		const errs: typeof errors = {}
		if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
			errs.email = 'Valid email required'
		if (!form.password) errs.password = 'Password required'
		return errs
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		const errs = validate()
		setErrors(errs)
		if (Object.keys(errs).length) return
		setLoading(true)
		try {
			await login(form)
			toast.success('LoggedIn successful')
			setTimeout(() => {
				router.push('/chat')
			}, 1500)
		} catch (err: any) {
			setErrors({ email: err.message || 'Login failed' })
			toast.error(err.message || 'Login failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden'>
			{/* Floating accent shape */}
			<div className='absolute -top-10 -right-10 w-40 h-40 bg-[#39ff14] border-2 border-black -rotate-12 opacity-60 z-0'></div>
			<form
				onSubmit={handleSubmit}
				className='relative z-10 w-full max-w-sm p-8 border-2 border-black bg-white flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover'
				style={{ boxShadow: `8px 8px 0 0 ${accentGreen}` }}
			>
				<h1
					className='text-3xl font-extrabold mb-2 text-black'
					style={{ letterSpacing: -1 }}
				>
					Welcome Back to{' '}
					<span style={{ color: accent }}>NPMChat</span>
				</h1>
				<label className='flex flex-col gap-1 text-black font-bold text-lg'>
					Email
					<input
						className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
						type='email'
						value={form.email}
						onChange={(e) =>
							setForm((f) => ({ ...f, email: e.target.value }))
						}
						autoComplete='email'
					/>
					{errors.email && (
						<span className='text-red-600 text-sm font-normal'>
							{errors.email}
						</span>
					)}
				</label>
				<label className='flex flex-col gap-1 text-black font-bold text-lg'>
					Password
					<input
						className="border-2 border-black px-4 py-2 text-lg bg-[#eaffea] focus:bg-[#39ff14]/40 focus:outline-none focus:border-[${accentGreen}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
						type='password'
						value={form.password}
						onChange={(e) =>
							setForm((f) => ({ ...f, password: e.target.value }))
						}
						autoComplete='current-password'
					/>
					{errors.password && (
						<span className='text-red-600 text-sm font-normal'>
							{errors.password}
						</span>
					)}
				</label>
				<button
					type='submit'
					disabled={loading}
					className="mt-2 border-2 border-black bg-[#b39ddb] text-black font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#39ff14] hover:text-white focus:outline-none"
					style={{ boxShadow: `4px 4px 0 0 ${accent}` }}
				>
					{loading ? 'Logging In...' : 'Login 2'}
				</button>
				<div className='text-center mt-2'>
					<Link
						href='/signup'
						className="underline text-black font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
					>
						Don't have an account? Sign up
					</Link>
				</div>
			</form>
			{/* Floating accent shape bottom left */}
			<div className='absolute bottom-0 left-0 w-32 h-32 bg-[#b39ddb] border-2 border-black rotate-12 opacity-50 z-0'></div>
		</main>
	)
}

export default function LoginPage() {
	return (
		<ProtectedRoute requireAuth={false}>
			<LoginPageContent />
		</ProtectedRoute>
	)
}
