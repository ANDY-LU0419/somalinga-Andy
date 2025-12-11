
import React, { useState } from 'react';
import { Calendar, Users, ShoppingBag, BarChart2, Package, UserCircle, Sparkles, Menu, X, LogOut, Monitor, RotateCcw } from 'lucide-react';
import { User } from '../types';
import { STAFF_LIST } from '../constants';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  onReset?: () => void;
}

export const Layout: React.FC<Props> = ({ children, activeTab, onTabChange, currentUser, onLogout, onReset }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter menu items based on role
  const allMenuItems = [
    { id: 'calendar', label: '预约管理', icon: <Calendar size={20} />, restricted: false },
    { id: 'schedule', label: '员工排班', icon: <Users size={20} />, restricted: false },
    { id: 'pos', label: '收银台', icon: <ShoppingBag size={20} />, restricted: false },
    { id: 'members', label: '会员档案', icon: <UserCircle size={20} />, restricted: false },
    { id: 'services', label: '项目管理', icon: <Sparkles size={20} />, restricted: false },
    { id: 'inventory', label: '库存物资', icon: <Package size={20} />, restricted: false },
    { id: 'dashboard', label: '经营报表', icon: <BarChart2 size={20} />, restricted: true },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.restricted && currentUser.role !== 'admin') return false;
    return true;
  });

  const currentStaff = STAFF_LIST.find(s => s.id === currentUser.staffId);

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
        <div className="p-8 flex flex-col items-center gap-4 border-b border-[#E0D6C2]/50">
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleTabClick('calendar')}>
                <img 
                  src="/logo.png" 
                  alt="Somalinga" 
                  className="w-32 h-auto object-contain mb-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="text-3xl font-serif font-bold italic text-[#433A31]">Somalinga</div>`;
                  }}
                />
            </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-[#8B7355] text-[#F7F5F0] shadow-md shadow-[#8B7355]/20' 
                  : 'text-[#8C8174] hover:bg-[#F2EFE9] hover:text-[#5C4D3C]'
              }`}
            >
              <div>{item.icon}</div>
              <span className="tracking-wide font-sans">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#E0D6C2]/50 space-y-3">
            {onReset && (
              <button 
                onClick={onReset} 
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#8C8174] hover:bg-[#F2EFE9] rounded-lg transition-colors border border-transparent hover:border-[#D6CDB8]"
                title="清除缓存并恢复默认数据"
              >
                 <RotateCcw size={14}/> 重置系统数据
              </button>
            )}
            <div className="bg-[#FFFDF9] rounded-xl border border-[#E0D6C2] p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <img src={currentStaff?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Staff"} className="w-10 h-10 rounded-full border border-white shadow-sm" alt="Profile" />
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-bold text-[#433A31] font-serif truncate">{currentUser.name}</span>
                    <span className="text-xs text-[#8C8174]">{currentUser.role === 'admin' ? '老板' : '员工'}</span>
                </div>
                <button onClick={onLogout} className="p-2 rounded-full hover:bg-[#F2EFE9] text-[#D6CDB8] hover:text-[#C07765] transition-colors" title="退出登录">
                  <LogOut size={16} />
                </button>
            </div>
        </div>
    </>
  );

  return (
    <div className="flex h-screen font-sans text-[#433A31] bg-[#F7F5F0] overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 sidebar-glass flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
             <div className="absolute inset-0 bg-[#2C241B]/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
             <div className="relative w-64 h-full bg-[#F7F5F0] shadow-2xl flex flex-col animate-slide-right">
                 <button className="absolute top-4 right-4 p-2 text-[#8C8174]" onClick={() => setIsMobileMenuOpen(false)}>
                     <X size={24}/>
                 </button>
                 <SidebarContent />
             </div>
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E0D6C2] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
             <div className="flex items-center gap-3 md:hidden">
                 <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-[#433A31]">
                     <Menu size={24} />
                 </button>
                 <span className="font-serif font-bold text-lg text-[#433A31]">Somalinga</span>
             </div>
             
             {/* Desktop Breadcrumb */}
             <div className="hidden md:flex items-center gap-2 text-sm text-[#8C8174]">
                 <span className="font-serif italic flex items-center gap-2"><Monitor size={14}/> 网页版管理后台</span>
                 <span>/</span>
                 <span className="font-bold text-[#433A31]">{menuItems.find(i => i.id === activeTab)?.label}</span>
             </div>

             <div className="flex items-center gap-4">
                 <div className="text-xs md:text-sm font-mono text-[#8B7355] bg-[#F2E6D0] px-3 py-1 rounded-full border border-[#E0CFB0]">
                     {new Date().toLocaleDateString('zh-CN')}
                 </div>
             </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F7F5F0] scroll-smooth">
            {/* Subtle Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 fixed" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            
            {/* Main Content Container */}
            <div className="relative z-10 min-h-full pb-20">
                {children}
            </div>
        </main>
      </div>

    </div>
  );
};
