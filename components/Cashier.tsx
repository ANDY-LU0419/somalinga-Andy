
import React, { useState, useEffect } from 'react';
import { STAFF_LIST, MEMBER_TIERS } from '../constants';
import { Service, Product, PaymentMethod, Transaction, Member } from '../types';
import { ShoppingCart, Search, CreditCard, CheckCircle, Trash2, Smartphone, QrCode, Ticket, ChevronUp, ChevronDown, X, ScanLine, Wallet, User, UserCheck, LogOut, AlertCircle, PackageX } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  originalPrice: number; // Keep track of base price
  price: number; // Current selling price (maybe discounted)
  type: 'service' | 'product' | 'topup';
  staffId?: string; 
  productId?: string; // Original Inventory ID
}

interface Props {
  services: Service[];
  members: Member[];
  inventory: Product[]; // Receive real inventory
  onAddTransaction: (tx: Transaction) => void;
  onUpdateMember: (member: Member) => void;
}

export const Cashier: React.FC<Props> = ({ services, members, inventory, onAddTransaction, onUpdateMember }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'qr'>('method');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false); 
  
  // Member Identification State
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  // Re-calculate cart prices when member changes
  useEffect(() => {
    setCart(prevCart => prevCart.map(item => {
        if (item.type === 'service') {
            const discount = getMemberDiscount();
            return { ...item, price: Math.floor(item.originalPrice * discount) };
        }
        return item;
    }));
  }, [currentMember]);

  const getMemberDiscount = () => {
      if (!currentMember) return 1;
      const tier = MEMBER_TIERS.find(t => t.id === currentMember.tierId);
      return currentMember.customDiscount ?? tier?.discount ?? 1;
  };

  const getCartItemCount = (productId: string) => {
    return cart.filter(item => item.productId === productId).length;
  };

  const addToCart = (item: Service | Product, type: 'service' | 'product') => {
    let price = 'sellingPrice' in item ? item.sellingPrice : item.price;
    const originalPrice = price;

    // Check Stock
    if (type === 'product' && 'stock' in item) {
        const currentCount = getCartItemCount(item.id);
        if (currentCount >= item.stock) {
            // alert('库存不足'); // Optional: show toast
            return;
        }
    }

    // Apply discount immediately if member is logged in and it's a service
    if (currentMember && type === 'service') {
        price = Math.floor(price * getMemberDiscount());
    }

    setCart([...cart, { 
        id: type === 'product' ? `prod-${item.id}-${Date.now()}` : item.id, 
        name: item.name, 
        originalPrice, 
        price, 
        type, 
        staffId: STAFF_LIST[0].id,
        productId: type === 'product' ? item.id : undefined
    }]);
  };

  const addTopUp = (amount: number) => {
    setCart([...cart, { id: `topup-${Date.now()}`, name: `VIP 会员充值 ¥${amount}`, originalPrice: amount, price: amount, type: 'topup', staffId: STAFF_LIST[0].id }]);
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const initiatePayment = () => {
      setShowPaymentModal(true);
      setPaymentStep('method');
      setSelectedPayment(null);
  }

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setPaymentStep('qr');
  };

  const handleConfirmReceived = () => {
    if (!selectedPayment) return;

    // Handle Member Balance Deduction
    if (selectedPayment === PaymentMethod.MemberCard) {
        if (!currentMember) return;
        if (currentMember.balance < total) {
            alert('余额不足，请充值或选择其他支付方式');
            return;
        }
        // Deduct balance
        const updatedMember = { ...currentMember, balance: currentMember.balance - total };
        onUpdateMember(updatedMember);
        setCurrentMember(updatedMember); // Update local state to reflect new balance immediately
    }

    const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date(),
        customerName: currentMember ? currentMember.name : '散客', 
        memberId: currentMember?.id,
        items: cart.map(item => ({
            name: item.name,
            type: item.type === 'topup' ? 'card_topup' : item.type as any,
            price: item.price,
            staffId: item.staffId,
            productId: item.productId // Pass productId for deduction
        })),
        totalAmount: total,
        paymentMethod: selectedPayment,
        status: 'completed'
    };

    onAddTransaction(newTx);
    
    setShowPaymentModal(false);
    setCart([]);
    setIsCartOpen(false);
    
    alert('收款成功！账单已记录。');
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = inventory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getPaymentBrand = (method: string) => {
      if (method.includes('微信')) return { color: 'bg-[#09BB07]', text: '微信支付', icon: <Smartphone size={24}/> };
      if (method.includes('支付宝')) return { color: 'bg-[#1677FF]', text: '支付宝', icon: <Wallet size={24}/> };
      if (method.includes('美团')) return { color: 'bg-[#FFC300] text-black', text: '美团核销', icon: <Ticket size={24}/> };
      if (method.includes('点评')) return { color: 'bg-[#FF6633]', text: '大众点评核销', icon: <Ticket size={24}/> };
      if (method.includes('会员卡')) return { color: 'bg-[#433A31]', text: '会员卡余额', icon: <CreditCard size={24}/> };
      return { color: 'bg-[#433A31]', text: '收款', icon: <CreditCard size={24}/> };
  };

  const searchMembers = () => {
      if (!memberSearch) return [];
      return members.filter(m => m.name.includes(memberSearch) || m.phone.includes(memberSearch));
  };

  const renderCartContent = () => (
    <>
        {/* Member Header inside Cart */}
        <div className="p-4 border-b border-[#E0D6C2] bg-[#F7F5F0]">
            {currentMember ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8B7355] text-white flex items-center justify-center font-bold text-lg">
                            {currentMember.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-[#433A31] flex items-center gap-2">
                                {currentMember.name}
                                <span className="text-[10px] bg-[#433A31] text-white px-1.5 py-0.5 rounded">
                                    {(getMemberDiscount() * 10).toFixed(1)}折
                                </span>
                            </div>
                            <div className="text-xs text-[#8C8174] font-mono">余额: ¥{currentMember.balance.toLocaleString()}</div>
                        </div>
                    </div>
                    <button onClick={() => setCurrentMember(null)} className="p-2 text-[#8C8174] hover:text-[#C07765]">
                        <LogOut size={18}/>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between" onClick={() => setShowMemberSearch(true)}>
                    <div className="flex items-center gap-3 opacity-60">
                         <div className="w-10 h-10 rounded-full bg-[#D6CDB8] flex items-center justify-center">
                             <User size={20} className="text-white"/>
                         </div>
                         <span className="text-sm font-bold text-[#8C8174]">散客 (点击识别会员)</span>
                    </div>
                </div>
            )}
            
            {/* Member Search Dropdown */}
            {showMemberSearch && !currentMember && (
                <div className="absolute top-16 left-0 w-full bg-white shadow-xl z-20 border-b border-[#E0D6C2] animate-slide-up p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Search size={16} className="text-[#8C8174]"/>
                        <input 
                            autoFocus
                            type="text" 
                            className="flex-1 outline-none text-sm" 
                            placeholder="输入手机号或姓名..."
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                        />
                        <button onClick={() => setShowMemberSearch(false)}><X size={18} className="text-[#8C8174]"/></button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                        {searchMembers().map(m => (
                            <div key={m.id} onClick={() => { setCurrentMember(m); setShowMemberSearch(false); setMemberSearch(''); }} className="p-2 hover:bg-[#F2EFE9] rounded cursor-pointer flex justify-between">
                                <span className="font-bold text-[#433A31]">{m.name}</span>
                                <span className="font-mono text-[#8C8174] text-xs">{m.phone}</span>
                            </div>
                        ))}
                        {memberSearch && searchMembers().length === 0 && <div className="text-xs text-[#D6CDB8] text-center py-2">无匹配会员</div>}
                    </div>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFDF9] custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#D6CDB8] gap-4">
                <ShoppingCart size={48} className="opacity-30"/>
                <p className="font-serif italic text-lg">购物车空空如也</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-[#F7F5F0] rounded-lg border border-[#E0D6C2] shadow-sm">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-medium text-[#433A31] text-sm truncate">{item.name}</div>
                  <div className="text-[10px] text-[#8C8174] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'service' ? 'bg-[#8B7355]' : 'bg-[#8F9E8B]'}`}></span>
                    {item.type === 'service' ? '服务' : item.type === 'product' ? '商品' : '充值'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#433A31] text-sm">¥{item.price}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-[#D6CDB8] hover:text-[#C07765]">
                        <Trash2 size={16} />
                    </button>
                  </div>
                  {item.originalPrice > item.price && (
                      <span className="text-[10px] text-[#D6CDB8] line-through font-mono">¥{item.originalPrice}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#E0D6C2] bg-[#FFFDF9] space-y-3 shadow-[0_-4px_20px_rgba(67,58,49,0.02)] pb-safe">
          <div className="flex justify-between text-xl font-bold text-[#433A31]">
            <span className="font-serif text-base self-end pb-1">总计</span>
            <span className="font-mono text-[#8B7355]">¥{total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={initiatePayment}
            className="w-full bg-[#433A31] text-[#F7F5F0] py-3 rounded-xl font-bold text-base hover:bg-[#2C241B] disabled:bg-[#E0D6C2] disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            去结算
          </button>
        </div>
    </>
  );

  return (
    <div className="flex h-full flex-col md:flex-row bg-[#F7F5F0] relative">
      
      {/* DESKTOP LEFT COLUMN (Cart) - Always visible on desktop */}
      <div className="hidden md:flex w-[320px] bg-[#FFFDF9] border-r border-[#E0D6C2] flex-col z-10 h-[calc(100vh-64px)] fixed left-64 top-16">
        <div className="p-4 bg-[#FFFDF9]/95 backdrop-blur border-b border-[#E0D6C2]">
          <h2 className="text-lg font-bold font-serif text-[#433A31] flex items-center gap-2">
            <ShoppingCart className="text-[#8B7355]" size={18} />
            当前订单
          </h2>
        </div>
        {renderCartContent()}
      </div>

      {/* RIGHT COLUMN (Product Grid) */}
      <div className="flex-1 p-4 md:p-8 md:ml-[320px]">
        {/* Search */}
        <div className="relative mb-6 max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6CDB8]" size={20}/>
          <input 
            type="text" 
            placeholder="搜索服务或商品..." 
            className="w-full pl-12 pr-4 py-3 border border-[#E0D6C2] rounded-xl shadow-sm focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] outline-none bg-white transition-all text-sm text-[#433A31] placeholder-[#D6CDB8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Topup */}
        <div className="mb-8">
           <h3 className="text-xs font-bold text-[#8C8174] uppercase tracking-widest mb-4 font-serif">VIP 储值</h3>
           <div className="flex flex-wrap gap-4">
             {[3000, 5000, 10000].map(amt => (
               <button key={amt} onClick={() => addTopUp(amt)} className="flex-1 min-w-[140px] px-6 py-4 bg-gradient-to-br from-[#2C241B] to-[#433A31] text-[#EBE5D9] rounded-xl shadow-lg border border-[#2C241B] relative overflow-hidden group active:scale-95 transition-transform">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><CreditCard size={40} /></div>
                 <span className="text-[10px] opacity-60 block mb-1 font-serif">Somalinga VIP</span>
                 <span className="text-lg font-mono tracking-wide">¥{amt.toLocaleString()}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-[#8C8174] uppercase tracking-widest mb-4 font-serif">服务项目</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredServices.map(srv => (
              <button 
                key={srv.id} 
                onClick={() => addToCart(srv, 'service')}
                className="flex flex-col p-4 bg-[#FFFDF9] border border-[#E0D6C2] rounded-xl hover:shadow-md hover:border-[#8B7355] transition-all text-left group relative h-full active:scale-[0.98]"
              >
                <div className="relative z-10 w-full flex flex-col h-full">
                    <span className="font-bold text-[#433A31] text-sm font-serif leading-tight block mb-2 line-clamp-2 flex-1">{srv.name}</span>
                    <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] bg-[#F2EFE9] text-[#8C8174] px-2 py-0.5 rounded-md font-mono">{srv.durationMin}min</span>
                         {currentMember && (
                             <span className="text-[10px] bg-[#433A31] text-white px-1.5 py-0.5 rounded font-mono">折后 ¥{(srv.price * getMemberDiscount()).toFixed(0)}</span>
                         )}
                    </div>
                    <div className="pt-2 border-t border-[#E0D6C2]/50 font-mono text-lg text-[#433A31] font-semibold flex justify-between items-center mt-auto">
                        <div className="flex flex-col leading-none">
                             {currentMember ? (
                                 <>
                                     <span className="text-xs text-[#D6CDB8] line-through">¥{srv.price}</span>
                                     <span className="text-[#8B7355]">¥{(srv.price * getMemberDiscount()).toFixed(0)}</span>
                                 </>
                             ) : (
                                 <span>¥{srv.price}</span>
                             )}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#F2EFE9] text-[#433A31] group-hover:bg-[#433A31] group-hover:text-white transition-colors flex items-center justify-center text-lg">+</div>
                    </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="pb-4">
          <h3 className="text-xs font-bold text-[#8C8174] uppercase tracking-widest mb-4 font-serif">零售商品</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredProducts.slice(0, 20).map(prod => {
              const cartCount = getCartItemCount(prod.id);
              const available = prod.stock - cartCount;
              const isOutOfStock = available <= 0;
              
              return (
              <button 
                key={prod.id} 
                onClick={() => !isOutOfStock && addToCart(prod, 'product')}
                disabled={isOutOfStock}
                className={`flex flex-col bg-[#FFFDF9] border border-[#E0D6C2] rounded-xl overflow-hidden hover:shadow-md transition-all text-left active:scale-[0.98] ${isOutOfStock ? 'opacity-60 cursor-not-allowed grayscale' : ''}`}
              >
                <div className="h-32 bg-[#F2EFE9] relative">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    <div className={`absolute bottom-0 right-0 text-[10px] font-bold px-2 py-1 rounded-tl-lg font-mono ${isOutOfStock ? 'bg-[#C07765] text-white' : 'bg-white/90 text-[#433A31]'}`}>
                        {isOutOfStock ? '已售罄' : `存:${available}`}
                    </div>
                    {isOutOfStock && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><PackageX size={32} className="text-[#C07765]"/></div>}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="font-medium text-xs text-[#433A31] line-clamp-2 mb-2 h-8 font-serif leading-tight">{prod.name}</span>
                  <div className="mt-auto flex justify-between items-center">
                      <span className="font-mono text-sm text-[#8B7355] font-bold">¥{prod.sellingPrice}</span>
                  </div>
                </div>
              </button>
            )})}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM FLOATING CART BAR */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 mb-safe">
        <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#2C241B] text-[#F7F5F0] p-4 rounded-2xl shadow-xl flex justify-between items-center border border-[#433A31]"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <ShoppingCart size={24} className="text-[#D4C5A5]"/>
                    {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#C07765] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#2C241B]">{cart.length}</span>}
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs text-[#D6CDB8]">{currentMember ? '折后总计' : '合计'}</span>
                    <span className="font-mono text-xl font-bold">¥{total.toFixed(0)}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold bg-[#433A31] px-4 py-2 rounded-xl">
                去结算 <ChevronUp size={16}/>
            </div>
        </button>
      </div>

      {/* MOBILE FULL SCREEN CART MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="bg-[#FFFDF9] w-full rounded-t-3xl shadow-2xl relative flex flex-col max-h-[85vh] animate-slide-up pb-safe">
                <div className="p-4 border-b border-[#E0D6C2] flex justify-between items-center">
                    <span className="font-serif font-bold text-lg text-[#433A31]">购物车 ({cart.length})</span>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 bg-[#F2EFE9] rounded-full text-[#8C8174]"><ChevronDown size={20}/></button>
                </div>
                {renderCartContent()}
            </div>
        </div>
      )}

      {/* PAYMENT MODAL (FULL SCREEN OVERLAY) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] bg-[#F7F5F0] flex flex-col animate-slide-up pt-safe pb-safe">
            {/* Modal Header */}
            {paymentStep === 'qr' && selectedPayment && (
                <div className={`p-6 text-white shadow-sm flex flex-col items-center justify-center ${getPaymentBrand(selectedPayment).color}`}>
                    <div className="w-full flex justify-between items-center mb-4 max-w-md">
                         <button onClick={() => setPaymentStep('method')} className="p-2 rounded-full bg-white/20"><ChevronDown className="rotate-90" size={24}/></button>
                         <span className="font-bold text-lg">{selectedPayment}</span>
                         <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-full bg-white/20"><X size={24}/></button>
                    </div>
                    <div className="text-4xl font-mono font-bold mt-2">¥{total.toFixed(2)}</div>
                    <div className="text-white/80 text-sm mt-1">本次待收金额</div>
                </div>
            )}
            
            {paymentStep === 'method' && (
                <div className="p-4 bg-[#FFFDF9] border-b border-[#E0D6C2] flex items-center justify-between shadow-sm relative z-10">
                     <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-full bg-[#F2EFE9] text-[#8C8174]"><X size={24}/></button>
                     <span className="text-lg font-bold font-serif text-[#433A31]">选择支付方式</span>
                     <div className="w-10"></div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#F7F5F0]">
                {paymentStep === 'method' ? (
                    <div className="w-full max-w-md space-y-4 animate-fade-in">
                        <div className="text-center mb-8">
                             <div className="text-sm text-[#8C8174] mb-2 font-serif">
                                 {currentMember ? `${currentMember.name} (会员)` : '散客'} 应付
                             </div>
                             <div className="text-5xl font-mono font-bold text-[#8B7355]">¥{total.toFixed(2)}</div>
                        </div>

                        {/* Add Member Card Option */}
                        {currentMember && (
                            <button 
                                onClick={() => handlePaymentSelect(PaymentMethod.MemberCard)}
                                className="w-full flex items-center gap-4 p-5 bg-[#433A31] text-[#F7F5F0] border border-[#2C241B] rounded-2xl shadow-md hover:bg-[#2C241B] transition-all active:scale-[0.98] mb-4"
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F7F5F0]/20 text-white">
                                    <CreditCard size={24}/>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-lg">会员卡余额支付</div>
                                    <div className="text-xs opacity-70 font-mono">当前余额: ¥{currentMember.balance.toLocaleString()}</div>
                                </div>
                                <div className="text-[#D6CDB8]"><ChevronUp className="rotate-90" size={20}/></div>
                            </button>
                        )}

                        {Object.values(PaymentMethod).filter(m => m !== PaymentMethod.MemberCard).map(method => {
                            const brand = getPaymentBrand(method);
                            return (
                                <button 
                                    key={method}
                                    onClick={() => handlePaymentSelect(method)}
                                    className="w-full flex items-center gap-4 p-5 bg-white border border-[#E0D6C2] rounded-2xl shadow-sm hover:border-[#8B7355] hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${brand.color.split(' ')[0]}`}>
                                        {brand.icon}
                                    </div>
                                    <span className="font-bold text-[#433A31] text-lg flex-1 text-left">{method}</span>
                                    <div className="text-[#D6CDB8]"><ChevronUp className="rotate-90" size={20}/></div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="w-full max-w-md flex flex-col items-center animate-fade-in text-center flex-1">
                        
                        {selectedPayment === PaymentMethod.MemberCard ? (
                             <div className="bg-white p-8 rounded-3xl border border-[#E0D6C2] shadow-sm mb-8 mt-8 w-full">
                                 <div className="w-16 h-16 bg-[#F2EFE9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#433A31]">
                                     <UserCheck size={32}/>
                                 </div>
                                 <h3 className="font-bold text-xl mb-2 text-[#433A31]">{currentMember?.name}</h3>
                                 <div className="space-y-2 text-sm text-[#5C4D3C] mb-6">
                                     <div className="flex justify-between">
                                         <span>当前余额</span>
                                         <span className="font-mono">¥{currentMember?.balance.toLocaleString()}</span>
                                     </div>
                                     <div className="flex justify-between text-[#C07765] font-bold">
                                         <span>本次扣款</span>
                                         <span className="font-mono">-¥{total.toFixed(2)}</span>
                                     </div>
                                     <div className="border-t border-[#E0D6C2] my-2"></div>
                                     <div className="flex justify-between font-bold">
                                         <span>扣款后余额</span>
                                         <span className="font-mono text-[#8B7355]">¥{((currentMember?.balance || 0) - total).toFixed(2)}</span>
                                     </div>
                                 </div>
                                 {currentMember && currentMember.balance < total && (
                                     <div className="bg-[#E6D4D4] text-[#A05252] p-3 rounded-lg text-xs flex items-center gap-2 mb-2">
                                         <AlertCircle size={14}/> 余额不足，无法支付
                                     </div>
                                 )}
                             </div>
                        ) : (
                            <div className="bg-white p-8 rounded-3xl border border-[#E0D6C2] shadow-sm mb-8 mt-8 relative w-full aspect-square max-w-[300px] flex items-center justify-center">
                                <QrCode size={200} className="text-[#433A31] opacity-90"/>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <ScanLine size={240} className="text-[#8B7355]/20 animate-pulse"/>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#8C8174] font-mono">
                                    扫码 / 核销码
                                </div>
                            </div>
                        )}

                        <div className="mt-auto w-full">
                            <button 
                                onClick={handleConfirmReceived}
                                disabled={selectedPayment === PaymentMethod.MemberCard && (currentMember?.balance || 0) < total}
                                className="w-full bg-[#433A31] text-[#F7F5F0] py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-[#2C241B] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-[#D6CDB8] disabled:cursor-not-allowed"
                            >
                                <CheckCircle size={24} className={selectedPayment === PaymentMethod.MemberCard ? 'text-white' : 'text-[#09BB07] fill-white'}/> 
                                {selectedPayment === PaymentMethod.MemberCard ? '确认扣款' : '确认已收款'}
                            </button>
                            {selectedPayment !== PaymentMethod.MemberCard && <p className="text-xs text-[#8C8174] mt-4">请确认顾客已完成支付或券码已核销</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};
