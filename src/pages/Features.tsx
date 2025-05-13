import React from 'react';

const features = [
  {
    name: 'Upload Bank Statements',
    desc: 'Easily import your bank data for analysis.',
    icon: (
      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16v-8m0 0l-4 4m4-4l4 4" /><rect x="3" y="17" width="18" height="4" rx="2" /></svg>
    ),
  },
  {
    name: 'Charts & Visualizations',
    desc: 'Interactive charts to visualize your finances.',
    icon: (
      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0v-2a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>
    ),
  },
  {
    name: 'Expense Tracker',
    desc: 'Track expenses and stay on budget.',
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
    ),
  },
  {
    name: 'Financial Goals',
    desc: 'Set and monitor your savings and spending goals.',
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
    ),
  },
  {
    name: 'Compare Analyses',
    desc: 'Compare different periods or accounts.',
    icon: (
      <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="16" rx="2" /><rect x="13" y="4" width="7" height="16" rx="2" /></svg>
    ),
  },
  {
    name: 'Advanced Analytics',
    desc: 'Deep insights into your financial habits.',
    icon: (
      <svg className="w-8 h-8 text-fuchsia-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" /><circle cx="19" cy="5" r="2" /></svg>
    ),
  },
  {
    name: 'AI Financial Advisor',
    desc: 'Get personalized advice powered by AI.',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 15s1.5 2 4 2 4-2 4-2" /></svg>
    ),
  },
  {
    name: 'Export to PDF',
    desc: 'Download your reports and statements.',
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
    ),
  },
  {
    name: 'Priority Support',
    desc: 'Fast-track help for Enterprise users.',
    icon: (
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-1.414 1.414A9 9 0 003.05 17.95l1.414-1.414A7 7 0 0116.95 7.05l1.414-1.414z" /></svg>
    ),
  },
];

import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <main className="max-w-5xl mx-auto py-20 px-4">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>
      <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
        Discover Our Features
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={f.name}
            className="bg-white/70 dark:bg-zinc-900/80 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-up"
            style={{ animationDelay: `${i * 0.07 + 0.1}s` }}
          >
            <div className="mb-4">{f.icon}</div>
            <h2 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-100">{f.name}</h2>
            <p className="text-zinc-600 dark:text-zinc-300">{f.desc}</p>
          </div>
        ))}
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}

