import React, { useState, useEffect } from 'react';
import { authService } from '../src/services/authService';
import { userService, User as UserType } from '../src/services/userService';
import { workplaceService, Workplace } from '../src/services/workplaceService';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/userSlice';
import { 
  User as UserIcon, // Renamed to avoid collision
  Mail, 
  MapPin,
  Shield, 
  Camera, 
  Save, 
  Key, 
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [workplaceId, setWorkplaceId] = useState<number | ''>('');
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workplacesLoading, setWorkplacesLoading] = useState(true);
  const [workplacesError, setWorkplacesError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState({ displayName: '', position: '', workplaceId: '' as number | '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Use authService to get the currently logged-in user's full details
        const data = await authService.getProfile();

        const displayName = (data as any).display_name ?? data.title ?? '';
        const currentPosition = data.position || '';
        const currentWorkplaceId = (data as any).workplace_id ?? '';

        setProfile(data);
        setUsername(data.username || '');
        setTitle(displayName);
        setFullname(data.fullname || '');
        setPosition(currentPosition);
        setWorkplaceId(currentWorkplaceId);
        setInitialValues({ displayName, position: currentPosition, workplaceId: currentWorkplaceId });
        dispatch(setUser(data as any));
      } catch (err: any) {
        setError("Failed to load profile data.");
        console.error(err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchWorkplaces = async () => {
      setWorkplacesLoading(true);
      try {
        const response = await workplaceService.getWorkplaces();
        if (!mounted) return;
        setWorkplaces(response.data || []);
        setWorkplacesError(null);
      } catch (err: any) {
        if (!mounted) return;
        setWorkplaces([]);
        setWorkplacesError(err.response?.data?.message || err.message || 'Failed to load workplaces');
      } finally {
        if (mounted) setWorkplacesLoading(false);
      }
    };

    fetchWorkplaces();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const trimmedDisplayName = title.trim();
    const trimmedPosition = position.trim();
    const normalizedWorkplaceId = workplaceId === '' ? null : workplaceId;
    const hasChanges = (
      trimmedDisplayName !== initialValues.displayName
      || trimmedPosition !== initialValues.position
      || normalizedWorkplaceId !== (initialValues.workplaceId === '' ? null : initialValues.workplaceId)
    );

    if (!hasChanges) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Send all editable fields to the backend
      const payload: Partial<UserType> & { title?: string } = {
        display_name: trimmedDisplayName,
        // Keep `title` for backward compatibility with older backend payloads.
        title: trimmedDisplayName,
        position: trimmedPosition,
        workplace_id: normalizedWorkplaceId,
      };
      const response = await userService.updateUser(profile.id, payload);

      const updatedDisplayName = (response.data as any).display_name ?? (response.data as any).title ?? trimmedDisplayName;
      const updatedPosition = response.data.position ?? trimmedPosition;
      const updatedWorkplaceId = (response.data as any).workplace_id ?? normalizedWorkplaceId ?? '';

      setProfile(response.data);
      setTitle(updatedDisplayName);
      setPosition(updatedPosition);
      setWorkplaceId(updatedWorkplaceId);
      setInitialValues({ displayName: updatedDisplayName, position: updatedPosition, workplaceId: updatedWorkplaceId });
      dispatch(setUser(response.data as any));
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
    setUpdating(false);
  };

  const hasChanges = (
    title.trim() !== initialValues.displayName
    || position.trim() !== initialValues.position
    || (workplaceId === '' ? null : workplaceId) !== (initialValues.workplaceId === '' ? null : initialValues.workplaceId)
  );

  const getStatusInfo = (status: number | undefined) => {
    switch (status) {
      case 1: return { text: 'Active', className: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' };
      case 0: return { text: 'Inactive', className: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' };
      case -1: return { text: 'Suspended', className: 'bg-red-500/10 text-red-400 ring-red-500/20' };
      default: return { text: 'Unknown', className: 'bg-gray-500/10 text-gray-400 ring-gray-500/20' };
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>;
  }

  if (error && !profile) {
    return <div className="flex justify-center items-center h-64 text-red-500"><AlertCircle size={40} /> <span className="ml-4">{error}</span></div>;
  }

  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-dark-muted">
          <Link to="/" className="font-medium hover:text-primary cursor-pointer transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white font-medium">My Profile</span>
        </div>
        <h2 className="text-white text-3xl font-bold tracking-tight">User Profile</h2>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-xl">
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-dark-border bg-dark-bg/20">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <div 
                  className="h-24 w-24 rounded-full bg-cover bg-center border-4 border-dark-bg shadow-md" 
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${profile?.id}/200/200')` }}
                ></div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white text-xl font-bold">{profile?.fullname || profile?.username}</h3>
                <p className="text-dark-muted text-sm">{profile?.position} • {profile?.display_name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusInfo(profile?.status).className}`}>
                    {getStatusInfo(profile?.status).text}
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-dark-border text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
              <Camera size={18} />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 flex flex-col gap-10">
           {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <CheckCircle size={20} /><span>{success}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              <section>
                <h4 className="text-white text-lg font-medium border-b border-dark-border/50 pb-2 mb-6">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Username</label>
                    <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-dark-muted cursor-not-allowed"
                      readOnly value={username} onChange={e => setUsername(e.target.value)} />
                  </div>
                    {/* <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" 
                      readOnly value={username} onChange={e => setUsername(e.target.value)} />
                  </div> */}

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Display name</label>
                     <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" 
                      value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. John Doe" />
                  </div>

                  {/* Full Name */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                      <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-dark-muted cursor-not-allowed"
                        readOnly value={fullname} onChange={e => setFullname(e.target.value)} />
                    </div>
                      {/* <input className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary outline-none transition-all" 
                        readOnly value={fullname} onChange={e => setFullname(e.target.value)} />
                    </div> */}
                  </div>

                  {/* Position */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Job Position</label>
                    <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all"
                      value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Warehouse Manager" />
                  </div>
                    {/* <input className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary outline-none transition-all" 
                      readOnly value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Warehouse Manager" />
                  </div> */}

                  {/* Workplace */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Workplace</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                      <select
                        value={workplaceId}
                        onChange={(e) => setWorkplaceId(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">{workplacesLoading ? 'Loading workplaces...' : 'Select workplace (optional)'}</option>
                        {workplaces.map((workplace) => (
                          <option key={workplace.id} value={workplace.id}>
                            {[workplace.building, workplace.room].filter(Boolean).join(' / ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    {workplacesError && (
                      <p className="text-xs text-amber-400">{workplacesError}</p>
                    )}
                  </div>

                  {/* Email (Read Only) */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                      <input className="w-full bg-dark-surface/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-dark-muted cursor-not-allowed" 
                        type="email" readOnly value={profile?.email || ''} />
                    </div>
                    <p className="text-xs text-dark-muted">Contact admin to change email address.</p>
                  </div>

                </div>
              </section>
            </div>

            {/* Sidebar / Security */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-dark-bg/30 rounded-xl p-5 border border-dark-border">
                <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  Security
                </h5>
                <button type="button" className="w-full flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg text-sm text-slate-300 group transition-colors">
                  <span className="flex items-center gap-2"><Key size={16} /> Change Password</span>
                  <ChevronRight size={14} className="text-dark-muted group-hover:text-white" />
                </button>
                <div className="w-full flex items-center justify-between p-2 mt-2 rounded-lg text-sm text-slate-300">
                  <span className="flex items-center gap-2"><Smartphone size={16} /> 2FA Status</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">ENABLED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-dark-border/30">
            <Link to="/" className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-dark-border text-white font-medium hover:bg-slate-800 transition-colors text-center">
              Cancel
            </Link>
            <button type="submit" disabled={updating || !hasChanges} title={!hasChanges ? "No changes made" : "Save changes"} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {updating ? <><Loader size={18} className="animate-spin" /><span>Saving...</span></> : <><Save size={18} /><span>Save Changes</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
