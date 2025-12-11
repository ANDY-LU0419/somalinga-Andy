import { Staff, StaffRole, Service, ServiceType, Booking, Shift, ShiftType, Product, Member, Transaction, PaymentMethod, MemberTier } from './types';

// --- Static Configuration Data (System Defaults) ---

export const STAFF_LIST: Staff[] = [
  { id: 's1', name: '露露 (Lulu)', role: StaffRole.StoreManager, titles: ['店长', '资深美甲师', '美睫师'], color: 'bg-[#E8DCC4] text-[#5C4D3C] border-[#D6C6A8]', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lulu&backgroundColor=E8DCC4' },
  { id: 's2', name: '芊芊 (Qianqian)', role: StaffRole.SeniorTech, titles: ['高级美甲师', '美睫师'], color: 'bg-[#D8DFD0] text-[#4A5D43] border-[#C2CDB6]', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Qianqian&backgroundColor=D8DFD0' },
  { id: 's3', name: '果果 (Guoguo)', role: StaffRole.JuniorTech, titles: ['初级美甲师'], color: 'bg-[#E6D4D4] text-[#7A4E4E] border-[#D4BCBC]', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guoguo&backgroundColor=E6D4D4' },
  { id: 's4', name: 'Amber', role: StaffRole.Metaphysics, titles: ['店长', '玄学顾问'], color: 'bg-[#F2E6D0] text-[#8C6B38] border-[#E0CFB0]', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amber&backgroundColor=F2E6D0' },
];

export const SERVICES: Service[] = [
  { id: 'srv1', name: '极致单色美甲', price: 398, durationMin: 75, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv2', name: '日式极简法式', price: 468, durationMin: 90, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv3', name: '日式手绘艺术', price: 688, durationMin: 120, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv4', name: '极光魔镜粉', price: 428, durationMin: 80, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv5', name: '日式晕染/琥珀', price: 528, durationMin: 100, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv6', name: '本甲建构加固', price: 328, durationMin: 60, type: ServiceType.Nails, commissionRate: 0.1 },
  { id: 'srv7', name: '海蓝之谜奢华手护', price: 798, durationMin: 60, type: ServiceType.HandCare, commissionRate: 0.1 },
  { id: 'srv8', name: '鱼子酱抗衰手护', price: 588, durationMin: 50, type: ServiceType.HandCare, commissionRate: 0.1 },
  { id: 'srv9', name: '日式空气感美睫', price: 588, durationMin: 90, type: ServiceType.Lashes, commissionRate: 0.1 },
  { id: 'srv10', name: '特调养生茶饮', price: 68, durationMin: 30, type: ServiceType.Tea, commissionRate: 0.1 },
  { id: 'srv11', name: '塔罗牌占卜', price: 500, durationMin: 60, type: ServiceType.Consultation, commissionRate: 0.1 },
  { id: 'srv12', name: '紫微斗数咨询', price: 888, durationMin: 120, type: ServiceType.Consultation, commissionRate: 0.1 },
];

export const MEMBER_TIERS: MemberTier[] = [
  { id: 'tier_silver', name: '银卡会员 (95折)', discount: 0.95, color: 'bg-gray-100 text-gray-800 border-gray-300', minSpend: 0 },
  { id: 'tier_gold', name: '金卡会员 (88折)', discount: 0.88, color: 'bg-yellow-50 text-yellow-800 border-yellow-200', minSpend: 5000 },
  { id: 'tier_platinum', name: '白金会员 (8折)', discount: 0.80, color: 'bg-blue-50 text-blue-800 border-blue-200', minSpend: 20000 },
  { id: 'tier_black', name: '黑金会员 (7折)', discount: 0.70, color: 'bg-gray-900 text-white border-gray-700', minSpend: 50000 },
];

// --- Empty Data for Production Start (System Reset) ---

// 1. Members
export const MOCK_MEMBERS: Member[] = [];

// 2. Bookings
export const MOCK_BOOKINGS: Booking[] = [];

// 3. Shifts
export const MOCK_SHIFTS: Shift[] = [];

// 4. Inventory
export const MOCK_INVENTORY: Product[] = [];

// 5. Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [];