import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ROVReport } from '../context/AppContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Smartphone, 
  MapPin, 
  User, 
  Calendar, 
  Info,
  Anchor
} from 'lucide-react';

export const FindingsView: React.FC = () => {
  const { rovReports, openPhoneModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const getCenterName = (centroId?: string) => {
    switch (centroId) {
      case 'centro-pilpilehue': return 'Centro Pilpilehue';
      case 'centro-apiao': return 'Centro Apiao';
      case 'centro-quellon': return 'Centro Quellón';
      default: return 'Centro Pilpilehue';
    }
  };

  const getCageId = (report: ROVReport) => {
    const text = `${report.nombre} ${report.redes}`.toLowerCase();
    const match = text.match(/\b(1|3|4)\d{2}\b/);
    if (match) return match[0];
    if (text.includes('b2')) return '108';
    return '101';
  };

  const isCritical = (report: ROVReport) => {
    const nameText = (report.nombre + ' ' + report.redes).toLowerCase();
    return report.puerto === 'Cerrado' || nameText.includes('rotura') || nameText.includes('falla') || nameText.includes('desgarro') || nameText.includes('crítica') || nameText.includes('tensión');
  };

  const triggerWhatsAppAlert = (report: ROVReport) => {
    const cage = getCageId(report);
    const center = getCenterName(report.centroId);
    
    // Classify finding title
    let classification = 'Inspección Submarina';
    const text = `${report.nombre} ${report.redes}`.toLowerCase();
    if (text.includes('rotura') || text.includes('desgarro')) {
      classification = 'ROTURA CRÍTICA DE MALLA';
    } else if (text.includes('tensión') || text.includes('fondeo') || text.includes('anclaje')) {
      classification = 'SOBRETENSIÓN CRÍTICA DE FONDEO';
    }

    const msg = `🚨 *ALERTA DE SEGURIDAD SUBMARINA* 🚨\n\n*Tipo:* ${classification}\n*Módulo:* Jaula ${cage}\n*Ubicación:* ${center}\n*Gravedad:* CRÍTICO\n*Piloto:* ${report.piloto}\n*Detalle:* ${report.redes}\n\n_Por favor, responda con "RECIBIDO" para confirmar acuse técnico._`;
    openPhoneModal(msg);
  };

  // Filter reports list
  const filteredReports = rovReports.filter(report => {
    const cage = getCageId(report);
    const centerName = getCenterName(report.centroId);
    const matchesSearch = 
      report.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.redes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cage.includes(searchTerm) ||
      centerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCenter = selectedCenter === 'all' || report.centroId === selectedCenter;
    
    const crit = isCritical(report);
    const matchesSeverity = 
      selectedSeverity === 'all' ||
      (selectedSeverity === 'critical' && crit) ||
      (selectedSeverity === 'normal' && !crit);

    return matchesSearch && matchesCenter && matchesSeverity;
  });

  const criticalCount = rovReports.filter(isCritical).length;
  const normalCount = rovReports.length - criticalCount;

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Registro de Hallazgos en Instalaciones</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Panel unificado de hallazgos submarinos detectados en tiempo real mediante ROV en redes e infraestructura.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Hallazgos</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{rovReports.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
            <Info className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Estado Crítico</p>
            <p className="text-2xl font-black text-red-600 mt-1">{criticalCount}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Bajo Monitoreo</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{normalCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por módulo, jaula, piloto o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Center selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors text-slate-700 font-medium"
            >
              <option value="all">Todos los Centros</option>
              <option value="centro-pilpilehue">Centro Pilpilehue</option>
              <option value="centro-apiao">Centro Apiao</option>
              <option value="centro-quellon">Centro Quellón</option>
            </select>
          </div>

          {/* Severity selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors text-slate-700 font-medium"
            >
              <option value="all">Todas las Gravedades</option>
              <option value="critical">Crítico (Rojo)</option>
              <option value="normal">Normal (Verde)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Findings List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span className="text-sm font-medium">No se encontraron hallazgos con los filtros seleccionados.</span>
          </div>
        ) : (
          filteredReports.map((report) => {
            const crit = isCritical(report);
            const cage = getCageId(report);
            const centerName = getCenterName(report.centroId);
            
            return (
              <div 
                key={report.id} 
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group ${
                  crit 
                    ? 'border-red-100 shadow-[0_4px_12px_rgba(239,68,68,0.03)] ring-1 ring-red-500/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Left accent colored line */}
                <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${crit ? 'bg-red-500 shadow-[2px_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500'}`} />

                {/* Card Top Information */}
                <div>
                  <div className="flex items-center justify-between mb-3 pl-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {centerName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      crit 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {crit ? 'Crítico - Emergencia' : 'Óptimo - En Monitoreo'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-tight pl-2 mb-2 group-hover:text-cyan-600 transition-colors">
                    {report.nombre}
                  </h3>

                  <p className="text-slate-500 text-xs pl-2 line-clamp-3 leading-relaxed mb-4">
                    {report.redes}
                  </p>
                </div>

                {/* Card Bottom Meta Details & Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2 text-[10px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {report.fecha}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Anchor className="w-3 h-3 text-slate-400" />
                      Módulo {cage}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {report.piloto} ({report.empresa})
                    </span>
                  </div>

                  {/* Trigger WhatsApp Live simulator action only for Red reports */}
                  {crit && (
                    <button
                      onClick={() => triggerWhatsAppAlert(report)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer select-none"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Alerta WhatsApp</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
