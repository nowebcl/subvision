import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Eye, EyeOff, ShieldAlert, Anchor, MapPin, Briefcase } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, registerUserAndCenter } = useApp();
  
  // Toggle between Login and Register Screens
  const [isRegistering, setIsRegistering] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('operador@servirov.cl');
  const [password, setPassword] = useState('ClaveSeguraSubvision123!');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register Form States
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Jefe de Centro');
  const [regCenterName, setRegCenterName] = useState('');
  const [regCenterLocation, setRegCenterLocation] = useState('');
  const [regCenterRegion, setRegCenterRegion] = useState('Región de Los Lagos');

  // Shared status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(email, password);
      setLoading(false);
      if (!success) {
        setError('Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error de conexión durante el inicio de sesión.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre || !regEmail || !regPassword || !regCenterName || !regCenterLocation) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await registerUserAndCenter({
        nombre: regNombre,
        email: regEmail,
        passwordId: regPassword,
        role: regRole,
        centerName: regCenterName,
        centerLocation: regCenterLocation,
        centerRegion: regCenterRegion
      });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Ocurrió un error al registrar el usuario en Supabase.');
    }
  };

  const handleQuickFill = () => {
    setEmail('operador@servirov.cl');
    setPassword('ClaveSeguraSubvision123!');
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-y-auto text-slate-200 py-10 px-4">
      
      {/* Real Underwater Image Background with Sun Rays */}
      <div 
        className="absolute inset-0 bg-[url('/underwater_bg.png')] bg-cover bg-center bg-no-repeat z-0" 
        style={{ filter: 'brightness(0.6) contrast(1.1)' }}
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/30 z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Glassmorphic Login Card */}
        <div className="bg-[#0b1329]/65 backdrop-blur-2xl rounded-[28px] p-8 border border-cyan-500/20 shadow-[0_0_60px_-10px_rgba(6,182,212,0.25)] relative">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 mb-2 select-none flex items-center justify-center">
              <img 
                src="/LOGO.png" 
                alt="SubVision Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <h1 className="text-white font-extrabold text-lg tracking-wider leading-none">SUBVISION</h1>
            <p className="text-slate-400 text-[10px] tracking-widest font-mono uppercase mt-1">Servirov OS</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW A: LOGIN FORM */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email del Usuario"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Button - Bright Solid Cyan */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#00d2ff] hover:bg-[#33deff] text-slate-950 font-bold rounded-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Entrar</span>
                )}
              </button>

              {/* Go to Register View Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline text-[11px] tracking-wide transition-colors"
                >
                  ¿No tienes cuenta? Registra tu Usuario y Centro
                </button>
              </div>
            </form>
          ) : (
            /* VIEW B: REGISTER NEW USER AND OPERATING CENTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              <div className="border-b border-slate-800/80 pb-2 mb-2">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Paso 1: Datos del Operador</h3>
              </div>

              {/* Nombre completo */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                  placeholder="Nombre Completo"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Email */}
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="Email (Usuario)"
                  className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />

                {/* Password */}
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Nueva Contraseña"
                  className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />
              </div>

              {/* Role Select */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs cursor-pointer appearance-none"
                >
                  <option value="Jefe de Centro" className="bg-slate-900 text-slate-200">Jefe de Centro</option>
                  <option value="Piloto ROV" className="bg-slate-900 text-slate-200">Piloto ROV</option>
                  <option value="Biólogo de Centro" className="bg-slate-900 text-slate-200">Biólogo de Centro</option>
                  <option value="Supervisor de Operaciones" className="bg-slate-900 text-slate-200">Supervisor de Operaciones</option>
                </select>
              </div>

              <div className="border-b border-slate-800/80 pb-2 pt-1 mb-2">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Paso 2: Nuevo Centro Operativo</h3>
              </div>

              {/* Nombre del centro */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Anchor className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={regCenterName}
                  onChange={(e) => setRegCenterName(e.target.value)}
                  required
                  placeholder="Nombre del Centro (Ej. Centro Castro)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Location */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={regCenterLocation}
                    onChange={(e) => setRegCenterLocation(e.target.value)}
                    required
                    placeholder="Ubicación"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs"
                  />
                </div>

                {/* Region */}
                <select
                  value={regCenterRegion}
                  onChange={(e) => setRegCenterRegion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-700/50 rounded-xl text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-xs cursor-pointer appearance-none"
                >
                  <option value="Región de Los Lagos" className="bg-slate-900 text-slate-200">Región de Los Lagos</option>
                  <option value="Región de Aysén" className="bg-slate-900 text-slate-200">Región de Aysén</option>
                  <option value="Región de Magallanes" className="bg-slate-900 text-slate-200">Región de Magallanes</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Registrar y Comenzar</span>
                )}
              </button>

              {/* Cancel link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-white underline text-[11px] tracking-wide transition-colors"
                >
                  ← Volver al Login
                </button>
              </div>

            </form>
          )}

          {/* Separator (only in Login mode) */}
          {!isRegistering && (
            <>
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="px-3 text-slate-500 text-xs font-mono select-none">o</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Google Login Option */}
              <button
                type="button"
                onClick={handleQuickFill}
                className="w-full py-3 px-4 bg-transparent border border-slate-700/60 hover:bg-slate-900/40 text-slate-200 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] text-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.31 7.69 8.97 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.02 3.67-8.64z" />
                  <path fill="#FBBC05" d="M5.36 10.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 2.92A11.96 11.96 0 000 8.21c0 1.94.46 3.77 1.5 5.29l3.86-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.52 1.18-4.2 1.18-3.03 0-5.69-2.65-6.64-5.46L1.5 16.81C3.4 20.35 7.35 23 12 23z" />
                </svg>
                <span>Entrar con Google</span>
              </button>

              {/* Quick Credential Restore Link */}
              <div className="mt-5 text-center border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] text-cyan-500/80 hover:text-cyan-400 transition-colors uppercase tracking-wider"
                >
                  Autocompletar Cuenta de Prueba
                </button>
              </div>
            </>
          )}

        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-slate-500 text-[10px] font-mono select-none tracking-widest">
          <p>© 2026 SERVIROV</p>
        </div>
      </div>
    </div>
  );
};
