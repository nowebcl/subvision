import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle2, Info, Eye, Smartphone } from 'lucide-react';
import { type CageData } from '../data/mockData';

export const InstallationsView: React.FC = () => {
  const { selectedCenter, rovReports, openPhoneModal, selectedCageId, setSelectedCageId } = useApp();

  const selectedCage = selectedCenter.cages.find(c => c.id === selectedCageId) || selectedCenter.cages[0];
  const setSelectedCage = (cage: CageData) => setSelectedCageId(cage.id);

  useEffect(() => {
    if (selectedCenter.cages.length > 0 && !selectedCenter.cages.some(c => c.id === selectedCageId)) {
      setSelectedCageId(selectedCenter.cages[0].id);
    }
  }, [selectedCenter, selectedCageId, setSelectedCageId]);

  const detectCageId = (reportText: string) => {
    const text = reportText.toLowerCase();
    if (text.includes('101')) return '101';
    if (text.includes('102')) return '102';
    if (text.includes('103')) return '103';
    if (text.includes('104')) return '104';
    if (text.includes('105')) return '105';
    if (text.includes('106')) return '106';
    if (text.includes('107')) return '107';
    if (text.includes('108') || text.includes('b2')) return '108';
    if (text.includes('109')) return '109';
    if (text.includes('110')) return '110';
    if (text.includes('111')) return '111';
    if (text.includes('112')) return '112';
    if (text.includes('113')) return '113';
    if (text.includes('114')) return '114';
    return null;
  };


  const triggerCustomPhoneAlert = (title: string, location: string, action: string) => {
    const message = `🚨 ALERTA SUBVISION - SERVIROV 🚨\n⚠️ ESTADO: ${title}\n📍 MÓDULO/UBICACIÓN: ${location} (${selectedCenter.name})\n⏱️ HORA REGISTRO: ${new Date().toLocaleTimeString().substring(0, 5)}\n⚙️ ACCIÓN REQUERIDA: ${action}`;
    openPhoneModal(message);
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 overflow-y-auto animate-fade-in">
      
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Estructuras y Módulos</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Monitoreo estructural de mallas de protección y líneas de fondeo en <span className="font-semibold">{selectedCenter.name}</span>.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns: Cages and Mooring lines */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Cages Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3 flex justify-between items-center">
              <span>Malla Flotante de Producción ({selectedCenter.cages.length} Módulos)</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">Grilla {selectedCenter.cages.length} Módulos</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCenter.cages.map(cage => {
                const cageNum = cage.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106');
                const matchingReport = rovReports.find(
                  r => r.centroId === selectedCenter.id && detectCageId(r.nombre + ' ' + r.redes) === cageNum
                );

                return (
                  <div
                    key={cage.id}
                    onClick={() => setSelectedCage(cage)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedCage?.id === cage.id 
                        ? 'border-cyan-500 bg-cyan-50/10 shadow-md ring-1 ring-cyan-500/20' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-sm">{cage.name.replace('Jaula', 'Módulo')}</span>
                          <a
                            href={matchingReport ? `/visor.html?center=${selectedCenter.id}&report=${matchingReport.id}` : `/visor.html?center=${selectedCenter.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/50 transition-all flex items-center justify-center"
                            title="Ver en Visor 3D"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          cage.status === 'optimal' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : cage.status === 'warning' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cage.status}
                        </span>
                      </div>

                      {/* Visual Mallas Badge & Tags */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="bg-cyan-100 text-cyan-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono border border-cyan-200">
                          {cage.netsCount || (cage.nets ? cage.nets.length : 3)} Mallas
                        </span>
                        {cage.nets?.slice(0, 2).map((net, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {net.tipo} ({net.ojoMallaMm}mm)
                          </span>
                        ))}
                        {(cage.nets?.length || 0) > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            +{(cage.nets?.length || 0) - 2} más
                          </span>
                        )}
                      </div>
                    
                      <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                        <div className="flex justify-between">
                          <span>Integridad:</span>
                          <span className={`font-bold ${
                            cage.netIntegrity < 80 ? 'text-red-500' : cage.netIntegrity < 90 ? 'text-amber-500' : 'text-slate-700'
                          }`}>{cage.netIntegrity}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              cage.netIntegrity < 80 ? 'bg-red-500' : cage.netIntegrity < 90 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${cage.netIntegrity}%` }}
                          />
                        </div>
                        <div className="flex justify-between pt-1">
                          <span>Tensión Fondeo:</span>
                          <span className="font-semibold text-slate-700">{cage.mooringTensionKn.toFixed(1)} kN</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick alert button ONLY for warning (yellow) and critical (red) modules */}
                    {cage.status !== 'optimal' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const statusText = cage.status === 'critical' ? 'ROTURA CRÍTICA DE MALLA PECERA' : 'DESGASTE PREVENTIVO Y BIOFOULING';
                          const actionText = cage.status === 'critical' ? 'REVISIÓN URGENTE EN TERRENO CON ROV' : 'MANTENER MONITOREO CONTINUO';
                          triggerCustomPhoneAlert(statusText, cage.name.replace('Jaula', 'Módulo'), actionText);
                        }}
                        className={`w-full py-1.5 px-2.5 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
                          cage.status === 'critical'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/80 shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/80 shadow-xs'
                        }`}
                        title="Enviar alerta a WhatsApp"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Alerta WhatsApp</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        {/* Right Column: Cage Detail Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-600" />
              Detalle Técnico Módulo
            </h3>

            {selectedCage ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">{selectedCage.name.replace('Jaula', 'Módulo')}</h4>
                    <span className="text-slate-400 text-xs font-mono">Stock de Producción Real</span>
                  </div>
                  <span className="bg-cyan-50 border border-cyan-200 text-cyan-700 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                    {selectedCage.netsCount || selectedCage.nets?.length || 3} Mallas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Especie</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCage.species}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">N° Peces</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCage.count.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Peso Promedio</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCage.avgWeightKg} kg</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Biomasa Total</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCage.biomassTons} t</span>
                  </div>
                </div>

                {/* Mallas Específicas del Módulo */}
                {selectedCage.nets && selectedCage.nets.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Estructura de Mallas ({selectedCage.nets.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedCage.nets.map((net, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-700 text-[11px]">{net.nombre}</div>
                            <div className="text-[10px] text-slate-400">Ojo: {net.ojoMallaMm}mm • Profundidad: {net.profundidadMts}m</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            net.estado === 'Óptimo' ? 'bg-emerald-100 text-emerald-700' :
                            net.estado === 'Biofouling' ? 'bg-amber-100 text-amber-700' :
                            net.estado === 'Desgaste' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700 animate-pulse'
                          }`}>
                            {net.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informe ROV Exclusivo del Módulo */}
                {selectedCage.reportSummary && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Informe ROV del Módulo</span>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedCage.reportSummary.fecha}</span>
                    </div>
                    <div className="p-3 bg-cyan-50/40 rounded-xl border border-cyan-100 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-800 text-[11px]">{selectedCage.reportSummary.titulo}</div>
                      <div className="text-[10px] text-slate-500">Piloto: <span className="font-semibold text-slate-700">{selectedCage.reportSummary.piloto}</span></div>
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-md border border-cyan-100/50">
                        {selectedCage.reportSummary.hallazgoClave}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                        <span>Biofouling: <strong>{selectedCage.reportSummary.nivelBiofouling}</strong></span>
                        <span>Costuras: <strong>{selectedCage.reportSummary.estadoCosturas}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl border bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Evaluación de Riesgo Real</div>
                  {selectedCage.status === 'optimal' ? (
                    <div className="text-xs text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Estructura intacta (Integridad {selectedCage.netIntegrity}%). Malla limpia de biofouling y tracción de fondeo en {selectedCage.mooringTensionKn.toFixed(1)} kN. No requiere mantención inmediata.</span>
                    </div>
                  ) : selectedCage.status === 'warning' ? (
                    <div className="text-xs text-amber-700 bg-amber-100/50 p-2.5 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Integridad en {selectedCage.netIntegrity}%. Acumulación moderada de biofouling y tensión en {selectedCage.mooringTensionKn.toFixed(1)} kN. Se aconseja programar limpieza preventiva en 72 horas.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-red-700 bg-red-100/50 p-2.5 rounded-lg flex items-start gap-2 border border-red-200/50">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>ALERTA CRÍTICA: Integridad del {selectedCage.netIntegrity}% con indicios de falla o desgaste en paño. Tensión crítica de fondeo en {selectedCage.mooringTensionKn.toFixed(1)} kN. Desplegar ROV de inspección de manera prioritaria.</span>
                    </div>
                  )}

                  {/* Phone Alert / WhatsApp trigger button ONLY for warning (yellow) and critical (red) */}
                  {selectedCage.status !== 'optimal' && (
                    <button
                      onClick={() => {
                        const statusText = selectedCage.status === 'critical' ? 'ROTURA CRÍTICA DE MALLA PECERA' : 'DESGASTE PREVENTIVO Y BIOFOULING';
                        const actionText = selectedCage.status === 'critical' ? 'REVISIÓN URGENTE EN TERRENO CON ROV' : 'MANTENER MONITOREO CONTINUO';
                        triggerCustomPhoneAlert(statusText, selectedCage.name.replace('Jaula', 'Módulo'), actionText);
                      }}
                      className={`w-full mt-3 py-2.5 px-3 font-bold text-[10px] uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                        selectedCage.status === 'critical' 
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20' 
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Enviar Alerta al Teléfono (Simular WhatsApp)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">
                Seleccione un módulo para cargar telemetría detallada.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center font-mono border-t border-slate-50 pt-4">
            Servirov Telemetry ID: SV-GRID-C1
          </div>
        </div>

      </div>

    </div>
  );
};
