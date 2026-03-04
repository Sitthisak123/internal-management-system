import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Mail, 
  BadgeCheck, 
  Save, 
  AlertCircle,
  Loader,
  Archive,
  Camera,
  Shield,
  KeyRound
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../src/services/userService';
import Breadcrumb from '../components/Breadcrumb';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Form state
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<number>(0);
  const [status, setStatus] = useState<number>(0);

  // Original values for change detection
  const [originalFullname, setOriginalFullname] = useState('');
  const [originalPosition, setOriginalPosition] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [originalRole, setOriginalRole] = useState<number>(0);
  const [originalStatus, setOriginalStatus] = useState<number>(0);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if form has changed
  const hasChanges = useMemo(() => {
    return (
      fullname !== originalFullname ||
      position !== originalPosition ||
      email !== originalEmail ||
      username !== originalUsername ||
      displayName !== originalDisplayName ||
      role !== originalRole ||
      status !== originalStatus ||
      password !== ''
    );
  }, [fullname, originalFullname, position, originalPosition, email, originalEmail, username, originalUsername, displayName, originalDisplayName, role, originalRole, status, originalStatus, password]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await userService.getUserById(id);
        const data = response.data;
        if (data) {
          setFullname(data.fullname);
          setPosition(data.position);
          setEmail(data.email || '');
          setUsername(data.username || '');
          setDisplayName(data.display_name || '');
          setRole(data.role);
          setStatus(data.status);

          // Store original values
          setOriginalFullname(data.fullname);
          setOriginalPosition(data.position);
          setOriginalEmail(data.email || '');
          setOriginalUsername(data.username || '');
          setOriginalDisplayName(data.display_name || '');
          setOriginalRole(data.role);
          setOriginalStatus(data.status);

        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data.');
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);

  const toggleSuspendModal = () => {
    setIsSuspendModalOpen(!isSuspendModalOpen);
  };

  const handleSuspend = async () => {
    if (!id) return;

    setIsSuspending(true);
    setError(null);

    try {
      await userService.updateUser(id, { status: -1 });
      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user.');
      setIsSuspending(false);
      toggleSuspendModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hasChanges) return;

    setIsSubmitting(true);
    setError(null);

    const userData: any = {
      fullname,
      position,
      email,
      username,
      display_name: displayName,
      role,
      status,
    };

    if (password) {
      userData.password = password;
    }

    try {
      await userService.updateUser(id, userData);
      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
    }
    setIsSubmitting(false);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-4 flex flex-col items-center gap-3">
          <AlertCircle size={40} />
          <h3 className="text-xl font-bold">Error</h3>
          <span>{error}</span>
          <button 
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Edit User</h1>
          <p className="text-dark-muted text-base max-w-3xl">Update the user's information and credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <User size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name <span className="text-primary">*</span></label>
                <input 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. Sarah Connor" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Display Name</label>
                <input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. Sarah" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-dark-border rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    type="email" 
                    placeholder="sarah@company.com" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <BadgeCheck size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Role & Responsibilities</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Position Title <span className="text-primary">*</span></label>
                <input 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. Senior Frontend Engineer" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role <span className="text-primary">*</span></label>
                <select 
                  value={role}
                  onChange={(e) => setRole(parseInt(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value={1}>Superadmin</option>
                  <option value={0}>Admin/User</option>
                  <option value={-1}>Personnel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status <span className="text-primary">*</span></label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                  <option value={-1}>Suspended</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <KeyRound size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Credentials</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="e.g. sarah"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-950/50 p-6 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-dark-border">
          <div>
            <button
              type="button"
              onClick={toggleSuspendModal}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 transition-all rounded-lg"
            >
              Suspend/On leave
            </button>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/users')}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-dark-muted hover:text-white transition-all rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !hasChanges}
              title={!hasChanges ? "No changes made" : "Save changes"}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : <><Save size={18} /><span>Save Changes</span></>}
            </button>
          </div>
        </div>
      </form>

      {isSuspendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-in fade-in">
          <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-2xl p-8 max-w-md w-full m-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-full border-4 border-red-500/20 mb-4">
                <Archive size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Confirm Suspension</h2>
              <p className="text-dark-muted mt-2">
                Are you sure you want to suspend this user? They will not be able to log in.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={toggleSuspendModal}
                disabled={isSuspending}
                className="px-6 py-3 text-sm font-medium text-dark-muted hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={isSuspending}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSuspending ? 'Suspending...' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;
