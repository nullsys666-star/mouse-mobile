import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChatMessage, ScoreEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Trophy, User, Hash, Loader2 } from 'lucide-react';

interface MenuProps {
  session: any;
  username: string;
  onUsernameChange: (name: string) => void;
}

export const Menu: React.FC<MenuProps> = ({ session, username, onUsernameChange }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'leaderboard'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Fetch initial chat
    fetchChat();
    // Fetch leaderboard
    fetchLeaderboard();

    // Subscribe to chat
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev.slice(-49), payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const fetchChat = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setMessages(data.reverse());
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('scores')
      .select('username, cheese_count, level, time')
      .order('level', { ascending: false })
      .order('cheese_count', { ascending: false })
      .limit(10);
    if (data) setScores(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    const msg = {
      user_id: session.user.id,
      username: username || 'Anonymous Mouse',
      content: newMessage.trim(),
    };

    const { error } = await supabase.from('messages').insert(msg);
    if (!error) setNewMessage('');
  };

  const updateUsername = async () => {
    if (!tempUsername.trim() || !session) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, username: tempUsername.trim() });
    
    if (!error) {
      onUsernameChange(tempUsername.trim());
      setEditingUsername(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#e8e8df] rounded-3xl border border-[#b3a492] shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#5a5a40] text-[#f5f5f0] p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 opacity-60" />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Your Identity</span>
          </div>
          
          {editingUsername ? (
            <div className="space-y-3">
              <input 
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value.slice(0, 15))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/40"
                placeholder="Enter name..."
              />
              <div className="flex gap-2">
                <button 
                  onClick={updateUsername}
                  disabled={loading}
                  className="flex-1 bg-[#7c9070] text-xs font-bold py-2 rounded-lg hover:bg-[#6c8060]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                </button>
                <button 
                  onClick={() => setEditingUsername(false)}
                  className="flex-1 bg-white/5 text-xs font-bold py-2 rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setEditingUsername(true)}>
              <p className="text-xl font-bold italic truncate">{username || 'Anonymous Mouse'}</p>
              <p className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                <Hash className="w-3 h-3" /> Click to change
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-bold">Chat Room</span>
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-[#f5f5f0] text-[#5a5a40]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold">Hall of Fame</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#f5f5f0]">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-6 border-b border-[#b3a492]/20 flex justify-between items-center">
                <h3 className="text-xl font-bold italic text-[#5a5a40]">Scurry Chat</h3>
                <span className="text-[10px] uppercase font-bold text-[#b3a492]">50+ recent messages</span>
              </div>
              
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-[#5a5a40]/40">{msg.username}</span>
                      <span className="text-[9px] text-[#5a5a40]/20">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.username === username ? 'bg-[#5a5a40] text-[#f5f5f0] rounded-tr-none' : 'bg-[#e8e8df] text-[#5a5a40] rounded-tl-none border border-[#b3a492]/30'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-6 bg-[#e8e8df] border-t border-[#b3a492]/20 flex gap-3">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={session ? "Type a message..." : "Sign in to chat"}
                  disabled={!session}
                  className="flex-1 bg-[#f5f5f0] border border-[#b3a492]/40 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#5a5a40] transition-all"
                />
                <button 
                  type="submit"
                  disabled={!session || !newMessage.trim()}
                  className="bg-[#5a5a40] text-[#f5f5f0] p-3 rounded-xl hover:bg-[#4a4a35] disabled:opacity-50 transition-all shadow-md"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-6 border-b border-[#b3a492]/20 flex justify-between items-center">
                <h3 className="text-xl font-bold italic text-[#5a5a40]">Top Scurriers</h3>
                <button onClick={fetchLeaderboard} className="text-[10px] uppercase font-bold text-[#b3a492] hover:text-[#5a5a40]">Refresh</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-[#5a5a40]/40 font-bold border-b border-[#b3a492]/20">
                      <th className="pb-3 px-2">Rank</th>
                      <th className="pb-3">Scurrier</th>
                      <th className="pb-3">Level</th>
                      <th className="pb-3">Cheese</th>
                      <th className="pb-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b3a492]/10">
                    {scores.map((score, idx) => (
                      <tr key={idx} className="group hover:bg-black/5 transition-colors">
                        <td className="py-4 px-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-stone-200 text-stone-500' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-[#5a5a40]/40'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-[#5a5a40]">{score.username}</td>
                        <td className="py-4 text-[#5a5a40]/60 italic">Chapter {score.level}</td>
                        <td className="py-4 font-mono text-amber-600 font-bold">{score.cheese_count}</td>
                        <td className="py-4 text-right text-[#5a5a40]/40 font-mono text-xs">{score.time}</td>
                      </tr>
                    ))}
                    {scores.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-[#5a5a40]/30 italic">No legends recorded yet...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
