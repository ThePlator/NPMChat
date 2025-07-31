// app/not-found.js - Next.js App Router 404 page

import Link from 'next/link';


export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-[#d7bfff] border-4 border-black rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] px-8 py-12 xl:max-w-xl text-center">
        <h1 className="text-6xl font-extrabold text-black mb-4">404</h1>
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Page Not Found</h2>
        <p className="text-gray-800 text-base mb-6">
          Oops! Looks like you hit a dead end. <br /> Let's get you back on track.
        </p>
        <Link href="/" className="inline-block bg-white border-2 border-black text-black font-semibold py-2 px-6 rounded-none shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-purple-100 transition-all">
          ← Go to Homepage
        </Link>
      </div>

      
      <div className="absolute bottom-6 right-6 w-10 h-10 bg-green-300 rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"></div>
      <div className="absolute top-8 left-8 w-20 h-20 bg-pink-200 rounded-full shadow-[6px_6px_0_0_rgba(0,0,0,1)]"></div>
      <div className="absolute top-6 left-6 w-12 h-12 bg-red-300 rotate-12 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] animate-bounce-slow" />
      <div className="absolute bottom-8 right-10 w-16 h-16 bg-green-300 rounded-full border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] animate-wiggle" />
      <div className="absolute top-20 right-8 w-6 h-6 bg-blue-400 rotate-[30deg] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]" />
      <div className="absolute bottom-24 left-16 w-8 h-8 bg-pink-300 rotate-[45deg] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]" />
        <div className="absolute bottom-16 left-20 w-0 h-0 border-l-[32px] border-r-[32px] border-b-[56px] border-l-transparent border-r-transparent border-b-yellow-300 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rotate-[-8deg]"></div>
    </div>
  );
}



