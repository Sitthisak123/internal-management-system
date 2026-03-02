import React, { useState, useEffect } from 'react';
import { personnelService } from '../src/services/personnelService';
import { materialService } from '../src/services/materialService';
import { requisitionService } from '../src/services/requisitionService';
import { authService } from '../src/services/authService';
import { Personnel, Material } from '../types';
import { ShoppingCart, Trash2, PlusCircle, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const CreateRequisition: React.FC = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const [items, setItems] = useState<{ material_id: number | null, quantity: number }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personnelRes = await personnelService.getPersonnel();
        setPersonnel(personnelRes.data);

        const materialsRes = await materialService.getMaterials();
        setMaterials(materialsRes.data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { material_id: null, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: 'material_id' | 'quantity', value: any) => {
    const newItems = [...items];
    if(field === 'material_id') {
      newItems[index][field] = value ? parseInt(value, 10) : null;
    } else {
       newItems[index][field] = parseInt(value, 10);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const user = authService.getCurrentUser();
    if (!user || !ownerId) {
      setError("User must be logged in and an owner must be selected.");
      setLoading(false);
      return;
    }
    
    if (items.some(item => !item.material_id || item.quantity <= 0)) {
      setError("All material items must be selected and have a quantity greater than 0.");
      setLoading(false);
      return;
    }

    const requisitionData = {
      subject,
      description,
      purpose,
      form_date: date,
      owner_id: ownerId,
      // The creator_id will be set on the backend from the JWT
      items: items.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
      })),
    };

    try {
      await requisitionService.createRequisition(requisitionData);
      navigate('/requisitions');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col gap-6">
        <Breadcrumb />
        <h2 className="text-3xl font-bold text-white tracking-tight">Create Material Requisition</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
         {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )}
        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. Q3 Maintenance Materials"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                rows={3}
                placeholder="Provide details about the requisition (optional)"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Purpose</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                rows={3}
                placeholder="Explain the purpose of this requisition (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Date Required</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Owner</label>
              <select
                value={ownerId ?? ''}
                onChange={(e) => setOwnerId(parseInt(e.target.value, 10))}
                required
                className="w-full bg-dark-bg border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary"
              >
                <option value="">Select an owner</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullname}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface rounded-xl border border-dark-border shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold text-white p-4 flex items-center gap-2">
            <ShoppingCart size={20} /> Material Details
          </h3>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[50%]">Item Name</th>
                  <th className="pb-3 text-xs font-semibold text-dark-muted uppercase tracking-wider w-[20%]">Qty</th>
                  <th className="pb-3 w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <select 
                        value={item.material_id ?? ''} 
                        onChange={(e) => updateItem(index, 'material_id', e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                      >
                         <option value="">Select a material</option>
                         {materials.map(m => (
                           <option key={m.id} value={m.id}>{m.title}</option>
                         ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                       />
                    </td>
                    <td className="py-3 text-center">
                      <button type="button" onClick={() => removeItem(index)} className="text-dark-muted hover:text-red-400 p-1.5 rounded-md"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button type="button" onClick={addItem} className="w-full mt-4 py-3 rounded-lg border border-dashed border-slate-700 text-dark-muted hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2 transition-all">
              <PlusCircle size={18} />
              <span className="text-sm font-medium">Add New Item</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/requisitions')} className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
            {loading ? <><Loader size={18} className="animate-spin" /><span>Submitting...</span></> : <><span>Submit Requisition</span></> }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequisition;