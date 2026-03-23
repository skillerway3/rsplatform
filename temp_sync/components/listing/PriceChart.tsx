'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/Badge';

const PRICE_DATA = [
  { date: 'Mar 12', price: 235 },
  { date: 'Mar 13', price: 242 },
  { date: 'Mar 14', price: 238 },
  { date: 'Mar 15', price: 245 },
  { date: 'Mar 16', price: 250 },
  { date: 'Mar 17', price: 242 },
  { date: 'Mar 18', price: 240 },
];

export function PriceChart() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">Market Value Trend</h2>
        <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest">+2.4% vs Last Week</Badge>
      </div>
      <div className="h-64 w-full bg-zinc-900/20 p-8 rounded-[2.5rem] border border-zinc-900/50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PRICE_DATA}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#3f3f46" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#52525b', fontWeight: 900 }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09090b', 
                border: '1px solid #27272a', 
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
