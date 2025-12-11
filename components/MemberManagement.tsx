import React, { useState } from 'react';
import { Search, User, CreditCard, Award, FileText, Save, Edit2, ChevronLeft, X } from 'lucide-react';
import { Member, MemberTier } from '../types';
import { MEMBER_TIERS } from '../constants';

interface Props {
  members: Member[];
  onUpdateMember: (member: Member) => void;
}

export const MemberManagement: React.FC<Props> = ({ members, onUpdateMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsEditing(false);
    setEditForm({});
  };

  const getTier = (tierId: string) => MEMBER_TIERS.find(t => t.id === tierId);

  const handleSave = () => {
    if (selectedMember && editForm) {
      const updatedMember = { ...selectedMember, ...editForm };
      if (editForm.balance !== undefined) updatedMember.balance = Number(editForm.balance);
      if (editForm.customDiscount !== undefined) updatedMember.customDiscount = Number(editForm.customDiscount);
      
      onUpdateMember(updatedMember);
      setSelectedMember(updatedMember);
      setIsEditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#F7F5F0] overflow-hidden">
      
      {/* LIST VIEW (Visible on Desktop, and on Mobile when no member selected) */}
      <div className={`flex-col h-full w-full md:w-1/3 bg-[#FFFDF9] md:border-r border-[#E0D6C2] z-10 ${selectedMember ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Mobile Header for List */}
        <div className="md:hidden p-4 border-b border-[#E0D6C2] bg-[#FFFDF9]">
             <h2 className="text-xl font-bold font-serif text-[#433A31]">会员列表</h2>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-8 pb-4">
            <h2 className="text-3xl font-bold font-serif text-[#433A31]">会员管理</h2>
            <p className="text-[#8C8174] mt-1 font-serif italic">查询会员信息与档案</p>
        </div>

        {/* Search Bar */}
        <div className="p-4 md:p-6 border-b border-[#E0D6C2] bg-[#F7F5F0]/30">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6CDB8] group-focus-within:text-[#8B7355] transition-colors" size={20}/>
                <input 
                    type="text" 
                    placeholder="手机号 / 姓名" 
                    className="w-full pl-12 pr-10 py-3 border border-[#E0D6C2] rounded-xl focus:bg-white focus:ring-4 focus:ring-[#8B7355]/10 focus:border-[#8B7355] outline-none bg-white md:bg-white/50 transition-all text-[#433A31] font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D6CDB8] p-1"><X size={16}/></button>
                )}
            </div>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar pb-24 md:pb-4">
            {filteredMembers.map(member => {
                const tier = getTier(member.tierId);
                return (
                    <div 
                        key={member.id} 
                        onClick={() => handleSelectMember(member)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all active:scale-[0.98] ${selectedMember?.id === member.id ? 'bg-[#433A31] text-[#F7F5F0] border-[#433A31] shadow-lg' : 'bg-white border-[#E0D6C2] text-[#433A31]'}`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-base font-serif">{member.name}</div>
                                <div className={`text-xs mt-1 opacity-80 font-mono tracking-wide`}>{member.phone}</div>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedMember?.id === member.id ? 'bg-[#F7F5F0]/20 text-[#F7F5F0]' : 'bg-[#F2EFE9] text-[#8C8174]'}`}>
                                {tier?.name.split(' ')[0]}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* DETAIL VIEW (Full screen on Mobile, Right side on Desktop) */}
      <div className={`flex-1 bg-[#F7F5F0] md:bg-[#FFFDF9] h-full overflow-hidden flex-col ${selectedMember ? 'fixed inset-0 z-50 flex md:static' : 'hidden md:flex'}`}>
        
        {selectedMember ? (
            <>
                {/* Mobile Detail Header */}
                <div className="md:hidden p-3 bg-[#FFFDF9] border-b border-[#E0D6C2] flex items-center gap-2 pt-safe">
                    <button onClick={() => setSelectedMember(null)} className="p-2 -ml-2 text-[#433A31]">
                        <ChevronLeft size={24}/>
                    </button>
                    <span className="font-bold text-lg font-serif text-[#433A31]">会员详情</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F7F5F0] md:bg-[#FFFDF9] pb-safe">
                    {/* Membership Card Visual */}
                    <div className="p-4 md:p-8 pb-0">
                        <div className={`w-full aspect-[3/1.6] md:aspect-[3/1.4] max-h-[260px] rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all ${
                             selectedMember.tierId.includes('black') ? 'bg-gradient-to-br from-[#1a1a1a] to-[#433A31] text-white' :
                             selectedMember.tierId.includes('platinum') ? 'bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] text-[#0c4a6e]' :
                             selectedMember.tierId.includes('gold') ? 'bg-gradient-to-br from-[#fef3c7] to-[#fcd34d] text-[#78350f]' :
                             'bg-gradient-to-br from-[#f3f4f6] to-[#d1d5db] text-[#374151]'
                        }`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl -ml-16 -mb-16"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between font-serif">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[10px] md:text-sm opacity-70 tracking-[0.2em] uppercase">Somalinga Member</div>
                                        {isEditing ? (
                                            <select 
                                                className="mt-2 bg-white/20 backdrop-blur border border-white/30 text-white rounded p-1 outline-none text-lg md:text-xl font-bold appearance-none pr-4"
                                                value={editForm.tierId || selectedMember.tierId}
                                                onChange={e => setEditForm({...editForm, tierId: e.target.value})}
                                            >
                                                {MEMBER_TIERS.map(t => (
                                                    <option key={t.id} value={t.id} className="text-black">{t.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-2xl md:text-3xl font-bold mt-2">{getTier(selectedMember.tierId)?.name}</div>
                                        )}
                                    </div>
                                    <Award size={24} className="opacity-80 md:w-8 md:h-8"/>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="font-mono text-base md:text-xl tracking-widest opacity-90">{selectedMember.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')}</div>
                                    <div className="text-right">
                                        <div className="text-[10px] md:text-sm opacity-70">余额</div>
                                        {isEditing ? (
                                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur border border-white/30 rounded px-2">
                                                <span className="text-lg md:text-xl font-mono">¥</span>
                                                <input 
                                                    type="number"
                                                    className="bg-transparent outline-none w-24 text-2xl md:text-3xl font-bold font-mono text-right text-white"
                                                    value={editForm.balance !== undefined ? editForm.balance : selectedMember.balance}
                                                    onChange={e => setEditForm({...editForm, balance: Number(e.target.value)})}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-2xl md:text-3xl font-bold font-mono">¥{selectedMember.balance.toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pb-32">
                        {/* Notes Section Header */}
                        <div className="col-span-1 md:col-span-2 flex justify-between items-center border-b border-[#E0D6C2] pb-4">
                            <h3 className="text-lg md:text-xl font-bold font-serif text-[#433A31] flex items-center gap-2">
                                <FileText size={20} className="text-[#8B7355]"/>
                                客人档案
                            </h3>
                            <button 
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all text-sm font-bold ${isEditing ? 'bg-[#8B7355] text-white' : 'bg-[#FFFDF9] border border-[#E0D6C2] text-[#5C4D3C]'}`}
                            >
                                {isEditing ? <><Save size={16}/> 保存</> : <><Edit2 size={16}/> 编辑</>}
                            </button>
                        </div>

                        {/* General Notes */}
                        <div className="bg-[#FFFDF9] p-4 md:p-6 rounded-2xl border border-[#E0D6C2]">
                            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wide block mb-3">个人喜好 / 备注</label>
                            {isEditing ? (
                                <textarea 
                                    className="w-full h-32 bg-white border border-[#E0D6C2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#8B7355]/20 outline-none"
                                    value={editForm.notes !== undefined ? editForm.notes : selectedMember.notes}
                                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                />
                            ) : (
                                <p className="text-sm text-[#433A31] leading-relaxed whitespace-pre-wrap">{selectedMember.notes || '暂无备注'}</p>
                            )}
                        </div>

                         <div className="bg-[#FFFDF9] p-4 md:p-6 rounded-2xl border border-[#E0D6C2] flex flex-col justify-center">
                            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wide block mb-3">当前权益</label>
                            <div className="text-center">
                                {isEditing ? (
                                    <div className="flex flex-col items-center">
                                         <div className="flex items-center justify-center gap-2 mb-2">
                                             <label className="text-xs text-[#8C8174]">专属折扣(0-1):</label>
                                             <input 
                                                 type="number" 
                                                 step="0.01" 
                                                 max="1" 
                                                 min="0"
                                                 className="w-20 p-2 text-center rounded border border-[#E0D6C2] font-mono font-bold"
                                                 placeholder={`${getTier(selectedMember.tierId)?.discount}`}
                                                 value={editForm.customDiscount !== undefined ? editForm.customDiscount : (selectedMember.customDiscount || '')}
                                                 onChange={e => setEditForm({...editForm, customDiscount: parseFloat(e.target.value)})}
                                             />
                                         </div>
                                         <span className="text-xs text-[#8C8174]">留空则使用会员等级默认折扣</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold text-[#8B7355] font-mono">
                                            {((selectedMember.customDiscount ?? getTier(selectedMember.tierId)?.discount) || 1) * 10}折
                                        </div>
                                        {selectedMember.customDiscount && <span className="text-xs bg-[#8B7355] text-white px-2 py-0.5 rounded-full">专属折扣</span>}
                                        <div className="text-sm text-[#8C8174] mt-2">全场服务项目享受折扣</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#FFFDF9] p-4 md:p-6 rounded-2xl border border-[#E0D6C2]">
                            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wide block mb-3">美甲技术档案</label>
                             {isEditing ? (
                                <textarea 
                                    className="w-full h-40 bg-white border border-[#E0D6C2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#8B7355]/20 outline-none"
                                    value={editForm.nailArchive !== undefined ? editForm.nailArchive : selectedMember.nailArchive}
                                    onChange={e => setEditForm({...editForm, nailArchive: e.target.value})}
                                />
                            ) : (
                                <p className="text-sm text-[#433A31] leading-relaxed whitespace-pre-wrap font-mono text-xs">{selectedMember.nailArchive || '暂无记录'}</p>
                            )}
                        </div>

                        <div className="bg-[#FFFDF9] p-4 md:p-6 rounded-2xl border border-[#E0D6C2]">
                            <label className="text-xs font-bold text-[#8C8174] uppercase tracking-wide block mb-3">美睫技术档案</label>
                             {isEditing ? (
                                <textarea 
                                    className="w-full h-40 bg-white border border-[#E0D6C2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#8B7355]/20 outline-none"
                                    value={editForm.lashArchive !== undefined ? editForm.lashArchive : selectedMember.lashArchive}
                                    onChange={e => setEditForm({...editForm, lashArchive: e.target.value})}
                                />
                            ) : (
                                <p className="text-sm text-[#433A31] leading-relaxed whitespace-pre-wrap font-mono text-xs">{selectedMember.lashArchive || '暂无记录'}</p>
                            )}
                        </div>

                    </div>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#D6CDB8]">
                <User size={64} className="mb-4 opacity-50"/>
                <p className="font-serif text-lg">请在左侧选择一位会员查看详情</p>
            </div>
        )}
      </div>
    </div>
  );
};