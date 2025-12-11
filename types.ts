
export enum StaffRole {
  StoreManager = '店长',
  SeniorTech = '资深美甲美睫师',
  JuniorTech = '初级美甲师',
  Metaphysics = '玄学顾问'
}

export enum ServiceType {
  Nails = '美甲',
  Lashes = '美睫',
  HandCare = '手护',
  Tea = '茶饮',
  Consultation = '咨询'
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  titles: string[];
  color: string;
  avatar: string;
}

export interface User {
  username: string;
  name: string;
  role: 'admin' | 'staff'; // admin can see dashboard, staff cannot
  staffId: string; // Links to the Staff interface for avatar/color
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  type: ServiceType;
  commissionRate: number; // 0.10 for services
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  image: string;
  category: '水晶' | '手护耗材' | '其他';
  commissionRate: number; // 0.05 for goods
}

export interface MemberTier {
  id: string;
  name: string;
  discount: number; // e.g. 0.88 for 88%
  color: string;
  minSpend: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  balance: number;
  tierId: string;
  joinDate: Date;
  notes: string; // General preferences
  nailArchive: string; // Technical notes for nails
  lashArchive: string; // Technical notes for lashes
  customDiscount?: number; // Optional manual override for discount (e.g., 0.5 for 50% off)
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  memberId?: string; // Link to member if exists
  staffId: string;
  serviceId: string;
  customServiceName?: string; // For manually entered services
  date: Date;
  durationMin: number;
  estimatedPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export enum ShiftType {
  Early = '早班 (10:00 - 20:00)',
  Late = '晚班 (11:00 - 21:00)',
  Off = '休息'
}

export interface Shift {
  id: string;
  staffId: string;
  date: Date;
  type: ShiftType;
}

export enum PaymentMethod {
  WeChat = '微信支付',
  Alipay = '支付宝',
  Dianping = '大众点评核销',
  Meituan = '美团核销',
  MemberCard = '会员卡扣款'
}

export interface Transaction {
  id: string;
  date: Date;
  customerName: string; 
  memberId?: string; // Link to member
  items: {
    name: string;
    type: 'service' | 'product' | 'card_topup';
    price: number;
    staffId?: string; // Who gets commission
    productId?: string; // For inventory deduction
  }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed';
}
