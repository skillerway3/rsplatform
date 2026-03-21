'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const REVENUE_DATA = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1200 },
];

export function DashboardRevenueChart() {
  return (
    <Card className="premium-card lg:col-span-2 p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Revenue</h3>
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Weekly Performance Overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="gold" className="text-[8px] font-black uppercase tracking-widest">Live Feed</Badge>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#3f3f46" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#52525b', fontWeight: 900 }}
            />
            <YAxis 
              stroke="#3f3f46" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: '#52525b', fontWeight: 900 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09090b', 
                border: '1px solid #27272a',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
