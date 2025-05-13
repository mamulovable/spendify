import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://formspree.io/f/xrbqogkd', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      setLoading(false);
      if (response.ok) {
        navigate('/thankyou');
      } else {
        setError('Failed to send message. Please try again later.');
      }
    } catch {
      setLoading(false);
      setError('Failed to send message. Please try again later.');
    }
  };


  return (
    <main className="max-w-3xl mx-auto py-20 px-4 flex flex-col items-center">
      <Link to="/" className="self-start inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>
      <h1 className="text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
        Contact Us
      </h1>
      <div className="flex flex-col items-center mb-8 animate-fade-up">
        {/* Animated SVG Mail Icon */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-6">
          <rect x="10" y="20" width="60" height="40" rx="8" fill="#6366f1" />
          <polyline points="10,20 40,50 70,20" fill="none" stroke="#fff" strokeWidth="3" />
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="2s" repeatCount="indefinite" />
        </svg>
        <p className="mb-3 text-lg text-zinc-700 dark:text-zinc-200 text-center max-w-2xl">
          Have questions or feedback? Reach out to us!
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 w-full max-w-lg animate-fade-up">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Your Name" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" rows={4} placeholder="How can we help?" />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 text-white px-6 py-2 rounded font-semibold shadow-md hover:scale-105 transition" disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        <div className="text-xs text-zinc-400 mt-2 text-center">We respect your privacy. Your information is never shared or used for spam.</div>
      </form>
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


