
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { personnelService } from '../src/services/personnelService';
import { requisitionService } from '../src/services/requisitionService';
import { materialService } from '../src/services/materialService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [personnelCount, setPersonnelCount] = useState<number | null>(null);
  const [pendingRequisitions, setPendingRequisitions] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [outOfStockCount, setOutOfStockCount] = useState<number | null>(null);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          personnelRes, 
          materialStockSummary,
          barDataRes,
          pieDataRes,
          recentActivityRes,
          countFilteredByStatus,
        ] = await Promise.all([
          personnelService.getPersonnelCount(),
          materialService.getMaterialStockSummary(),
          requisitionService.getRequisitionVolume(Array.from({length: 6}, (_, i) => -i)), // last 6 months
          materialService.getInventoryDistribution(),
          requisitionService.getRecentRequisitions(),
          requisitionService.getCountFilteredByStatus('0'), // -1 rejected, 0 pending, 1 approved
        ]);

        setPersonnelCount(personnelRes.data.count);
        setPendingRequisitions(countFilteredByStatus.data.count);
        setLowStockCount(materialStockSummary.low_stock_count);
        setOutOfStockCount(materialStockSummary.out_of_stock_count);
        setBarData(barDataRes.data);
        setPieData(pieDataRes); // pending real API
        setRecentActivity(recentActivityRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Handle error state in UI if needed
      }
    };

    fetchData();
  }, []);

  const stats = [
    { 
      label: 'Total Personnel', 
      value: personnelCount !== null ? personnelCount.toString() : '...', 
      change: '+2.4%', 
      trend: 'up', 
      icon: <Users className="text-primary" />,
      subtext: 'Active employees this month'
    },
    { 
      label: 'Pending Req.', 
      value: pendingRequisitions !== null ? pendingRequisitions.toString() : '...', 
      change: '+5.1%', 
      trend: 'up', 
      icon: <FileCheck className="text-orange-500" />,
      subtext: 'Awaiting manager approval'
    },
    { 
      label: 'Low Stock', 
      value: lowStockCount !== null ? lowStockCount.toString() : '...',
      change: '-1.2%', 
      trend: 'down', 
      icon: <AlertTriangle className="text-orange-500" />,
      subtext: 'Items below minimum threshold'
    },
    { 
      label: 'Out of Stock', 
      value: outOfStockCount !== null ? outOfStockCount.toString() : '...', 
      status: 'FIX', 
      icon: <AlertTriangle className="text-red-500" />,
      subtext: 'Items with zero quantity'
    },
  ];


  const totalPieValue = pieData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col justify-between rounded-xl p-5 bg-dark-surface border border-dark-border hover:border-slate-600 transition-all shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                {stat.icon}
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.change}
                </div>
              )}
              {stat.status && (
                <div className="bg-slate-700/50 px-2 py-0.5 rounded text-dark-muted text-xs font-medium">
                  {stat.status}
                </div>
              )}
            </div>
            <div>
              <p className="text-dark-muted text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-white text-3xl font-bold tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 text-xs mt-2">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-dark-surface p-6 border border-dark-border shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">Requisition Volume</h3>
              <p className="text-dark-muted text-xs mt-1">Monthly requests over last 6 months</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-dark-border text-xs font-medium text-dark-muted hover:text-white hover:bg-slate-700 transition-colors">This Year</button>
              <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Last 6M</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-dark-surface p-6 border border-dark-border flex flex-col shadow-sm">
          <div className="mb-2">
            <h3 className="text-white text-lg font-bold leading-tight">Inventory Distribution</h3>
            <p className="text-dark-muted text-xs mt-1">Breakdown by category</p>
          </div>
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`${totalPieValue > 99999 ? 'text-3x2' : 'text-3xl'} font-bold text-white`}>{totalPieValue}</span>
              <span className="text-xs text-dark-muted uppercase tracking-widest mt-1">Items</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">{item.name}</span>
                  <span className="text-[10px] text-dark-muted">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-bold leading-tight tracking-tight">Recent Activity</h3>
          <Link to="/requisitions" className="text-sm text-primary font-medium hover:text-primary-dark transition-colors flex items-center gap-1 group">
            View All 
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-dark-border">
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-dark-muted">Req ID</th>
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-dark-muted">Requester</th>
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-dark-muted">Item</th>
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-dark-muted">Date</th>
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-dark-muted text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-dark-border">
                {recentActivity.map((req, idx) => (
                  <tr key={idx} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 text-primary font-mono font-medium text-nowrap">{req.id}</td>
                    <td className="py-4 px-6 text-white">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} className="size-8 rounded-full" alt={req.user} />
                        <span className="font-medium">{req.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-dark-muted">{req.item}</td>
                    <td className="py-4 px-6 text-dark-muted">{req.date}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                        req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        req.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          req.status === 'Approved' ? 'bg-emerald-400' : 
                          req.status === 'Pending' ? 'bg-orange-400' : 
                          'bg-red-400'
                        }`}></span> {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
