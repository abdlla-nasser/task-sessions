'use client';

import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-[2%] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-[2%] border border-white/20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Settings
              </h1>
              <Link
                href="/"
                className="flex items-center space-x-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="space-y-6">
              <p className="text-slate-600">Settings page content will be added here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}