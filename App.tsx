import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import { StaffSchedule } from './components/StaffSchedule';
import { Cashier } from './components/Cashier';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { MemberManagement } from './components/MemberManagement';
import { ServiceManagement } from './components/ServiceManagement';
import { MOCK_BOOKINGS, MOCK_MEMBERS, MOCK_SHIFTS, MOCK_INVENTORY, SERVICES as INITIAL_SERVICES, MOCK_TRANSACTIONS } from './constants';
import { Booking, Member, Shift, Product, Service, Transaction, User } from './types';

// Mock credentials
const MOCK_USERS: User[] = [
  { username: 'amber', name: 'Amber', role: 'admin', staffId: 's4' }, 
  { username: 'lulu', name: '露露 (Lulu)', role: 'staff', staffId: 's1' }, 
  { username: 'qianqian', name: '芊芊 (Qianqian)', role: 'staff', staffId: 's2' }, 
  { username: 'guoguo', name: '果果 (Guoguo)', role: 'staff', staffId: 's3' }, 
];

// Helper to restore Date objects from JSON strings
const fixDates = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
};

// Storage Keys (Updated for Production System Reset)
// Changing these keys forces a fresh start, ignoring any old mock data in browser cache.
const KEYS = {
  BOOKINGS: 'somalinga_bookings_live_v1',
  MEMBERS: 'somalinga_members_live_v1',
  SHIFTS: 'somalinga_shifts_live_v1',
  INVENTORY: 'somalinga_inventory_live_v1',
  SERVICES: 'somalinga_services_live_v1',
  TRANSACTIONS: 'somalinga_transactions_live_v1'
};

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  
  // Data State with LocalStorage Initialization
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(KEYS.BOOKINGS);
    return saved ? JSON.parse(saved, fixDates) : MOCK_BOOKINGS;
  });
  
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(KEYS.MEMBERS);
    return saved ? JSON.parse(saved, fixDates) : MOCK_MEMBERS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(KEYS.SHIFTS);
    return saved ? JSON.parse(saved, fixDates) : MOCK_SHIFTS;
  });

  const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem(KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved, fixDates) : MOCK_TRANSACTIONS;
  });

  // --- Auto-Save Effects ---

  useEffect(() => { localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(KEYS.SERVICES, JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);

  // --- Handlers ---

  const handleLogin = (username: string, pass: string) => {
    const validPass = username === 'amber' ? '8888' : '1234'; 
    if (pass === validPass) {
      const foundUser = MOCK_USERS.find(u => u.username === username.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
        setLoginError('');
        setActiveTab('calendar');
        return;
      }
    }
    setLoginError('用户名或密码错误');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('calendar');
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？这将清空您所有的修改并恢复到初始空状态。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // BOOKINGS
  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // MEMBERS
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  // SHIFTS
  const handleUpdateShifts = (updatedShifts: Shift[]) => {
      setShifts(updatedShifts);
  };

  // INVENTORY
  const handleUpdateInventory = (updatedProduct: Product) => {
    setInventory(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddProduct = (newProduct: Product) => {
    setInventory(prev => [...prev, newProduct]);
  };
  
  const handleDeleteProduct = (id: string) => {
    setInventory(prev => prev.filter(p => p.id !== id));
  };

  // SERVICES
  const handleAddService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // TRANSACTIONS
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Automatically deduct stock
    if (newTx.items && newTx.items.length > 0) {
      const productIdsToDeduct = newTx.items
        .filter(item => item.type === 'product' && item.productId)
        .map(item => item.productId);
        
      if (productIdsToDeduct.length > 0) {
        setInventory(prevInventory => {
          return prevInventory.map(product => {
            const countInTx = productIdsToDeduct.filter(id => id === product.id).length;
            if (countInTx > 0) {
              return {
                ...product,
                stock: Math.max(0, product.stock - countInTx)
              };
            }
            return product;
          });
        });
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <AppointmentCalendar bookings={bookings} members={members} services={services} onAddBooking={handleAddBooking} onDeleteBooking={handleDeleteBooking} />;
      case 'schedule':
        return <StaffSchedule shifts={shifts} onUpdateShifts={handleUpdateShifts} />;
      case 'pos':
        return <Cashier services={services} members={members} inventory={inventory} onAddTransaction={handleAddTransaction} onUpdateMember={handleUpdateMember} />;
      case 'members':
        return <MemberManagement members={members} onUpdateMember={handleUpdateMember} />;
      case 'services':
        return <ServiceManagement services={services} onAddService={handleAddService} onUpdateService={handleUpdateService} onDeleteService={handleDeleteService} />;
      case 'inventory':
        return <Inventory inventory={inventory} onUpdateProduct={handleUpdateInventory} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'dashboard':
        if (user?.role !== 'admin') return <div className="flex items-center justify-center h-full text-[#8C8174]">无权访问此页面</div>;
        return <Dashboard transactions={transactions} bookings={bookings} />;
      default:
        return <AppointmentCalendar bookings={bookings} members={members} services={services} onAddBooking={handleAddBooking} onDeleteBooking={handleDeleteBooking} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} currentUser={user} onLogout={handleLogout} onReset={handleResetData}>
      {renderContent()}
    </Layout>
  );
};

export default App;