
import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export const LoginScreen: React.FC<Props> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E0D6C2] p-8 md:p-12 relative z-10 animate-scale-in">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 mb-4 flex items-center justify-center">
             <img 
               src="/logo.png" 
               alt="Somalinga Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = `<div class="w-20 h-20 bg-[#F2EFE9] rounded-full flex items-center justify-center text-[#8B7355] border border-[#E0D6C2] font-serif font-bold text-3xl">S</div>`;
               }}
             />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#433A31] mb-1">Somalinga</h1>
          <p className="text-[#8C8174] font-serif italic text-sm">Manager System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wider ml-1">用户名</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-[#F7F5F0] border border-[#E0D6C2] rounded-xl outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] transition-all text-[#433A31] font-medium placeholder-[#D6CDB8]"
              placeholder="admin / staff"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wider ml-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#F7F5F0] border border-[#E0D6C2] rounded-xl outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] transition-all text-[#433A31] font-medium placeholder-[#D6CDB8]"
              placeholder="****"
            />
          </div>

          {error && (
            <div className="bg-[#E6D4D4]/30 text-[#A05252] p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in border border-[#E6D4D4]">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#433A31] text-[#F7F5F0] py-4 rounded-xl font-bold text-lg hover:bg-[#2C241B] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            登录 <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-[#D6CDB8]">© 2025 Somalinga Beauty Salon</p>
          <div className="text-[10px] text-[#D6CDB8]">
            体验账号: amber/8888 或 lulu/1234
          </div>
        </div>
      </div>
    </div>
  );
};
