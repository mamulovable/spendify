import React from 'react';

import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <main className="max-w-xl mx-auto py-24 px-4 flex flex-col items-center text-center">
      <Link to="/" className="self-start inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-6">
        <circle cx="40" cy="40" r="38" fill="#10b981" opacity="0.15" />
        <path d="M24 44l12 12 20-24" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent">Thank You!</h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-200 mb-2">Your message has been sent successfully.</p>
      <p className="text-zinc-500 dark:text-zinc-400">We appreciate your feedback and will get back to you soon.</p>
    </main>
  );
}
