import React from 'react';

import { Link } from 'react-router-dom';

export default function Blog() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-4 flex flex-col items-center">
      <Link to="/" className="self-start inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>
      <h1 className="text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
        Blog
      </h1>
      <div className="flex flex-col items-center mb-8 animate-fade-up">
        {/* Animated SVG Placeholder */}
        <svg width="140" height="90" viewBox="0 0 140 90" fill="none" className="mb-6">
          <rect x="10" y="60" width="30" height="20" rx="6" fill="#6366f1">
            <animate attributeName="y" values="60;40;60" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="50" y="45" width="30" height="35" rx="6" fill="#ec4899">
            <animate attributeName="y" values="45;25;45" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="90" y="30" width="30" height="50" rx="6" fill="#10b981">
            <animate attributeName="y" values="30;10;30" dur="2s" repeatCount="indefinite" />
          </rect>
        </svg>
        <p className="mb-3 text-lg text-zinc-700 dark:text-zinc-200 text-center max-w-2xl">
          Coming soon: Insights, tips, and product updates from the Spendify Guru team.
        </p>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(.4,0,.2,1) 0.2s both;
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

