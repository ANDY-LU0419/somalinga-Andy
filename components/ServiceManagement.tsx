import React, { useState } from 'react';
import { Service, ServiceType } from '../types';
import { Edit2, Plus, Trash2, X, Save, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  services: Service[];
  onAddService: (service: Service) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

export const ServiceManagement: React.FC<Props> = ({ services, onAddService, onUpdateService, onDeleteService }) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setFormData({ ...service });
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setEditingService(null);
    setFormData({ type: ServiceType.Nails, commissionRate: 0.10 });
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding && formData.name && formData.price) {
        const newService: Service = {
            id: `srv-${Date.now()}`,
            name: formData.name,
            price: Number(formData.price),
            durationMin: Number(formData.durationMin) || 60,
            type: formData.type || ServiceType.Nails,
            commissionRate: Number(formData.commissionRate) || 0.1
        };
        onAddService(newService);
        setIsAdding(false);
    } else if (editingService && formData) {
        onUpdateService({ ...editingService, ...formData } as Service);
        setEditingService(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
        onDeleteService(deleteId);
        if (editingService?.id === deleteId) setEditingService(null);
        setDeleteId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#433A31]">项目管理</h2>
          <p className="text-[#8C8174] mt-1 font-serif italic text-xs md:text-sm">管理服务项目及价格</p>
        </div>
        <button onClick={handleAddClick} className="bg-[#433A31] text-[#F7F5F0] p-3 md:px-6 md:py-3 rounded-xl shadow-lg hover:bg-[#2C241B] transition-colors">
          <Plus size={20} /> <span className="hidden md:inline ml-2">添加项目</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map(item => (
          <div key={item.id} onClick={() => handleEditClick(item)} className="bg-[#FFFDF9] rounded-2xl border border-[#E0D6C2] shadow-sm p-4 md:p-6 hover:shadow-md hover:border-[#8B7355] transition-all group flex flex-col cursor-pointer relative overflow-hidden active:scale-[0.98]">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${
                    item.type === ServiceType.Nails ? 'bg-[#E8DCC4] text-[#5C4D3C]' :
                    item.type === ServiceType.Lashes ? 'bg-[#D8DFD0] text-[#4A5D43]' :
                    item.type === ServiceType.Consultation ? 'bg-[#F2E6D0] text-[#8C6B38]' :
                    'bg-[#F2EFE9] text-[#8C8174]'
                }`}>
                    <Sparkles size={20} />
                </div>
                <div className="text-xl font-bold font-mono text-[#8B7355]">¥{item.price}</div>
            </div>
            <h3 className="font-bold text-[#433A31] text-lg font-serif mb-2 flex-1">{item.name}</h3>
            <div className="flex items-center gap-4 text-xs text-[#8C8174] mb-4">
                <div className="flex items-center gap-1"><Clock size={14}/> {item.durationMin}分钟</div>
                <div className="px-2 py-0.5 rounded bg-[#F7F5F0] border border-[#E0D6C2]">{item.type}</div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2 pt-3 border-t border-[#E0D6C2]/50 mt-auto relative z-10">
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} 
                    className="flex-1 py-2 rounded-lg bg-[#F7F5F0] text-[#5C4D3C] text-sm font-bold hover:bg-[#EBE5D9] transition-colors flex items-center justify-center gap-1"
                >
                    <Edit2 size={14}/> 编辑
                </button>
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} 
                    className="flex-1 py-2 rounded-lg bg-[#F2EFE9] text-[#C07765] text-sm font-bold hover:bg-[#E6D4D4] transition-colors flex items-center justify-center gap-1 active:bg-[#C07765] active:text-white"
                >
                    <Trash2 size={14}/> 删除
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {(editingService || isAdding) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-[#2C241B]/30 backdrop-blur-sm" onClick={() => {setEditingService(null); setIsAdding(false);}}></div>
          <div className="bg-[#FFFDF9] w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slide-up md:animate-scale-in border-t md:border border-[#E0D6C2] flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#E0D6C2] flex justify-between items-center bg-[#F7F5F0] flex-shrink-0">
              <h3 className="text-lg font-bold font-serif text-[#433A31]">{isAdding ? '添加新项目' : '编辑项目'}</h3>
              <button onClick={() => {setEditingService(null); setIsAdding(false);}} className="p-2 rounded-full text-[#8C8174] hover:bg-[#EBE5D9]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">项目名称</label>
                  <input required type="text" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355] transition-colors" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：极致单色美甲" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">价格 (¥)</label>
                      <input required type="number" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none font-bold text-[#8B7355] focus:border-[#8B7355]" 
                        value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">时长 (分钟)</label>
                      <input required type="number" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]" 
                        value={formData.durationMin || ''} onChange={e => setFormData({...formData, durationMin: Number(e.target.value)})} />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">分类</label>
                  <select className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]"
                    value={formData.type || ServiceType.Nails} 
                    onChange={e => setFormData({...formData, type: e.target.value as ServiceType})}
                  >
                      <option value={ServiceType.Nails}>美甲</option>
                      <option value={ServiceType.Lashes}>美睫</option>
                      <option value={ServiceType.HandCare}>手护</option>
                      <option value={ServiceType.Consultation}>咨询</option>
                      <option value={ServiceType.Tea}>茶饮</option>
                  </select>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">提成比例 (0-1)</label>
                  <input required type="number" step="0.01" max="1" min="0" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]" 
                    value={formData.commissionRate || ''} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} />
              </div>

              <div className="pt-4 pb-safe">
                  <button type="submit" className="w-full bg-[#433A31] text-[#F7F5F0] py-4 rounded-xl font-bold hover:bg-[#2C241B] transition-colors flex items-center justify-center gap-2 shadow-lg">
                      <Save size={18}/> 保存
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
             <div className="bg-[#FFFDF9] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 text-center animate-scale-in border border-[#E0D6C2]">
                 <div className="w-12 h-12 bg-[#F2EFE9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C07765]">
                     <AlertTriangle size={24}/>
                 </div>
                 <h3 className="text-xl font-bold text-[#433A31] font-serif mb-2">确认删除?</h3>
                 <p className="text-[#8C8174] text-sm mb-6">该项目将被永久删除，无法恢复。</p>
                 <div className="flex gap-3">
                     <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-[#E0D6C2] text-[#5C4D3C] font-bold">取消</button>
                     <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-[#C07765] text-white font-bold shadow-lg">删除</button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};