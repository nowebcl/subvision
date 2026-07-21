import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardCheck, FileSpreadsheet, Plus, CheckCircle2, User } from 'lucide-react';

interface ChecklistLog {
  id: string;
  timestamp: string;
  inspector: string;
  cageId: string;
  netCleanliness: number;
  mortalityRemoved: boolean;
  foulingLevel: string;
  shackleCheck: boolean;
  notes: string;
  status: 'passed' | 'review_required';
}

export const InspectionChecklistView: React.FC = () => {
  const { selectedCenter, currentUser } = useApp();
  const [inspector, setInspector] = useState(currentUser?.name || '');
  const [cageId, setCageId] = useState(selectedCenter.cages[0]?.id || '');
  const [netCleanliness, setNetCleanliness] = useState(90);
  const [mortalityRemoved, setMortalityRemoved] = useState(true);
  const [foulingLevel, setFoulingLevel] = useState('Bajo');
  const [shackleCheck, setShackleCheck] = useState(true);
  const [notes, setNotes] = useState('');
  const [submittedLogs, setSubmittedLogs] = useState<ChecklistLog[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync inspector name when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setInspector(currentUser.name);
    }
  }, [currentUser]);

  // Load user-specific logs on mount/user change
  useEffect(() => {
    const userEmail = currentUser?.email || 'default';
    const saved = localStorage.getItem(`subvision_checklist_logs_${userEmail}`);
    if (saved) {
      setSubmittedLogs(JSON.parse(saved));
    } else {
      setSubmittedLogs([
        {
          id: 'log-1',
          timestamp: '2026-07-08 14:32',
          inspector: 'Christian Oyarzún',
          cageId: 'h-101',
          netCleanliness: 95,
          mortalityRemoved: true,
          foulingLevel: 'Bajo',
          shackleCheck: true,
          notes: 'Limpieza de malla excelente. No se detectan anomalías.',
          status: 'passed'
        },
        {
          id: 'log-2',
          timestamp: '2026-07-07 10:15',
          inspector: 'Andrés Mansilla',
          cageId: 'h-105',
          netCleanliness: 74,
          mortalityRemoved: false,
          foulingLevel: 'Alto',
          shackleCheck: false,
          notes: 'Biofouling pesado en paño inferior. Grilletes oxidados en anclaje oeste.',
          status: 'review_required'
        }
      ]);
    }
  }, [currentUser]);

  // Persist logs to localStorage
  useEffect(() => {
    if (currentUser && submittedLogs.length > 0) {
      localStorage.setItem(`subvision_checklist_logs_${currentUser.email}`, JSON.stringify(submittedLogs));
    }
  }, [submittedLogs, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspector) return;

    const newLog: ChecklistLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      inspector,
      cageId,
      netCleanliness,
      mortalityRemoved,
      foulingLevel,
      shackleCheck,
      notes: notes || 'Sin observaciones.',
      status: (netCleanliness < 80 || !shackleCheck) ? 'review_required' : 'passed'
    };

    setSubmittedLogs(prev => [newLog, ...prev]);
    setShowSuccessToast(true);
    
    // Reset form
    setInspector(currentUser?.name || '');
    setNotes('');
    setNetCleanliness(90);
    setShackleCheck(true);
    setMortalityRemoved(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Checklist de Inspección Diaria</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Registro y control de auditorías subacuáticas y terrestres por buzos operacionales.
          </p>
        </div>
      </div>

      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Bitácora guardada exitosamente y sincronizada con el servidor central Servirov.</span>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-premium">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
            <ClipboardCheck className="w-5 h-5 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nueva Ficha de Buceo & Auditoría</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Diver Name Input */}
              <div className="space-y-2">
                <label className="text-slate-600 font-semibold uppercase tracking-wider">Nombre del Buzo Inspector</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="Ej. Christian Oyarzún"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Cage Select */}
              <div className="space-y-2">
                <label className="text-slate-600 font-semibold uppercase tracking-wider">Módulo a Evaluar</label>
                <select
                  value={cageId}
                  onChange={(e) => setCageId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs cursor-pointer"
                >
                  {selectedCenter.cages.map(c => (
                    <option key={c.id} value={c.id}>{c.name.replace('Jaula', 'Módulo')} ({c.species})</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Checklist Checks */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Controles Específicos de Inspección</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cleanliness slider */}
                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">Limpieza de Paño Malla</span>
                    <span className="text-cyan-600 font-bold">{netCleanliness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={netCleanliness}
                    onChange={(e) => setNetCleanliness(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Suciedad Crítica (50)</span>
                    <span>Limpio (100)</span>
                  </div>
                </div>

                {/* Biofouling level */}
                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium block">Nivel de Biofouling (Incrustaciones)</span>
                  <div className="flex gap-2">
                    {['Bajo', 'Medio', 'Alto'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFoulingLevel(lvl)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold transition-all ${
                          foulingLevel === lvl
                            ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dead fish removal */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-600 font-medium block">Retiro de Mortalidad</span>
                    <span className="text-[10px] text-slate-400">¿Fueron extraídos los desechos orgánicos?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mortalityRemoved}
                      onChange={(e) => setMortalityRemoved(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {/* Mooring Shackles Check */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-600 font-medium block">Inspección de Grilletes</span>
                    <span className="text-[10px] text-slate-400">Verificación de pasadores y desgaste</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shackleCheck}
                      onChange={(e) => setShackleCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-slate-600 font-semibold uppercase tracking-wider">Observaciones Generales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describa fisuras, roturas en paños de malla, tensiones irregulares o requerimientos de ROV..."
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs resize-none"
              />
            </div>

            {/* Action */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Registro a Bitácora</span>
            </button>

          </form>
        </div>

        {/* Right Side: Submitted logs list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Historial de Registro Local</h3>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {submittedLogs.map((log) => (
                <div key={log.id} className="border border-slate-100 p-3.5 rounded-xl space-y-2.5 text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.inspector}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                      log.status === 'passed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'passed' ? 'Aprobado' : 'Revisar Urgente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                    <div>Centro: <span className="text-slate-700 font-semibold">{selectedCenter.name}</span></div>
                    <div>Módulo: <span className="text-slate-700 font-semibold">{log.cageId.toUpperCase()}</span></div>
                    <div>Malla: <span className="text-slate-700 font-semibold">{log.netCleanliness}%</span></div>
                    <div>Grilletes: <span className="text-slate-700 font-semibold">{log.shackleCheck ? 'OK' : 'Defectuoso'}</span></div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
                    "{log.notes}"
                  </p>

                  <div className="text-[9px] text-slate-400 text-right">
                    Ingresado el: {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center pt-4 border-t border-slate-50 mt-4">
            Auditorías locales sincronizadas con Servirov Cloud
          </div>
        </div>

      </div>

    </div>
  );
};
