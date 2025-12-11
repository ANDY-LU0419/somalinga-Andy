import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Check, Star, Hand, Eye, Sparkles, Coffee, Clock, PenTool, Trash2, User, AlertTriangle } from 'lucide-react';
import { Booking, ServiceType, Member, Service } from '../types';
import { STAFF_LIST, MEMBER_TIERS } from '../constants';

interface Props {
  bookings: Booking[];
  members: Member[];
  services: Service[];
  onAddBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export const AppointmentCalendar: React.FC<Props> = ({ bookings, members, services, onAddBooking, onDeleteBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), 11, 1)); // Default to Dec 1st
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    staffId: '',
    serviceId: '',
    date: '',
    time: '10:00',
    // Manual entry fields
    isManualService: false,
    manualServiceName: '',
    manualServicePrice: '',
    manualServiceDuration: '60'
  });
  
  const [detectedMember, setDetectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (formData.phone.length >= 11) {
        const member = members.find(m => m.phone === formData.phone);
        setDetectedMember(member || null);
        if (member && !formData.customerName) {
            setFormData(prev => ({...prev, customerName: member.name}));
        }
    } else {
        setDetectedMember(null);
    }
  }, [formData.phone, members]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(b => 
      b.date.getDate() === date.getDate() && 
      b.date.getMonth() === date.getMonth() &&
      b.date.getFullYear() === date.getFullYear()
    );
  };

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateVal = e.target.value; 
      if (dateVal) {
          const [y, m, d] = dateVal.split('-').map(Number);
          setCurrentDate(new Date(y, m - 1, d));
      }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getServiceIcon = (serviceId: string) => {
      const srv = services.find(s => s.id === serviceId);
      if (!srv) return <Hand size={14} />;
      switch(srv.type) {
          case ServiceType.Lashes: return <Eye size={14} />;
          case ServiceType.Consultation: return <Sparkles size={14} />;
          case ServiceType.Tea: return <Coffee size={14} />;
          default: return <Hand size={14} />;
      }
  };

  const getStaffColor = (staffId: string) => {
    const staff = STAFF_LIST.find(s => s.id === staffId);
    return staff ? staff.color : 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getStaffName = (id: string) => STAFF_LIST.find(s => s.id === id)?.name.split(' ')[0] || '';
  
  const getServiceName = (b: Booking) => {
      if (b.customServiceName) return b.customServiceName;
      return services.find(s => s.id === b.serviceId)?.name || '未知项目';
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (selectedBooking) {
        onDeleteBooking(selectedBooking.id);
        setShowDeleteConfirm(false);
        setSelectedBooking(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.staffId) return;
    
    // Validate Service
    if (!formData.isManualService && !formData.serviceId) return;
    if (formData.isManualService && (!formData.manualServiceName || !formData.manualServicePrice)) return;

    const [year, month, day] = formData.date.split('-').map(Number);
    const [hour, minute] = formData.time.split(':').map(Number);
    const bookingDate = new Date(year, month - 1, day, hour, minute);
    
    let price = 0;
    let duration = 60;
    let serviceId = '';

    if (formData.isManualService) {
        price = Number(formData.manualServicePrice);
        duration = Number(formData.manualServiceDuration);
        serviceId = 'manual-' + Date.now();
    } else {
        const service = services.find(s => s.id === formData.serviceId);
        if (service) {
            price = service.price;
            duration = service.durationMin;
            serviceId = service.id;
        }
    }

    // Apply Discount
    if (detectedMember) {
        const discountRate = detectedMember.customDiscount !== undefined 
            ? detectedMember.customDiscount 
            : (MEMBER_TIERS.find(t => t.id === detectedMember.tierId)?.discount || 1);
        price = price * discountRate;
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      customerId: detectedMember ? detectedMember.id : `c-${Date.now()}`,
      customerName: formData.customerName,
      customerPhone: formData.phone,
      memberId: detectedMember?.id,
      staffId: formData.staffId,
      serviceId: serviceId,
      customServiceName: formData.isManualService ? formData.manualServiceName : undefined,
      date: bookingDate,
      durationMin: duration,
      estimatedPrice: Math.floor(price),
      status: 'confirmed'
    };

    onAddBooking(newBooking);
    setIsModalOpen(false);
    setFormData({
      customerName: '',
      phone: '',
      staffId: '',
      serviceId: '',
      date: '',
      time: '10:00',
      isManualService: false,
      manualServiceName: '',
      manualServicePrice: '',
      manualServiceDuration: '60'
    });
    setDetectedMember(null);
  };

  // --- Views ---

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); 

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-40 border-b border-r border-[#E0D6C2]/40 bg-[#F2EFE9]/30"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayBookings = getBookingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div 
          key={d} 
          onClick={() => { setCurrentDate(date); setViewMode('day'); }}
          className="h-16 md:h-40 border-b border-r border-[#E0D6C2]/40 p-1 md:p-2 bg-[#FFFDF9]/60 backdrop-blur-sm active:bg-[#E8DCC4] relative cursor-pointer flex flex-col items-center md:items-start transition-colors"
        >
          <span className={`text-sm md:text-sm font-serif font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#5C4D3C]'}`}>
            {d}
          </span>
          
          {/* Mobile Dot Indicator */}
          <div className="md:hidden mt-2 flex gap-0.5 flex-wrap justify-center max-w-full">
            {dayBookings.slice(0, 3).map((b, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full ${getStaffColor(b.staffId).replace('text', 'bg').replace('border', 'border-0').split(' ')[0]}`}></div>
            ))}
            {dayBookings.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-[#D6CDB8]"></div>}
          </div>

          {/* Desktop Detailed List */}
          <div className="hidden md:block mt-1 md:mt-2 space-y-1 w-full overflow-y-auto max-h-[110px] custom-scrollbar">
            {dayBookings.slice(0, 4).map(b => (
              <div 
                key={b.id} 
                onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                className={`text-[11px] leading-tight px-2 py-1 rounded border-l-2 ${getStaffColor(b.staffId).replace('text', 'border')} bg-opacity-40 flex flex-col hover:opacity-80 transition-opacity`}
              >
                <div className="flex justify-between items-center">
                    <span className="font-bold truncate">{b.customerName}</span>
                    <span className="opacity-70 font-mono scale-90">{formatTime(b.date)}</span>
                </div>
                <div className="flex justify-between items-center opacity-80 border-t border-black/5 pt-0.5 mt-0.5">
                    <span className="truncate max-w-[70px]">{getServiceName(b)}</span>
                    <span className="font-bold">{getStaffName(b.staffId)}</span>
                </div>
              </div>
            ))}
            {dayBookings.length > 4 && (
              <div className="text-[9px] text-[#8C8174] pl-1 font-serif italic">+{dayBookings.length - 4}</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 border border-[#E0D6C2] rounded-xl overflow-hidden shadow-sm bg-[#FFFDF9] w-full">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="py-2 md:py-4 text-center text-xs md:text-sm font-serif font-bold text-[#8C8174] border-b border-r border-[#E0D6C2]/40 last:border-r-0 bg-[#F2EFE9]/50">{day}</div>
            ))}
            {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 9); 
    const daysBookings = getBookingsForDate(currentDate);

    return (
      <div className="glass-panel rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-280px)] overflow-y-auto relative bg-[#FFFDF9]">
        {hours.map(hour => (
          <div key={hour} className="flex border-b border-[#E0D6C2]/30 min-h-[100px] relative">
            <div className="w-14 md:w-24 flex-shrink-0 text-xs md:text-sm font-serif text-[#8C8174] text-right pr-2 md:pr-6 pt-2 border-r border-[#E0D6C2]/30 sticky left-0 bg-[#FFFDF9]/95 backdrop-blur z-20">
              {hour}:00
            </div>
            <div className="flex-grow relative bg-[#F9F7F2]/50">
              <div className="absolute top-1/2 w-full border-t border-dashed border-[#E0D6C2]/30"></div>
              {daysBookings
                .filter(b => b.date.getHours() === hour)
                .map(b => {
                  const staff = STAFF_LIST.find(s => s.id === b.staffId);
                  const topOffset = (b.date.getMinutes() / 60) * 100;
                  const height = Math.max((b.durationMin / 60) * 100, 60); 
                  
                  return (
                    <div 
                      key={b.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                      className={`absolute left-1 right-1 md:left-4 md:right-4 rounded-lg p-2 md:p-3 shadow-sm border text-xs md:text-sm flex flex-col justify-between z-10 ${getStaffColor(b.staffId)} hover:brightness-95 cursor-pointer transition-all`}
                      style={{ top: `${topOffset}%`, height: `${height}px` }}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            {getServiceIcon(b.serviceId)}
                            <span className="font-bold text-sm md:text-base font-serif truncate">{b.customerName}</span>
                            {b.memberId && <Star size={10} className="fill-[#D4A373] text-[#D4A373]" />}
                        </div>
                        <div className="text-[10px] md:text-xs opacity-90 mt-1 font-medium truncate">
                            {getServiceName(b)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-1 pt-1 border-t border-black/5">
                        <span className="flex items-center gap-1 font-bold text-[10px] md:text-xs">{staff?.name.split(' ')[0]}</span>
                        <span className="font-mono font-bold text-[10px] md:text-xs">¥{b.estimatedPrice}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay(); 
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const weekDays = Array.from({length: 7}, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const hours = Array.from({ length: 13 }, (_, i) => i + 9); 

    return (
      <div className="bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        
        {/* MOBILE VERTICAL LIST VIEW */}
        <div className="md:hidden flex-1 overflow-y-auto">
           {weekDays.map((d, i) => {
               const dayBookings = getBookingsForDate(d).sort((a,b) => a.date.getTime() - b.date.getTime());
               const isToday = d.toDateString() === new Date().toDateString();

               return (
                   <div key={i} className={`border-b border-[#E0D6C2] ${isToday ? 'bg-[#F9F7F2]' : ''}`}>
                       <div className="p-3 bg-[#F7F5F0] flex items-center justify-between sticky top-0 z-10 border-b border-[#E0D6C2]/30">
                           <div className="flex items-center gap-2">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-serif ${isToday ? 'bg-[#8B7355] text-white' : 'text-[#433A31] bg-white border border-[#E0D6C2]'}`}>
                                   {d.getDate()}
                               </div>
                               <span className={`text-sm font-bold ${isToday ? 'text-[#8B7355]' : 'text-[#8C8174]'}`}>
                                   {d.toLocaleDateString('zh-CN', {weekday:'long'})}
                               </span>
                           </div>
                           {dayBookings.length > 0 && (
                               <span className="text-xs bg-[#E8DCC4] text-[#5C4D3C] px-2 py-0.5 rounded-full font-bold">
                                   {dayBookings.length} 预约
                               </span>
                           )}
                       </div>

                       <div className="p-2 space-y-2">
                           {dayBookings.length === 0 ? (
                               <div className="text-center py-4 text-[#D6CDB8] text-xs font-serif italic">今日无预约</div>
                           ) : (
                               dayBookings.map(b => {
                                   const staff = STAFF_LIST.find(s => s.id === b.staffId);
                                   return (
                                       <div 
                                         key={b.id} 
                                         onClick={() => setSelectedBooking(b)}
                                         className={`p-3 rounded-lg border flex items-center gap-3 ${getStaffColor(b.staffId)} active:scale-95 transition-transform`}
                                        >
                                            <div className="flex-shrink-0 w-12 text-center border-r border-black/10 pr-3">
                                                <div className="font-mono font-bold text-sm text-[#433A31]">{formatTime(b.date)}</div>
                                                <div className="text-[10px] opacity-70">{b.durationMin}min</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-[#433A31] text-sm flex items-center gap-1">
                                                        {getServiceIcon(b.serviceId)} {b.customerName}
                                                    </span>
                                                    <span className="font-bold text-xs">{staff?.name.split(' ')[0]}</span>
                                                </div>
                                                <div className="text-xs opacity-90 truncate">{getServiceName(b)}</div>
                                            </div>
                                       </div>
                                   )
                               })
                           )}
                       </div>
                   </div>
               )
           })}
        </div>

        {/* DESKTOP GRID VIEW */}
        <div className="hidden md:flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
                <div className="min-w-[800px]"> 
                    <div className="grid grid-cols-[50px_repeat(7,1fr)] bg-[#F7F5F0] border-b border-[#E0D6C2]">
                        <div className="p-2 border-r border-[#E0D6C2]"></div> 
                        {weekDays.map((d, i) => {
                            const isToday = d.toDateString() === new Date().toDateString();
                            return (
                                <div key={i} className={`p-2 text-center border-r border-[#E0D6C2] last:border-r-0 ${isToday ? 'bg-[#E8DCC4]/40' : ''}`}>
                                    <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#8B7355]' : 'text-[#8C8174]'}`}>
                                        {d.toLocaleDateString('zh-CN', {weekday:'short'})}
                                    </div>
                                    <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold font-serif text-sm ${isToday ? 'bg-[#8B7355] text-white' : 'text-[#433A31]'}`}>
                                        {d.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-[50px_repeat(7,1fr)] min-h-[1000px]">
                            <div className="border-r border-[#E0D6C2] bg-[#FFFDF9]">
                                {hours.map(h => (
                                    <div key={h} className="h-[80px] border-b border-[#E0D6C2]/30 text-[10px] text-[#8C8174] font-serif text-right pr-1 pt-2">
                                        {h}:00
                                    </div>
                                ))}
                            </div>

                            {weekDays.map((d, colIndex) => {
                                const dayBookings = getBookingsForDate(d);
                                return (
                                    <div key={colIndex} className="relative border-r border-[#E0D6C2] last:border-r-0">
                                        {hours.map(h => (
                                            <div key={h} className="h-[80px] border-b border-[#E0D6C2]/30 w-full"></div>
                                        ))}
                                        {dayBookings.map(b => {
                                            const startHour = b.date.getHours();
                                            if (startHour < 9 || startHour > 21) return null;
                                            const topOffset = ((startHour - 9) * 80) + ((b.date.getMinutes() / 60) * 80);
                                            const height = Math.max((b.durationMin / 60) * 80, 50);
                                            const staff = STAFF_LIST.find(s => s.id === b.staffId);
                                            return (
                                                <div 
                                                    key={b.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                                                    className={`absolute left-0.5 right-0.5 rounded p-1 text-[9px] overflow-hidden shadow-sm border ${getStaffColor(b.staffId)} hover:brightness-95 cursor-pointer`}
                                                    style={{ top: `${topOffset}px`, height: `${height}px` }}
                                                >
                                                    <div className="font-bold truncate">{b.customerName}</div>
                                                    <div className="opacity-80 truncate">{getServiceName(b)}</div>
                                                    <div className="mt-0.5 pt-0.5 border-t border-black/5 flex justify-between">
                                                        <span>{staff?.name.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 w-full h-full relative">
      {/* Mobile Controls Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center md:hidden">
            <h2 className="text-xl font-serif font-bold text-[#433A31] flex items-center gap-2">
                <CalendarIcon className="text-[#8B7355]" size={20} /> 预约日历
            </h2>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#433A31] text-[#F7F5F0] p-2 rounded-lg shadow-sm"><Plus size={20}/></button>
        </div>

        {/* Date & View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="hidden md:flex">
                 <h2 className="text-3xl font-serif font-bold text-[#433A31] flex items-center gap-3">
                    <CalendarIcon className="text-[#8B7355]" /> 预约日历
                 </h2>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
                <div className="flex items-center bg-[#FFFDF9] rounded-xl shadow-sm border border-[#E0D6C2] p-1 relative flex-1 md:flex-none justify-between">
                    <button onClick={prevPeriod} className="p-2 hover:bg-[#F2EFE9] rounded-lg text-[#8C8174]"><ChevronLeft size={18} /></button>
                    <div className="relative">
                        <input type="date" value={currentDate.toISOString().split('T')[0]} onChange={handleDateChange} className="absolute inset-0 opacity-0 z-10 w-full cursor-pointer" />
                        <div className="px-2 md:px-6 font-medium font-serif text-[#433A31] text-base md:text-lg flex items-center justify-center gap-2 pointer-events-none">
                             {currentDate.toLocaleDateString('zh-CN', { month: 'short', day: viewMode === 'day' ? 'numeric' : undefined })}
                             <CalendarIcon size={12} className="opacity-50 text-[#8B7355]"/>
                        </div>
                    </div>
                    <button onClick={nextPeriod} className="p-2 hover:bg-[#F2EFE9] rounded-lg text-[#8C8174]"><ChevronRight size={18} /></button>
                </div>

                <div className="flex bg-[#EBE5D9] p-1 rounded-xl">
                    {([{id:'day', label:'日'}, {id:'week', label:'周'}, {id:'month', label:'月'}] as {id:ViewMode, label:string}[]).map(mode => (
                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`px-3 md:px-6 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${viewMode === mode.id ? 'bg-[#FFFDF9] shadow-sm text-[#433A31]' : 'text-[#8C8174]'}`}>
                        {mode.label}
                    </button>
                    ))}
                </div>
                
                <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 bg-[#433A31] text-[#F7F5F0] px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-[#2C241B]">
                    <Plus size={18} /> 新建预约
                </button>
            </div>
        </div>
      </div>

      <div className="animate-fade-in w-full pb-20 md:pb-0">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
      </div>

      {/* NEW BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-[#2C241B]/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-[#FFFDF9] w-full md:rounded-3xl rounded-t-3xl shadow-2xl md:max-w-lg relative z-10 overflow-hidden animate-slide-up md:animate-scale-in border-t md:border border-[#E0D6C2] flex flex-col max-h-[85vh]">
            <div className="p-4 md:p-6 border-b border-[#E0D6C2] flex justify-between items-center bg-[#F7F5F0] flex-shrink-0">
              <h3 className="text-lg md:text-xl font-bold font-serif text-[#433A31]">新建预约</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#EBE5D9] rounded-full text-[#8C8174]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">电话</label>
                  <input required type="tel" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-lg outline-none" 
                    value={formData.phone} placeholder="输入以匹配会员" onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">姓名</label>
                  <div className="relative">
                    <input required type="text" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none font-serif" 
                        value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                    {detectedMember && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#F2EFE9] px-2 py-1 rounded border border-[#E0D6C2]">
                            <Star size={12} className="fill-[#8B7355] text-[#8B7355]"/>
                            <span className="text-[10px] font-bold text-[#5C4D3C]">{MEMBER_TIERS.find(t=>t.id === detectedMember.tierId)?.name}</span>
                        </div>
                    )}
                  </div>
              </div>

              {/* Service Selection / Manual Entry Toggle */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#8C8174] uppercase">服务项目</label>
                    <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, isManualService: !prev.isManualService}))}
                        className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded border transition-colors ${formData.isManualService ? 'bg-[#8B7355] text-white border-[#8B7355]' : 'bg-white text-[#8C8174] border-[#E0D6C2]'}`}
                    >
                        <PenTool size={10}/> {formData.isManualService ? '切换回列表选择' : '手动输入'}
                    </button>
                </div>
                
                {formData.isManualService ? (
                    <div className="space-y-3 bg-[#F7F5F0] p-3 rounded-xl border border-[#E0D6C2]">
                         <input 
                            required 
                            type="text" 
                            className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none placeholder:text-sm" 
                            placeholder="输入项目名称"
                            value={formData.manualServiceName} 
                            onChange={e => setFormData({...formData, manualServiceName: e.target.value})} 
                         />
                         <div className="flex gap-3">
                             <input 
                                required 
                                type="number" 
                                className="flex-1 p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none font-mono font-bold text-[#8B7355] placeholder:font-sans placeholder:text-[#D6CDB8] placeholder:font-normal" 
                                placeholder="价格 (¥)"
                                value={formData.manualServicePrice} 
                                onChange={e => setFormData({...formData, manualServicePrice: e.target.value})} 
                             />
                             <input 
                                required 
                                type="number" 
                                className="flex-1 p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none placeholder:text-sm" 
                                placeholder="时长 (分)"
                                value={formData.manualServiceDuration} 
                                onChange={e => setFormData({...formData, manualServiceDuration: e.target.value})} 
                             />
                         </div>
                    </div>
                ) : (
                    <select required className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none"
                    value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}>
                    <option value="">请选择...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8C8174] uppercase">美甲师</label>
                <select required className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none"
                   value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}>
                  <option value="">请选择...</option>
                  {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">日期</label>
                  <div className="relative">
                      <input required type="date" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none appearance-none"
                            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8174]"><CalendarIcon size={16}/></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">时间</label>
                  <div className="relative">
                    <input required type="time" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl text-base outline-none appearance-none"
                        value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8174]"><Clock size={16}/></div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#433A31] text-[#F7F5F0] py-4 rounded-xl font-bold text-lg hover:bg-[#2C241B] shadow-lg flex items-center justify-center gap-2 mb-safe">
                <Check size={20} /> 确认预约
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#2C241B]/40 backdrop-blur-sm" onClick={() => { setSelectedBooking(null); setShowDeleteConfirm(false); }}></div>
            <div className="bg-[#FFFDF9] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-scale-in border border-[#E0D6C2]">
                 <div className="bg-[#F7F5F0] p-4 border-b border-[#E0D6C2] flex justify-between items-center">
                     <h3 className="font-bold font-serif text-[#433A31]">预约详情</h3>
                     <button onClick={() => { setSelectedBooking(null); setShowDeleteConfirm(false); }}><X size={20} className="text-[#8C8174]"/></button>
                 </div>
                 <div className="p-6 space-y-4">
                     <div className="flex items-center gap-4 mb-2">
                         <div className="w-12 h-12 rounded-full bg-[#8B7355] text-white flex items-center justify-center font-serif font-bold text-xl">
                             {selectedBooking.customerName[0]}
                         </div>
                         <div>
                             <div className="font-bold text-lg text-[#433A31]">{selectedBooking.customerName}</div>
                             <div className="text-sm text-[#8C8174] font-mono">{selectedBooking.customerPhone}</div>
                         </div>
                     </div>
                     
                     <div className="space-y-2 bg-[#F7F5F0]/50 p-4 rounded-xl border border-[#E0D6C2]/50 text-sm">
                         <div className="flex justify-between">
                             <span className="text-[#8C8174]">项目</span>
                             <span className="font-bold text-[#433A31]">{getServiceName(selectedBooking)}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-[#8C8174]">时间</span>
                             <span className="font-mono">{selectedBooking.date.toLocaleString('zh-CN', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-[#8C8174]">美甲师</span>
                             <span className="font-bold">{getStaffName(selectedBooking.staffId)}</span>
                         </div>
                         <div className="flex justify-between border-t border-[#E0D6C2] pt-2 mt-2">
                             <span className="text-[#8C8174]">预估价格</span>
                             <span className="font-mono font-bold text-[#8B7355]">¥{selectedBooking.estimatedPrice}</span>
                         </div>
                     </div>

                     <button 
                        onClick={handleDeleteClick}
                        className="w-full py-3 rounded-xl border border-[#E0D6C2] text-[#C07765] font-bold hover:bg-[#F2EFE9] transition-colors flex items-center justify-center gap-2"
                     >
                         <Trash2 size={16}/> 取消预约
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
             <div className="bg-[#FFFDF9] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 text-center animate-scale-in border border-[#E0D6C2]">
                 <div className="w-12 h-12 bg-[#F2EFE9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C07765]">
                     <AlertTriangle size={24}/>
                 </div>
                 <h3 className="text-xl font-bold text-[#433A31] font-serif mb-2">确认取消?</h3>
                 <p className="text-[#8C8174] text-sm mb-6">取消后将无法恢复该预约。</p>
                 <div className="flex gap-3">
                     <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-[#E0D6C2] text-[#5C4D3C] font-bold">返回</button>
                     <button onClick={executeDelete} className="flex-1 py-3 rounded-xl bg-[#C07765] text-white font-bold shadow-lg">确认取消</button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};