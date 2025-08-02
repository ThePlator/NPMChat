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
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
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
        <circle cx="18" cy="22" r="2" fill="black" />
        <circle cx="30" cy="22" r="2" fill="black" />
      </svg>
    );
  }
  if (type === 'ellipse30') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
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
        <circle cx="18" cy="22" r="2" fill="black" />
        <circle cx="30" cy="22" r="2" fill="black" />
      </svg>
    );
  }
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="black"
        strokeWidth="4"
        fill="white"
      />
      <ellipse cx="24" cy="32" rx="11" ry="9" stroke="black" strokeWidth="3" />
      <circle cx="18" cy="22" r="2" fill="black" />
      <circle cx="30" cy="22" r="2" fill="black" />
    </svg>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary mb-10">
          Just for Fun — Leave a Note!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col items-center p-8 border-4 border-black rounded-sm brutal-shadow bg-[#e9d5ff]">
              <div className="mb-4">
                <SketchAvatar type={t.avatarType} />
              </div>
              <blockquote className="font-mono text-base text-black mb-4 text-center">
                “{t.quote}”
              </blockquote>
              <span className="font-bold text-black">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
