import * as React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Activity {
  id: string;
  createdAt: string;
  type?: 'sale' | 'purchase' | 'listing' | 'request';
  amount?: number;
  title?: string;
}

interface DashboardRecentActivityProps {
  activities: Activity[];
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  return (
    <Card className="premium-card p-10 space-y-10">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Recent Activity</h3>
        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Latest Account Events</p>
      </div>

      <div className="space-y-6">
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 shrink-0 group-hover:border-amber-500/30 transition-colors">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">
                    {activity.type === 'sale' ? 'Item Sold' : activity.type === 'purchase' ? 'Item Purchased' : 'Order Processed'}
                  </span>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{formatDate(activity.createdAt)}</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
                  {activity.title || `Transaction #${activity.id?.slice(0, 8) || '...'}`}
                  {activity.amount && ` • ${formatCurrency(activity.amount)}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-white/5">
              <Zap className="w-5 h-5 text-zinc-800" />
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No recent activity</p>
          </div>
        )}
      </div>

      <Button variant="ghost" className="w-full rounded-xl border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100">
        View All Activity
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}
