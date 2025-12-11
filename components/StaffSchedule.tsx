
import React, { useState } from 'react';
import { STAFF_LIST } from '../constants';
import { Shift, ShiftType } from '../types';
import { Coffee, AlertCircle, ChevronLeft, ChevronRight, Edit3, Save, Sun, Moon, Calendar, User } from 'lucide-react';

interface Props {
  shifts: Shift[];
  onUpdateShifts: (shifts: Shift[]) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export const StaffSchedule: React.FC<Props> = ({ shifts, onUpdateShifts }) => {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), 11, 1)); // Default Dec 1
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEditMode, setIsEditMode] = useState(false);

  const rosterStaff = STAFF_LIST.filter(s => !s.name.includes('Amber'));

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const getShift = (staffId: string, date: Date) => {
    return shifts.find(s => 
      s.staffId === staffId && 
      s.date.getDate() === date.getDate() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getFullYear() === date.getFullYear()
    );
  };

  const handleCycleShift = (staffId: string, date: Date) => {
    if (!isEditMode) return;
    const currentShift = getShift(staffId, date);
    let nextType: ShiftType;
    if (!currentShift || currentShift.type === ShiftType.Off) nextType = ShiftType.Early;
    else if (currentShift.type === ShiftType.Early) nextType = ShiftType.Late;
    else nextType = ShiftType.Off;

    const updatedShifts = shifts.filter(s => 
        !(s.staffId === staffId && 
          s.date.getDate() === date.getDate() && 
          s.date.getMonth() === date.getMonth() &&
          s.date.getFullYear() === date.getFullYear())
    );
    updatedShifts.push({
        id: currentShift?.id || `sh-${Date.now()}`,
        staffId,
        date,
        type: nextType
    });
    onUpdateShifts(updatedShifts);
  };

  const getShiftContent = (type?: ShiftType, minimal = false) => {
    switch (type) {
      case ShiftType.Early: 
        return minimal ? (
          <div className="w-full h-full bg-[#E8DCC4] flex flex-col items-center justify-center rounded text-[#5C4D3C] text-[10px] shadow-sm border border-[#D6C6A8]">
            <Sun size={10} className="mb-0.5 opacity-50"/>早
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] text-[#5C4D3C] bg-[#E8DCC4] rounded-lg border border-[#D6C6A8] shadow-sm select-none">
            <span className="font-bold">早</span><span className="opacity-80 scale-90 font-mono">10-20</span>
          </div>
        );
      case ShiftType.Late: 
        return minimal ? (
          <div className="w-full h-full bg-[#8B7355] flex flex-col items-center justify-center rounded text-[#F7F5F0] text-[10px] shadow-sm border border-[#5C4D3C]">
             <Moon size={10} className="mb-0.5 opacity-50"/>晚
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] text-[#F7F5F0] bg-[#8B7355] rounded-lg border border-[#5C4D3C] shadow-sm select-none">
            <span className="font-bold">晚</span><span className="opacity-80 scale-90 font-mono">11-21</span>
          </div>
        );
      case ShiftType.Off: 
        return minimal ? (
          <div className="w-full h-full bg-[#F2EFE9] flex items-center justify-center rounded text-[#8C8174] font-bold text-[10px] border border-[#E0D6C2]">休</div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] text-[#8C8174] bg-[#F2EFE9] rounded-lg border border-[#E0D6C2] opacity-80 select-none">
            <span className="font-bold">休</span>
          </div>
        );
      default: return <div className="w-full h-full flex items-center justify-center text-[#E0D6C2]">-</div>;
    }
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="w-full">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] overflow-hidden w-full overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(31,minmax(36px,1fr))] border-b border-[#E0D6C2] bg-[#F7F5F0]/80 backdrop-blur min-w-[1200px]">
            <div className="p-3 font-bold text-[#433A31] sticky left-0 bg-[#F7F5F0] z-10 border-r border-[#E0D6C2] shadow-[2px_0_5px_-2px_rgba(67,58,49,0.05)] text-sm">员工</div>
            {days.map(day => (
                <div key={day} className="py-2 text-center border-r border-[#E0D6C2]/50 last:border-r-0">
                <span className="text-xs font-bold text-[#5C4D3C] block">{day}</span>
                <span className="text-[9px] text-[#8C8174] uppercase">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('zh-CN', { weekday: 'narrow' })}
                </span>
                </div>
            ))}
            </div>
            {rosterStaff.map(staff => (
            <div key={staff.id} className="grid grid-cols-[80px_repeat(31,minmax(36px,1fr))] border-b border-[#E0D6C2]/50 min-w-[1200px]">
                <div className="p-2 flex items-center gap-2 sticky left-0 bg-[#FFFDF9] z-10 border-r border-[#E0D6C2] shadow-[2px_0_5px_-2px_rgba(67,58,49,0.05)]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${staff.color.replace('bg-', 'bg-opacity-100 bg-').split(' ')[0]}`}>
                        {staff.name.charAt(0)}
                    </div>
                    <div className="font-semibold text-xs text-[#433A31] truncate font-serif">{staff.name.split(' ')[0]}</div>
                </div>
                {days.map(day => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const shift = getShift(staff.id, date);
                return (
                    <div key={day} className={`p-0.5 border-r border-[#E0D6C2]/30 flex items-center justify-center h-12 transition-colors ${isEditMode ? 'active:bg-[#E0D6C2]/30 cursor-pointer' : ''}`} onClick={() => handleCycleShift(staff.id, date)}>
                    {getShiftContent(shift?.type, true)}
                    </div>
                );
                })}
            </div>
            ))}
        </div>

        {/* MOBILE STACKED VIEW */}
        <div className="md:hidden space-y-4">
            {rosterStaff.map(staff => (
                <div key={staff.id} className="bg-[#FFFDF9] rounded-xl border border-[#E0D6C2] overflow-hidden">
                    <div className="p-3 bg-[#F7F5F0] border-b border-[#E0D6C2] flex items-center gap-3">
                        <img src={staff.avatar} className="w-8 h-8 rounded-full border border-white" alt={staff.name}/>
                        <div className="font-bold text-[#433A31] font-serif">{staff.name}</div>
                    </div>
                    <div className="p-2 grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['日','一','二','三','四','五','六'].map(d => (
                            <div key={d} className="text-center text-[10px] text-[#8C8174] pb-1">{d}</div>
                        ))}
                        {/* Empty slots for start of month */}
                        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}
                        {/* Days */}
                        {days.map(day => {
                             const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                             const shift = getShift(staff.id, date);
                             return (
                                 <div 
                                    key={day} 
                                    onClick={() => handleCycleShift(staff.id, date)}
                                    className="aspect-square flex items-center justify-center"
                                 >
                                     <div className="relative w-full h-full">
                                        <div className="absolute top-0.5 left-0.5 text-[8px] text-[#8C8174] z-10">{day}</div>
                                        {getShiftContent(shift?.type, true)}
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({length: 7}, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    return (
        <div className="w-full">
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] overflow-hidden w-full overflow-x-auto">
                 <div className="grid grid-cols-[100px_repeat(7,minmax(60px,1fr))] bg-[#F7F5F0] border-b border-[#E0D6C2] min-w-[600px]">
                    <div className="p-4 font-bold text-[#433A31] border-r border-[#E0D6C2] font-serif sticky left-0 bg-[#F7F5F0] z-10 text-sm">员工</div>
                    {weekDays.map((d, i) => (
                        <div key={i} className={`p-2 text-center border-r border-[#E0D6C2] last:border-r-0 ${d.toDateString() === new Date().toDateString() ? 'bg-[#E8DCC4]/30' : ''}`}>
                            <div className="text-sm font-bold text-[#5C4D3C]">{d.getDate()}</div>
                            <div className="text-[10px] text-[#8C8174] uppercase">{d.toLocaleDateString('zh-CN', {weekday:'short'})}</div>
                        </div>
                    ))}
                 </div>
                 {rosterStaff.map(staff => (
                     <div key={staff.id} className="grid grid-cols-[100px_repeat(7,minmax(60px,1fr))] border-b border-[#E0D6C2]/50 last:border-b-0 min-w-[600px]">
                         <div className="p-3 flex items-center gap-2 border-r border-[#E0D6C2]/50 sticky left-0 bg-[#FFFDF9] z-10">
                            <img src={staff.avatar} alt={staff.name} className="w-8 h-8 rounded-full border border-[#E0D6C2]" />
                            <div className="font-bold text-[#433A31] font-serif text-sm">{staff.name.split(' ')[0]}</div>
                         </div>
                         {weekDays.map((d, i) => {
                             const shift = getShift(staff.id, d);
                             return (
                                 <div key={i} className={`p-1 border-r border-[#E0D6C2]/30 last:border-r-0 flex items-center justify-center h-16 transition-colors ${isEditMode ? 'active:bg-[#E0D6C2]/30 cursor-pointer' : ''}`} onClick={() => handleCycleShift(staff.id, d)}>
                                     {getShiftContent(shift?.type)}
                                 </div>
                             )
                         })}
                     </div>
                 ))}
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="md:hidden space-y-3">
                {weekDays.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                        <div key={i} className={`bg-[#FFFDF9] rounded-xl border border-[#E0D6C2] overflow-hidden ${isToday ? 'ring-2 ring-[#8B7355]/30' : ''}`}>
                             <div className={`p-3 border-b border-[#E0D6C2] flex justify-between items-center ${isToday ? 'bg-[#E8DCC4]/30' : 'bg-[#F7F5F0]'}`}>
                                 <div className="flex items-center gap-2">
                                     <span className="font-serif font-bold text-[#433A31]">{d.getDate()}日</span>
                                     <span className="text-xs text-[#8C8174]">{d.toLocaleDateString('zh-CN', {weekday:'long'})}</span>
                                 </div>
                                 {isToday && <span className="text-[10px] bg-[#8B7355] text-white px-2 py-0.5 rounded-full">今天</span>}
                             </div>
                             <div className="p-2 grid grid-cols-1 gap-2">
                                 {rosterStaff.map(staff => {
                                     const shift = getShift(staff.id, d);
                                     return (
                                         <div key={staff.id} className="flex items-center gap-3 p-2 bg-[#F9F7F2] rounded-lg" onClick={() => handleCycleShift(staff.id, d)}>
                                             <img src={staff.avatar} className="w-8 h-8 rounded-full border border-white" />
                                             <div className="w-16 font-bold text-sm text-[#433A31]">{staff.name.split(' ')[0]}</div>
                                             <div className="flex-1 h-10">
                                                 {getShiftContent(shift?.type)}
                                             </div>
                                         </div>
                                     )
                                 })}
                             </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
  };

  const renderDayView = () => {
      return (
          <div className="bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] overflow-hidden p-4 w-full">
              <h3 className="text-center font-bold text-lg mb-6 border-b border-[#E0D6C2] pb-4 font-serif text-[#433A31]">
                  {currentDate.toLocaleDateString('zh-CN', {month:'long', day:'numeric', weekday:'long'})}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                  {rosterStaff.map(staff => {
                      const shift = getShift(staff.id, currentDate);
                      return (
                          <div key={staff.id} className={`flex items-center gap-4 p-4 rounded-xl border border-[#E0D6C2]/50 transition-all bg-[#F7F5F0]/30 ${isEditMode ? 'active:scale-95 cursor-pointer ring-2 ring-transparent hover:ring-[#8B7355]/20' : ''}`} 
                             onClick={() => handleCycleShift(staff.id, currentDate)}>
                              <div className="flex items-center gap-3 w-32 flex-shrink-0">
                                  <img src={staff.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                  <div className="font-bold text-base text-[#433A31] font-serif">{staff.name.split(' ')[0]}</div>
                              </div>
                              <div className="flex-1 pointer-events-none">
                                  {shift?.type === ShiftType.Off || !shift ? (
                                      <div className="flex items-center gap-2 text-[#8C8174] bg-[#E0D6C2]/30 px-3 py-2 rounded-lg text-sm w-fit">
                                          <Coffee size={16}/><span className="font-bold">休息</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2">
                                          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${shift?.type === ShiftType.Early ? 'bg-[#E8DCC4] text-[#5C4D3C]' : 'bg-[#8B7355] text-[#F7F5F0]'}`}>
                                              {shift?.type.split(' ')[0]} {shift?.type === ShiftType.Early ? '10-20点' : '11-21点'}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  };

  return (
    <div className="p-4 md:p-8 w-full h-full flex flex-col relative pb-24 md:pb-8">
      {/* Mobile Header Controls */}
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-[#433A31] flex items-center gap-2">
                  <User size={20} className="md:hidden"/>
                  员工排班
              </h2>
              <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditMode(!isEditMode); }}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isEditMode ? 'bg-[#8B7355] text-white ring-2 ring-[#8B7355] ring-offset-1' : 'bg-white border border-[#E0D6C2] text-[#5C4D3C] hover:bg-[#F2EFE9]'}`}
              >
                  {isEditMode ? <><Save size={16}/> 完成排班</> : <><Edit3 size={16}/> 排班管理</>}
              </button>
          </div>

          <div className="flex items-center gap-2 bg-[#F2E6D0] px-3 py-2 rounded-lg border border-[#E0D6C2] text-[#8C6B38] text-xs">
              <AlertCircle size={14} /> <span>玄学顾问 Amber 需单独预约</span>
          </div>

          <div className="flex justify-between items-center gap-2">
               <div className="flex items-center bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] p-1 flex-1 justify-between max-w-xs">
                    <button onClick={prevPeriod} className="p-2 text-[#8C8174] hover:bg-[#F2EFE9] rounded-lg"><ChevronLeft size={18} /></button>
                    <span className="font-medium text-sm text-[#433A31] font-serif">
                        {currentDate.toLocaleDateString('zh-CN', { month: 'short', day: viewMode === 'day' ? 'numeric' : undefined })}
                    </span>
                    <button onClick={nextPeriod} className="p-2 text-[#8C8174] hover:bg-[#F2EFE9] rounded-lg"><ChevronRight size={18} /></button>
               </div>
               <div className="flex bg-[#EBE5D9] p-1 rounded-xl">
                    {([{id:'day', label:'日'}, {id:'week', label:'周'}, {id:'month', label:'月'}] as {id:ViewMode, label:string}[]).map(mode => (
                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === mode.id ? 'bg-[#FFFDF9] shadow-sm text-[#433A31]' : 'text-[#8C8174] hover:text-[#5C4D3C]'}`}>
                        {mode.label}
                    </button>
                    ))}
               </div>
          </div>
      </div>
      
      <div className="animate-fade-in flex-1">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};
