'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import Toast from '../../components/Toast';
import ProtectedRoute from '../../components/ProtectedRoute';

const accent = '#b39ddb'; // pastel purple
const accentGreen = '#39ff14'; // neon green

function SignupPageContent() {
  const router = useRouter();
  const { signup, error: authError, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  function validate() {
    const errs: typeof errors = {};
    if (!form.name) errs.name = 'Full name required';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password required';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await signup(form);
      setToast({
        message: 'Account created successfully!',
        type: 'success',
        isVisible: true,
      });
      setTimeout(() => {
        router.push('/chat');
      }, 1500);
    } catch (err: any) {
      setErrors({ email: err.message || 'Signup failed' });
      setToast({
        message: err.message || 'Signup failed. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      {/* Floating accent shape */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#b39ddb] border-2 border-black rotate-12 opacity-60 z-0"></div>
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-white flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
        style={{ boxShadow: `8px 8px 0 0 ${accent}` }}>
        <h1
          className="text-3xl font-extrabold mb-2 text-black"
          style={{ letterSpacing: -1 }}>
          Create Your <span style={{ color: accent }}>NPMChat</span> Account
        </h1>
        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Full Name
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="name"
          />
          {errors.name && (
            <span className="text-red-600 text-sm font-normal">
              {errors.name}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Email
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-red-600 text-sm font-normal">
              {errors.email}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Password
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-[#eaffea] focus:bg-[#39ff14]/40 focus:outline-none focus:border-[${accentGreen}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            autoComplete="new-password"
          />
          {errors.password && (
            <span className="text-red-600 text-sm font-normal">
              {errors.password}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 border-2 border-black bg-[#39ff14] text-black font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#b39ddb] hover:text-white focus:outline-none"
          style={{ boxShadow: `4px 4px 0 0 ${accentGreen}` }}>
          {loading ? 'Signing Up...' : 'Sign Up 2'}
        </button>
        <div className="text-center mt-2">
          <Link
            href="/login"
            className="underline text-black font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]">
            Already have an account? Login
          </Link>
        </div>
      </form>
      {/* Floating accent shape bottom right */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#39ff14] border-2 border-black -rotate-12 opacity-50 z-0"></div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SignupPageContent />
    </ProtectedRoute>
  );
}
