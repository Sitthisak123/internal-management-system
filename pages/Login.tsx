
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../src/services/authService';
import { Grid, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
      onLoginSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-dark-bg">
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#020617] z-0"></div>
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-8 max-w-lg">
          <div className="h-14 w-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <Grid className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              Seamless <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">Resource Control</span>
            </h1>
            <p className="text-dark-muted text-lg leading-relaxed font-light">
              Efficiently manage personnel, track material requisitions, and streamline your internal operations from a single, secure portal.
            </p>
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-dark-surface/40 border border-slate-700/50 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-slate-700/50 animate-pulse"></div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                <div className="h-2 w-20 bg-slate-700/50 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-700/30 rounded mb-2"></div>
            <div className="h-2 w-3/4 bg-slate-700/30 rounded"></div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="w-full max-w-[420px] flex flex-col gap-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col gap-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex lg:hidden items-center justify-center mb-4 self-start shadow-md shadow-primary/20">
              <Grid className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-dark-muted text-base font-normal">
              Enter your credentials to access your account.
            </p>
          </div>
          
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-medium leading-normal ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input 
                  className="flex w-full rounded-xl border-dark-border bg-dark-surface text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-4 text-base placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600" 
                  placeholder="e.g. user@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none flex items-center">
                  <User size={20} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-medium leading-normal ml-1">
                Password
              </label>
              <div className="relative group">
                <input 
                  className="flex w-full rounded-xl border-dark-border bg-dark-surface text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-11 text-base placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600" 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none flex items-center">
                  <Lock size={20} />
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-y-2 px-1">
              <a className="text-primary text-sm font-medium hover:text-blue-400 transition-colors" href="#">
                Forgot Password?
              </a>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white h-12 text-base font-semibold leading-normal shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form> 
          <div className="mt-4 border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-600 text-xs">
              © 2024 Internal Systems Corp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
