import React, { useState, useEffect } from 'react';
import { materialService, Material as MaterialType } from '../src/services/materialService';
import { 
  Search, 
  Plus, 
  Edit2, 
  ChevronRight, 
  Box,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await materialService.getMaterials();
        setMaterials(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch materials');
      }
      setLoading(false);
    };

    fetchMaterials();
  }, []);

  const getStatusInfo = (quantity: number, minimumThreshold: number = 20) => {
    if (quantity === 0) return { text: 'Out of Stock', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (quantity <= minimumThreshold) return { text: 'Low Stock', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { text: 'In Stock', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  const totalSKUs = materials.length;
  const lowStockCount = materials.filter(m => m.quantity > 0 && m.quantity <= (m.minimum_threshold || 20)).length;
  const outOfStock = materials.filter(m => m.quantity === 0).length;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <Breadcrumb />
        <Link to="/materials/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-medium whitespace-nowrap">
          <Plus size={20} />
          <span>Material</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Material Directory</h2>
        <p className="text-dark-muted text-sm max-w-2xl">Manage your inventory items, stock levels, and procurement needs efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Box className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Total SKUs</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : totalSKUs}</p>
          </div>
        </div>
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Box className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Low Stock</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : lowStockCount}</p>
          </div>
        </div>
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Box className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-dark-muted">Out of Stock</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : outOfStock}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface p-4 rounded-xl shadow-sm border border-dark-border flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-dark-surface/95">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            className="w-full bg-slate-900/50 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-2.5 placeholder:text-dark-muted transition-all" 
            placeholder="Search by name, SKU, or category..." 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-dark-border rounded-lg hover:border-primary/50 transition-all text-sm font-medium text-slate-300">
            <span>Category</span>
            <ChevronRight size={14} className="rotate-90" />
          </button>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Error: {error}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-dark-border">
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider w-16">#</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Material</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider text-right">Quantity</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Unit</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-dark-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6 text-sm text-dark-muted font-mono">{material.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-dark-muted">
                          <Box size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-white">{material.title}</div>
                          <div className="text-xs text-dark-muted">SKU-{material.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {material.material_type?.title || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-sm text-slate-300 font-medium">{material.quantity}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-white">{material.unit}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusInfo(material.quantity, material.minimum_threshold).className}`}>
                        {getStatusInfo(material.quantity, material.minimum_threshold).text}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link to={`/materials/edit/${material.id}`} className="p-1.5 text-dark-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"><Edit2 size={18} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-dark-surface px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-sm text-dark-muted">Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{materials.length}</span> of <span className="font-medium text-white">{materials.length}</span> results</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm font-medium text-dark-muted hover:bg-slate-800 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materials;
