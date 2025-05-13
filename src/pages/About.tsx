import React from 'react';

import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-4 flex flex-col items-center">
      <Link to="/" className="self-start inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>
      <h1 className="text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
        About Spendify Guru
      </h1>
      <div className="w-full flex flex-col items-center mb-8 animate-fade-up">
        {/* Animated SVG Infographic */}
        <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="mb-6">
          <rect x="10" y="60" width="30" height="20" rx="6" fill="#6366f1">
            <animate attributeName="y" values="60;40;60" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="50" y="45" width="30" height="35" rx="6" fill="#ec4899">
            <animate attributeName="y" values="45;25;45" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="90" y="30" width="30" height="50" rx="6" fill="#10b981">
            <animate attributeName="y" values="30;10;30" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="130" y="15" width="30" height="65" rx="6" fill="#f59e42">
            <animate attributeName="y" values="15;0;15" dur="2s" repeatCount="indefinite" />
          </rect>
        </svg>
        <p className="mb-3 text-lg text-zinc-700 dark:text-zinc-200 text-center max-w-2xl">
          Spendify Guru is a modern financial management platform designed to help individuals and businesses take control of their finances. With powerful analytics, AI-driven insights, and a beautiful user interface, Spendify Guru makes budgeting, tracking, and planning your financial future simple and effective.
        </p>
        <p className="mb-3 text-lg text-zinc-700 dark:text-zinc-200 text-center max-w-2xl">
          Our mission is to empower users to make smarter financial decisions through technology. Whether you want to monitor spending, set goals, or get advice, Spendify Guru has you covered.
        </p>
      </div>

      {/* Company Story & Vision */}
      <section className="mb-12 w-full max-w-2xl animate-fade-up">
        <h2 className="text-2xl font-bold mb-2 text-indigo-500">Our Story</h2>
        <p className="text-zinc-700 dark:text-zinc-200 mb-4">
          Founded by a team of passionate technologists and finance experts, Spendify Guru was born out of a desire to make financial clarity accessible to everyone. We saw how confusing, time-consuming, and even intimidating financial management could be — so we set out to build a smarter, friendlier solution for all.
        </p>
        <h2 className="text-2xl font-bold mb-2 text-pink-500">Our Vision</h2>
        <p className="text-zinc-700 dark:text-zinc-200">
          We envision a world where everyone can make confident financial decisions, free from stress and uncertainty. We believe that with the right tools, anyone can achieve financial wellness and reach their goals.
        </p>
      </section>

      {/* What Makes Us Different */}
      <section className="mb-12 w-full max-w-2xl animate-fade-up">
        <h2 className="text-2xl font-bold mb-4 text-emerald-500">What Makes Us Different</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <li className="bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <span className="font-semibold text-indigo-600">AI-Driven Insights</span>
            <p className="text-zinc-600 dark:text-zinc-300">Get actionable recommendations and forecasts powered by the latest AI technology.</p>
          </li>
          <li className="bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <span className="font-semibold text-pink-500">Privacy-First Approach</span>
            <p className="text-zinc-600 dark:text-zinc-300">Your data is always secure and never sold. We adhere to the highest standards of privacy and encryption.</p>
          </li>
          <li className="bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <span className="font-semibold text-emerald-600">Beautiful, Intuitive UI</span>
            <p className="text-zinc-600 dark:text-zinc-300">Enjoy a seamless experience with a modern, easy-to-use interface on all your devices.</p>
          </li>
          <li className="bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <span className="font-semibold text-yellow-500">Personalized for You</span>
            <p className="text-zinc-600 dark:text-zinc-300">From custom budgets to tailored advice, Spendify Guru adapts to your unique financial journey.</p>
          </li>
        </ul>
      </section>

      {/* Team & Values */}
      <section className="mb-12 w-full max-w-2xl animate-fade-up">
        <h2 className="text-2xl font-bold mb-4 text-cyan-500">Meet Our Team</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <h3 className="font-semibold text-lg mb-1">Jade – Product & Vision</h3>
            <p className="text-zinc-600 dark:text-zinc-300">Driven by a passion for innovation and user experience.</p>
          </div>
          <div className="flex-1 bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <h3 className="font-semibold text-lg mb-1">Sam – Engineering</h3>
            <p className="text-zinc-600 dark:text-zinc-300">Loves building reliable, scalable, and delightful digital products.</p>
          </div>
          <div className="flex-1 bg-white/70 dark:bg-zinc-900/80 rounded-xl shadow p-5">
            <h3 className="font-semibold text-lg mb-1">Alex – Customer Success</h3>
            <p className="text-zinc-600 dark:text-zinc-300">Here to make sure every user achieves their financial goals.</p>
          </div>
        </div>
        <div className="mt-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          Our values: <span className="font-semibold">Empathy</span>, <span className="font-semibold">Integrity</span>, <span className="font-semibold">Innovation</span>, <span className="font-semibold">Simplicity</span>
        </div>
      </section>

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

