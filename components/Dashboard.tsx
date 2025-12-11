import React from 'react';
import { STAFF_LIST } from '../constants';
import { Transaction, Booking } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, CreditCard, Award, Wallet } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  bookings: Booking[];
}

export const Dashboard: React.FC<Props> = ({ transactions, bookings }) => {
  // 1. Actual Revenue (Real Money In)
  const actualRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  
  // 2. Estimated Revenue (Projected from Bookings)
  // Filter out cancelled, but include completed/confirmed
  const estimatedRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.estimatedPrice, 0);

  const transactionCount = transactions.length;
  
  const staffStats: Record<string, {name: string, totalCommission: number, serviceCount: number, cardCount: number, productCount: number, avatar: string, totalSales: number}> = {};
  
  STAFF_LIST.forEach(s => {
      staffStats[s.id] = { 
          name: s.name.split(' ')[0], 
          totalCommission: 0, 
          serviceCount: 0, 
          cardCount: 0, 
          productCount: 0,
          avatar: s.avatar,
          totalSales: 0
      };
  });

  transactions.forEach(tx => {
    tx.items.forEach(item => {
        if (!item.staffId || !staffStats[item.staffId]) return;
        let rate = 0;
        if (item.type === 'service') { rate = 0.10; staffStats[item.staffId].serviceCount += 1; }
        if (item.type === 'product') { rate = 0.05; staffStats[item.staffId].productCount += 1; }
        if (item.type === 'card_topup') { rate = 0.08; staffStats[item.staffId].cardCount += 1; }
        const comm = item.price * rate;
        staffStats[item.staffId].totalCommission += comm;
        staffStats[item.staffId].totalSales += item.price;
    });
  });

  const chartData = STAFF_LIST.map(staff => ({
    name: staff.name.split(' ')[0], 
    commission: staffStats[staff.id]?.totalCommission || 0,
  }));

  const revenueByType = [
      { name: '服务', value: transactions.flatMap(t => t.items).filter(i => i.type === 'service').reduce((acc, i) => acc + i.price, 0) },
      { name: '产品', value: transactions.flatMap(t => t.items).filter(i => i.type === 'product').reduce((acc, i) => acc + i.price, 0) },
      { name: '充值', value: transactions.flatMap(t => t.items).filter(i => i.type === 'card_topup').reduce((acc, i) => acc + i.price, 0) },
  ];
  const COLORS = ['#C07765', '#8F9E8B', '#D4A373'];

  return (
    <div className="p-4 md:p-8 w-full space-y-6 md:space-y-8 animate-fade-in pb-24 md:pb-8">
      <div className="flex flex-col">
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#433A31]">营业报表</h2>
        <p className="text-[#8C8174] mt-1 font-serif italic text-sm md:text-base">12月实时营收分析</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {/* Revenue Comparison Card */}
        <div className="bg-[#FFFDF9] p-4 md:p-6 rounded-xl shadow-sm border border-[#E0D6C2] col-span-2 md:col-span-1 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-[#F2EFE9] text-[#8B7355]"><DollarSign size={20}/></div>
                <span className="text-xs text-[#8C8174] font-medium">营收概览</span>
            </div>
            <div className="flex justify-between items-end mt-2">
                <div>
                    <div className="text-xs text-[#8C8174] scale-90 origin-left">实际营收</div>
                    <div className="text-xl md:text-2xl font-bold text-[#433A31] font-mono">¥{actualRevenue.toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-[#8C8174] scale-90 origin-right">预约预估</div>
                    <div className="text-sm md:text-base font-bold text-[#D4A373] font-mono">¥{estimatedRevenue.toLocaleString()}</div>
                </div>
            </div>
        </div>

        {[
            { label: '交易笔数', val: transactionCount, icon: <TrendingUp size={20}/>, bg:'bg-[#D8DFD0]/40', text:'text-[#6B8E23]' },
            { label: '提成支出', val: `¥${Object.values(staffStats).reduce((a,b)=>a+b.totalCommission, 0).toLocaleString(undefined, {maximumFractionDigits:0})}`, icon: <Users size={20}/>, bg:'bg-[#E6D4D4]/40', text:'text-[#A05252]' },
            { label: '客单价', val: `¥${transactionCount > 0 ? (actualRevenue/transactionCount).toFixed(0) : 0}`, icon: <CreditCard size={20}/>, bg:'bg-[#F2E6D0]/40', text:'text-[#D4A373]' },
        ].map((kpi, i) => (
            <div key={i} className="bg-[#FFFDF9] p-4 md:p-6 rounded-xl shadow-sm border border-[#E0D6C2] flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5">
                <div className={`p-3 md:p-4 rounded-xl ${kpi.bg} ${kpi.text}`}>{kpi.icon}</div>
                <div>
                    <p className="text-xs text-[#8C8174] font-medium mb-1">{kpi.label}</p>
                    <p className="text-xl md:text-3xl font-bold text-[#433A31] font-mono">{kpi.val}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Staff Performance */}
      <div>
          <h3 className="text-lg font-bold text-[#433A31] mb-4 font-serif flex items-center gap-2">
              <Award className="text-[#8B7355]"/> 员工个人业绩
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {STAFF_LIST.map(staff => {
                  const stats = staffStats[staff.id];
                  return (
                      <div key={staff.id} className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E0D6C2] shadow-sm">
                          <div className="flex items-center gap-3 border-b border-[#E0D6C2]/50 pb-3 mb-3">
                              <img src={staff.avatar} className="w-10 h-10 rounded-full" alt={staff.name}/>
                              <div>
                                  <div className="font-bold text-[#433A31] text-sm">{stats.name}</div>
                                  <div className="text-[10px] text-[#8C8174]">销:¥{stats.totalSales.toLocaleString()}</div>
                              </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="bg-[#F7F5F0] rounded p-1.5"><div className="text-[#8C8174] scale-90">单量</div><div className="font-bold">{stats.serviceCount}</div></div>
                              <div className="bg-[#F7F5F0] rounded p-1.5"><div className="text-[#8C8174] scale-90">办卡</div><div className="font-bold">{stats.cardCount}</div></div>
                              <div className="bg-[#EBE5D9] rounded p-1.5"><div className="text-[#8C8174] scale-90">提成</div><div className="font-bold text-[#8B7355]">¥{stats.totalCommission.toFixed(0)}</div></div>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-[#FFFDF9] p-4 md:p-8 rounded-3xl shadow-sm border border-[#E0D6C2] h-[300px] md:h-[450px]">
              <h3 className="text-sm md:text-lg font-bold text-[#433A31] mb-4 font-serif">提成对比</h3>
              <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={chartData} margin={{top:0, right:0, left:-20, bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5D9"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8C8174', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill:'#8C8174', fontSize: 10}} />
                      <Tooltip cursor={{fill: '#F7F5F0'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#FFFDF9'}} />
                      <Bar dataKey="commission" fill="#8B7355" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
              </ResponsiveContainer>
          </div>

          <div className="bg-[#FFFDF9] p-4 md:p-8 rounded-3xl shadow-sm border border-[#E0D6C2] h-[300px] md:h-[450px]">
              <h3 className="text-sm md:text-lg font-bold text-[#433A31] mb-4 font-serif">营收分布</h3>
              <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                      <Pie data={revenueByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {revenueByType.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#FFFDF9'}} />
                  </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                  {revenueByType.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-[#5C4D3C]">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></div>{entry.name}
                      </div>
                  ))}
              </div>
          </div>
      </div>
      
       {/* Transaction History */}
       <div className="bg-[#FFFDF9] rounded-3xl border border-[#E0D6C2] overflow-hidden">
           <div className="p-6 border-b border-[#E0D6C2] bg-[#F7F5F0]">
               <h3 className="font-serif font-bold text-[#433A31]">最近交易记录</h3>
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm">
                   <thead className="bg-[#F7F5F0] text-[#8C8174] font-serif text-xs uppercase">
                       <tr>
                           <th className="p-4 text-left">时间</th>
                           <th className="p-4 text-left">顾客</th>
                           <th className="p-4 text-left">内容</th>
                           <th className="p-4 text-left">支付方式</th>
                           <th className="p-4 text-right">提成</th>
                           <th className="p-4 text-right">金额</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-[#E0D6C2]/50">
                       {transactions.slice(0, 10).map(tx => {
                           const comm = tx.items.reduce((acc, item) => {
                               let rate = 0;
                               if (item.type === 'service') rate = 0.10;
                               if (item.type === 'product') rate = 0.05;
                               if (item.type === 'card_topup') rate = 0.08;
                               return acc + (item.price * rate);
                           }, 0);
                           return (
                               <tr key={tx.id} className="hover:bg-[#F2EFE9] transition-colors">
                                   <td className="p-4 font-mono text-[#8C8174] text-xs">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                   <td className="p-4 font-bold text-[#433A31]">{tx.customerName || '散客'}</td>
                                   <td className="p-4 max-w-[200px] truncate text-[#5C4D3C]">{tx.items.map(i => i.name).join(', ')}</td>
                                   <td className="p-4 text-[#8C8174] text-xs">{tx.paymentMethod}</td>
                                   <td className="p-4 text-right font-mono text-[#8C8174] text-xs">¥{comm.toFixed(0)}</td>
                                   <td className="p-4 text-right font-mono font-bold text-[#8B7355]">¥{tx.totalAmount}</td>
                               </tr>
                           )
                       })}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};