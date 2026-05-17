import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#e8e8df] rounded-3xl border border-[#b3a492] shadow-xl w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold italic text-[#5a5a40] mb-2">
            {isRegister ? 'Join the Scurry' : 'Welcome Back'}
          </h2>
          <p className="text-[#5a5a40]/60 font-serif">
            {isRegister ? 'Create an account to save your progress and mouse.' : 'Log in to continue your adventure.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a40]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5f5f0] border border-[#b3a492] rounded-xl py-3 pl-10 pr-4 text-[#5a5a40] focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent outline-none transition-all font-sans"
                placeholder="mouse@scurry.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a40]/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f5f5f0] border border-[#b3a492] rounded-xl py-3 pl-10 pr-4 text-[#5a5a40] focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent outline-none transition-all font-sans"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm italic">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5a5a40] text-[#f5f5f0] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#4a4a35] transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isRegister ? <><UserPlus className="w-5 h-5" /> Register</> : <><LogIn className="w-5 h-5" /> Log In</>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#b3a492]/20 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#5a5a40] font-bold italic hover:underline underline-offset-4 decoration-[#b3a492]"
          >
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
