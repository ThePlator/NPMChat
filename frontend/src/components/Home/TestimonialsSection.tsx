import React from 'react';

const testimonials = [
  {
    name: 'Open Source Enthusiast',
    quote: 'Love how easy it is to contribute and learn from others!',
    avatarType: 'ellipse28',
  },
  {
    name: 'First-Time Contributor',
    quote: 'My first PR was merged! Great community and support.',
    avatarType: 'ellipse30',
  },
  {
    name: 'Future Collaborator',
    quote: 'Excited to build, share, and grow together in this project.',
    avatarType: 'ellipse32',
  },
];

function SketchAvatar({ type }: { type: string }) {
  if (type === 'ellipse28') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="group-hover:animate-bounce group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="black"
          strokeWidth="4"
          fill="white"
        />
        <ellipse
          cx="24"
          cy="28"
          rx="10"
          ry="8"
          stroke="black"
          strokeWidth="3"
        />
        <circle cx="18" cy="22" r="2" fill="black" className="group-hover:animate-ping" />
        <circle cx="30" cy="22" r="2" fill="black" className="group-hover:animate-ping" style={{animationDelay: '0.2s'}} />
      </svg>
    );
  }
  if (type === 'ellipse30') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="group-hover:animate-bounce group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="black"
          strokeWidth="4"
          fill="white"
        />
        <ellipse
          cx="24"
          cy="30"
          rx="12"
          ry="10"
          stroke="black"
          strokeWidth="3"
        />
        <circle cx="18" cy="22" r="2" fill="black" className="group-hover:animate-ping" />
        <circle cx="30" cy="22" r="2" fill="black" className="group-hover:animate-ping" style={{animationDelay: '0.2s'}} />
      </svg>
    );
  }
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="group-hover:animate-bounce group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="black"
        strokeWidth="4"
        fill="white"
      />
      <ellipse cx="24" cy="32" rx="11" ry="9" stroke="black" strokeWidth="3" />
      <circle cx="18" cy="22" r="2" fill="black" className="group-hover:animate-ping" />
      <circle cx="30" cy="22" r="2" fill="black" className="group-hover:animate-ping" style={{animationDelay: '0.2s'}} />
    </svg>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary mb-10 hover:scale-105 hover:animate-pulse transition-all duration-500 cursor-default transform-gpu">
          Just for Fun — Leave a Note!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className="flex flex-col items-center p-8 border-4 border-black rounded-sm brutal-shadow hover:brutal-shadow-hover bg-[#e9d5ff] hover:scale-110 hover:-rotate-3 hover:translate-y-[-12px] transition-all duration-500 cursor-pointer group transform-gpu relative"
              style={{
                animationDelay: `${index * 150}ms`,
                transformOrigin: 'center center',
              }}>
              <div className="mb-4 group-hover:animate-pulse">
                <SketchAvatar type={t.avatarType} />
              </div>
              <blockquote className="font-mono text-base text-black mb-4 text-center group-hover:scale-105 group-hover:animate-pulse group-hover:translate-x-1 transition-all duration-400">
                "{t.quote}"
              </blockquote>
              <span className="font-bold text-black group-hover:scale-110 group-hover:animate-bounce transition-all duration-300">{t.name}</span>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#39ff14] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-[#b39ddb] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700"></div>
              
              {/* Quote marks animation */}
              <div className="absolute top-6 left-6 text-4xl font-bold text-[#39ff14] opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-500">"</div>
              <div className="absolute bottom-6 right-6 text-4xl font-bold text-[#39ff14] opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-500" style={{animationDelay: '0.3s'}}>"</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}