import React, { useState, useEffect } from 'react';
import { requisitionService, Requisition } from '../src/services/requisitionService';
import { Search, Filter, Plus, Edit2, Eye, ChevronRight, FileCheck, Loader, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const Requisitions: React.FC = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequisitions = async () => {
      setLoading(true);
      try {
        const response = await requisitionService.getRequisitions();
        setRequisitions(response.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to fetch requisitions');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1:
        return { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case -1:
        return { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 0:
      default:
        return { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center bg-primary/20 rounded-lg text-primary ring-1 ring-primary/20">
            <FileCheck size={24} />
          </div>
          <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">Material Requisition Forms</h2>
        </div>
        <Link to="/requisitions/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-semibold">
          <Plus size={20} />
          <span>New Requisition</span>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            className="w-full bg-slate-900 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 h-10 placeholder:text-dark-muted transition-all" 
            placeholder="Search by Ref No, Subject, or Requester" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 h-10 bg-slate-900 border border-dark-border rounded-lg text-sm text-dark-muted hover:text-white transition-colors">
          <Filter size={18} />
          <span>Filter Status</span>
        </button>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>
          ) : error ? (
            <div className="text-red-500 p-6">Error: {error}</div>
          ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-dark-border">
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider w-32">Ref No</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider max-w-xs">Subject</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Requester</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Authorizer</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-center text-dark-muted text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-dark-muted text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {requisitions.map((req) => {
                const status = getStatusInfo(req.status);
                return (
                <tr key={req.id} className="hover:bg-white/5 transition-colors group text-nowrap">
                  <td className="px-6 py-4 text-white text-sm font-medium tracking-wide font-mono">{req.ref_no}</td>
                  <td className="px-6 py-4 text-white text-sm font-medium truncate max-w-xs">{req.subject}</td>
                  <td className="px-6 py-4 text-dark-muted text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-dark-muted text-sm">
                    <div className="flex flex-col">   
                      <span className="text-white">{req.owner.fullname}</span>
                      <span className="text-xs opacity-70">{req.owner.position}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-dark-muted text-sm ${req.authorizer?.fullname ? '' : 'text-red-400 text-opacity-60'}`}>
                    {req.authorizer?.fullname || '<Unassigned>'}
                    </td>
                  <td className="px-6 py-4 text-dark-muted text-sm">{req.mr_form_materials?.length || 0} items</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link to={`/requisitions/view/${req.id}`} className="text-dark-muted hover:text-blue-400 p-1.5 rounded-md"><Eye size={16} /></Link>
                      <Link to={`/requisitions/slip/${req.id}`} className="text-dark-muted hover:text-emerald-400 p-1.5 rounded-md"><Printer size={16} /></Link>
                      <Link to={`/requisitions/edit/${req.id}`} className="text-dark-muted hover:text-white p-1.5 rounded-md"><Edit2 size={16} /></Link>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </div>
        <div className="border-t border-dark-border px-6 py-4 flex items-center justify-between bg-dark-bg/30">
          <p className="text-sm text-dark-muted">Showing <span className="text-white font-medium">1-{requisitions.length}</span> of <span className="text-white font-medium">{requisitions.length}</span> results</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white disabled:opacity-50 transition-colors" disabled>
              <ChevronRight className="rotate-180" size={16} />
            </button>
            <button className="px-3 py-1.5 rounded bg-primary text-white text-sm font-bold">1</button>
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requisitions;
