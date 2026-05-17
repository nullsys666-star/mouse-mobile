import { useState, useEffect } from 'react';
import { Game } from './components/Game';
import { Auth } from './components/Auth';
import { Customizer } from './components/Customizer';
import { Menu } from './components/Menu';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { MouseCustomization } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Palette, Gamepad2, Settings, LogIn, AlertTriangle, Menu as MenuIcon, Maximize, Minimize } from 'lucide-react';

const DEFAULT_CUSTOMIZATION: MouseCustomization = {
  bodyColor: '#a8a29e',
  earColor: '#fbcfe8',
  noseColor: '#f472b6',
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'game' | 'auth' | 'customizer' | 'menu'>('game');
  const [customization, setCustomization] = useState<MouseCustomization>(DEFAULT_CUSTOMIZATION);
  const [username, setUsername] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (window.screen.orientation && 'lock' in window.screen.orientation) {
          await (window.screen.orientation as any).lock('landscape').catch(() => {
            console.log('Orientation lock not supported or failed');
          });
        }
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setCustomization(DEFAULT_CUSTOMIZATION);
        setUsername('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('profiles')
      .select('customization, username')
      .eq('id', userId)
      .single();

    if (data?.customization) {
      setCustomization(data.customization);
    }
    if (data?.username) {
      setUsername(data.username);
    }
  };

  const saveCustomization = async () => {
    if (isSupabaseConfigured && session) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, customization });
      
      if (error) {
        console.error('Error saving customization:', error);
      }
    }
    setView('game');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setView('game');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#5a5a40]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#5a5a40] text-[#f5f5f0] px-6 flex items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('game')}>
          <Gamepad2 className="w-6 h-6" />
          <span className="font-bold italic text-xl tracking-tight">Mouse Scurry</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center order-last md:order-first"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {session ? (
            <>
              <button 
                onClick={() => setView('customizer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'customizer' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'hover:bg-white/10'}`}
              >
                <Palette className="w-4 h-4" /> Customize
              </button>
              <div className="h-6 w-px bg-white/20 mx-2" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Session</span>
                  <span className="text-xs font-mono">{session.user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('menu')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'menu' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'hover:bg-white/10'}`}
              >
                <MenuIcon className="w-4 h-4" /> Menu
              </button>
              <button 
                onClick={() => setView('customizer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'customizer' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'hover:bg-white/10'}`}
              >
                <Palette className="w-4 h-4" /> Customize
              </button>
              <div className="h-6 w-px bg-white/20 mx-2" />
              {isSupabaseConfigured ? (
                <button 
                  onClick={() => setView('auth')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'auth' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'bg-[#7c9070] text-[#f5f5f0] hover:bg-[#6c8060]'}`}
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              ) : (
                <div className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5" title="Supabase config missing">
                  <AlertTriangle className="w-3 h-3" /> Offline Mode
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-16 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <Game customization={customization} username={username} userId={session?.user?.id} />
            </motion.div>
          )}

          {view === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Menu 
                session={session} 
                username={username} 
                onUsernameChange={setUsername} 
              />
            </motion.div>
          )}

          {view === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Auth />
            </motion.div>
          )}

          {view === 'customizer' && (
            <motion.div
              key="customizer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Customizer 
                customization={customization} 
                onChange={setCustomization} 
                onSave={saveCustomization} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Toast for Errors would go here */}
    </div>
  );
}
