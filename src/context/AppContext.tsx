import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type AquacultureCenter, 
  aquacultureCenters, 
  mockUser, 
  initialUsersList,
  type SystemAlert, 
  initialAlerts, 
  type WhatsAppRule, 
  initialWaRules, 
  type WhatsAppNotification 
} from '../data/mockData';
import { supabase } from '../lib/supabase';

export interface ROVFinding {
  id: string;
  jaula: string;
  seccion: string;
  clasificacion: string;
  observacion: string;
  fotoUrl: string;
  profundidad: string;
}

export interface ROVReport {
  id: string;
  fecha: string;
  nombre: string;
  jefeCentro: string;
  piloto: string;
  empresa: string;
  puerto: 'Abierto' | 'Cerrado';
  redes: string;
  centroId?: string;
  userEmail?: string;
  findings?: ROVFinding[];
}

const initialRovReports: ROVReport[] = [
  {
    id: 'r-pilpilehue-today',
    fecha: '2026-07-21',
    nombre: 'ROTURA CRÍTICA DE MALLA JAULA 103',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Cristian Barcena Córdova (Piloto ROV)',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'RED PECERA (Rotura crítica de malla con desgarro vertical de 1.2 metros en fondo)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-today-1',
        jaula: '103',
        seccion: 'Fondo',
        clasificacion: 'Rotura de Red',
        observacion: 'Se detecta rotura de malla pecera jaula 103 con desgarro vertical de 1.2 metros en fondo.',
        fotoUrl: '/report_pecera409.jpg',
        profundidad: '20 metros'
      },
      {
        id: 'f-today-2',
        jaula: '105',
        seccion: 'Lateral',
        clasificacion: 'Biofouling pesado',
        observacion: 'Nivel de adherencia de algas moderado en cuadrante norte del paño de jaula 105.',
        fotoUrl: '/report_ins311.png',
        profundidad: '12 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-1',
    fecha: '2026-07-20',
    nombre: 'AUDITORÍA DE VECTORES DE ANCLAJE B2',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Cristian Barcena Córdova (Piloto ROV)',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'LÍNEA DE ANCLAJE B2 (Tensión inusual de 148.9 kN registrada durante corriente fuerte)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-1-1',
        jaula: '108',
        seccion: 'Fondo',
        clasificacion: 'Sobretensión Fondeo',
        observacion: 'Tensión máxima de 148.9 kN registrada durante oscilación de corriente en anclaje B2.',
        fotoUrl: '/report_ins311.png',
        profundidad: '24 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-2',
    fecha: '2026-07-19',
    nombre: 'INSPECCIÓN DE UNIÓN DE PAÑO JAULA 101-102',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Cristian Barcena Córdova (Piloto ROV)',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED PECERA (Inspección rutinaria de paños en módulo 101 y costuras de unión inferior)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-2-1',
        jaula: '101',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Inspección de cabo de unión inferior conforme sin desgarros.',
        fotoUrl: '/report_ins301.png',
        profundidad: '15 metros'
      },
      {
        id: 'f-2-2',
        jaula: '102',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Revisión de costuras y uniones de paños sin novedades.',
        fotoUrl: '/report_j303.png',
        profundidad: '15 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-3',
    fecha: '2026-07-18',
    nombre: 'MONITOREO DE INTEGRIDAD JAULA 103 Y 104',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Carlos Varas',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'RED PECERA (Desgarro de 1.0m en cuadrante inferior sur, reparado temporalmente)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-3-1',
        jaula: '103',
        seccion: 'Fondo',
        clasificacion: 'Rotura de Red',
        observacion: 'Desgarro de 1.0m en cuadrante inferior sur, reparado temporalmente.',
        fotoUrl: '/report_pecera409.jpg',
        profundidad: '20 metros'
      },
      {
        id: 'f-3-2',
        jaula: '104',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Inspección rutinaria del cabezal de la jaula 104 sin observaciones.',
        fotoUrl: '/report_ins301.png',
        profundidad: '15 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-4',
    fecha: '2026-07-17',
    nombre: 'MONITOREO DE BIOFOULING JAULA 108',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Carlos Varas',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'LÍNEA DE ANCLAJE (Tensión de 142.5 kN registrada en fondeo, bajo monitoreo)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-4-1',
        jaula: '108',
        seccion: 'Fondo',
        clasificacion: 'Sobretensión Fondeo',
        observacion: 'Tensión de 142.5 kN registrada en fondeo, bajo monitoreo constante.',
        fotoUrl: '/report_ins311.png',
        profundidad: '24 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-5',
    fecha: '2026-07-16',
    nombre: 'AUDITORÍA DE BIOFOULING JAULA 105-106',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Hugo Díaz',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED PECERA (Adherencia de algas moderada en jaula 105, limpieza programada)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-5-1',
        jaula: '105',
        seccion: 'Lateral',
        clasificacion: 'Biofouling pesado',
        observacion: 'Nivel de adherencia de algas moderado, requiere limpieza programada en 5 días.',
        fotoUrl: '/report_ins311.png',
        profundidad: '12 metros'
      },
      {
        id: 'f-5-2',
        jaula: '106',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Inspección de fondo de módulo 106 sin observaciones.',
        fotoUrl: '/report_j303.png',
        profundidad: '18 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-6',
    fecha: '2026-07-15',
    nombre: 'AUDITORÍA DE INTEGRIDAD CABEZAL JAULA 103',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Hugo Díaz',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'RED LOBERA (Desgaste en unión de paño este a 2m de profundidad)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-6-1',
        jaula: '103',
        seccion: 'Lateral',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Desgaste menor en unión de paño este a 2m de profundidad en red lobera.',
        fotoUrl: '/report_ins301.png',
        profundidad: '15 metros'
      }
    ]
  },
  {
    id: 'r-pilpilehue-7',
    fecha: '2026-07-14',
    nombre: 'INSPECCIÓN DE UNIÓN DE PAÑO JAULA 102',
    jefeCentro: 'Andrés Mansilla',
    piloto: 'Daniel Toro',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED PECERA (Revisión de costuras y tensores inferiores a 6m en módulo 102)',
    centroId: 'centro-pilpilehue',
    userEmail: 'operador@servirov.cl',
    findings: [
      {
        id: 'f-7-1',
        jaula: '102',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Revisión de costuras y tensores inferiores a 6m conforme.',
        fotoUrl: '/report_j303.png',
        profundidad: '15 metros'
      }
    ]
  },
  {
    id: 'r-quellon-1',
    fecha: '2026-07-14',
    nombre: 'REVISIÓN DE BIOFOULING JAULA 403',
    jefeCentro: 'Carlos Peña',
    piloto: 'Cristian Barcena Córdova',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED PECERA (Acumulación moderada de algas en cuadrante norte)',
    centroId: 'centro-quellon',
    findings: [
      {
        id: 'f-q-1',
        jaula: '403',
        seccion: 'Lateral',
        clasificacion: 'Biofouling pesado',
        observacion: 'Acumulación moderada de algas en cuadrante norte.',
        fotoUrl: '/report_ins311.png',
        profundidad: '10 metros'
      }
    ]
  },
  {
    id: 'r-quellon-2',
    fecha: '2026-07-12',
    nombre: 'MONITOREO DE BIOMASA JAULA 401',
    jefeCentro: 'Carlos Peña',
    piloto: 'Carlos Varas',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED PECERA; RED LOBERA (Sin observaciones, comportamiento normal)',
    centroId: 'centro-quellon',
    findings: [
      {
        id: 'f-q-2',
        jaula: '401',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Comportamiento normal y mallas en buen estado.',
        fotoUrl: '/report_ins301.png',
        profundidad: '15 metros'
      }
    ]
  },
  {
    id: 'r-apiao-1',
    fecha: '2026-07-14',
    nombre: 'INSPECCIÓN DE PARCHES JAULA 303',
    jefeCentro: 'Juan Silva',
    piloto: 'Hugo Díaz',
    empresa: 'SERVIROV',
    puerto: 'Cerrado',
    redes: 'RED PECERA (Desgarro menor de 0.5m en cuadrante este)',
    centroId: 'centro-apiao',
    findings: [
      {
        id: 'f-a-1',
        jaula: '303',
        seccion: 'Lateral',
        clasificacion: 'Rotura de Red',
        observacion: 'Desgarro menor de 0.5m en cuadrante este.',
        fotoUrl: '/report_pecera409.jpg',
        profundidad: '8 metros'
      }
    ]
  },
  {
    id: 'r-apiao-2',
    fecha: '2026-07-11',
    nombre: 'LIMPIEZA DE MALLA JAULA 302',
    jefeCentro: 'Juan Silva',
    piloto: 'Daniel Toro',
    empresa: 'SERVIROV',
    puerto: 'Abierto',
    redes: 'RED LOBERA (Retiro de suciedad y adherencias completo)',
    centroId: 'centro-apiao',
    findings: [
      {
        id: 'f-a-2',
        jaula: '302',
        seccion: 'Fondo',
        clasificacion: 'Sin Hallazgos',
        observacion: 'Retiro de suciedad y adherencias completo.',
        fotoUrl: '/report_ins301.png',
        profundidad: '12 metros'
      }
    ]
  }
];

export interface AppContextType {
  currentUser: typeof mockUser | null;
  currentView: string;
  selectedCenter: AquacultureCenter;
  centers: AquacultureCenter[];
  activeAlerts: SystemAlert[];
  waRules: WhatsAppRule[];
  waNotifications: WhatsAppNotification[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  rovReports: ROVReport[];
  addRovReport: (report: Omit<ROVReport, 'id'>) => void;
  login: (email: string, password: string) => Promise<boolean> | boolean;
  logout: () => Promise<void> | void;
  setCurrentView: (view: string) => void;
  setSelectedCenterById: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  addWaRule: (rule: Omit<WhatsAppRule, 'id'>) => void;
  toggleWaRule: (id: string) => void;
  deleteWaRule: (id: string) => void;
  triggerWaNotification: (message: string, recipient: string, sender?: 'user' | 'bot') => void;
  simulateTelemetryUpdate: () => void;
  registerUserAndCenter: (data: {
    nombre: string;
    email: string;
    passwordId: string;
    role: string;
    centerName: string;
    centerLocation: string;
    centerRegion: string;
  }) => Promise<boolean>;
  deleteCenter: (id: string) => void;
  aiSettings: { apiKey: string; model: string; temperature: number };
  setAiSettings: React.Dispatch<React.SetStateAction<{ apiKey: string; model: string; temperature: number }>>;
  whatsAppSettings: { apiStatus: 'online' | 'offline'; defaultRecipient: string; autoSend: boolean };
  setWhatsAppSettings: React.Dispatch<React.SetStateAction<{ apiStatus: 'online' | 'offline'; defaultRecipient: string; autoSend: boolean }>>;
  usersList: typeof mockUser[];
  deleteUser: (email: string) => void;
  deleteRovReport: (id: string) => Promise<void> | void;
  changeUserPassword: (email: string, newPasswordId: string) => void;
  activities: any[];
  logActivity: (action: string, target: string) => void;
  activeTab: 'telemetry' | 'rov' | 'structures' | 'admin' | 'cliente';
  setActiveTab: React.Dispatch<React.SetStateAction<'telemetry' | 'rov' | 'structures' | 'admin' | 'cliente'>>;
  isPhoneModalOpen: boolean;
  setIsPhoneModalOpen: (open: boolean) => void;
  phoneModalMessage: string;
  openPhoneModal: (message: string) => void;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  emailModalData: {
    id: string;
    nombre: string;
    fecha: string;
    jefeCentro: string;
    piloto: string;
    empresa: string;
    puerto: string;
    redes: string;
    recipientEmail: string;
    findings?: ROVFinding[];
  } | null;
  openEmailModal: (report: any, email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<typeof mockUser | null>(() => {
    const saved = localStorage.getItem('subvision_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('subvision_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('subvision_current_user');
    }
  }, [currentUser]);

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeTab, setActiveTab] = useState<'telemetry' | 'rov' | 'structures' | 'admin' | 'cliente'>('rov');

  const [centers, setCenters] = useState<AquacultureCenter[]>(() => {
    const saved = localStorage.getItem('subvision_centers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Force migration reset if we have more than 3 cages in Pilpilehue
        const pilp = parsed.find((c: any) => c.id === 'centro-pilpilehue');
        if (pilp && pilp.cages.length > 3) {
          localStorage.setItem('subvision_centers', JSON.stringify(aquacultureCenters));
          return aquacultureCenters;
        }

        // Clean any cached 'centro-huito' and replace with 'centro-pilpilehue'
        const cleaned = parsed.map((c: any) => {
          if (c.id === 'centro-huito') {
            const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
            return pilpilehueDefault || c;
          }
          return c;
        }).filter((c: any) => c.id !== 'centro-huito');
        
        // Ensure centro-pilpilehue is present
        if (!cleaned.some((c: any) => c.id === 'centro-pilpilehue')) {
          const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
          if (pilpilehueDefault) cleaned.unshift(pilpilehueDefault);
        }
        return cleaned;
      } catch {
        return aquacultureCenters;
      }
    }
    return aquacultureCenters;
  });

  // Filter centers list based on logged in user role and assignments
  const filteredCenters = React.useMemo(() => {
    if (!currentUser) return [];
    if (
      currentUser.role === 'admin' || 
      currentUser.email === 'admin@servirov.cl' ||
      currentUser.email === 'operador@servirov.cl' ||
      currentUser.role === 'Supervisor de Operaciones Marítimas' ||
      currentUser.role === 'Piloto ROV' ||
      currentUser.email === 'piloto@servirov.cl' ||
      currentUser.role === 'Cliente' ||
      currentUser.email === 'cliente@servirov.cl'
    ) {
      return centers;
    }
    // Fallback for registered center
    const userCenterId = `centro-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}`;
    const filtered = centers.filter(c => c.id === userCenterId || c.name.toLowerCase().includes(currentUser.name.toLowerCase()));
    if (filtered.length > 0) return filtered;
    return centers.filter(c => c.id === 'centro-pilpilehue');
  }, [centers, currentUser]);

  const [selectedCenter, setSelectedCenter] = useState<AquacultureCenter>(() => {
    const savedId = localStorage.getItem('subvision_selected_center_id');
    const savedCenters = localStorage.getItem('subvision_centers');
    let currentCenters = savedCenters ? JSON.parse(savedCenters) : aquacultureCenters;
    
    // Force migration reset if we have more than 3 cages in Pilpilehue
    const pilp = currentCenters.find((c: any) => c.id === 'centro-pilpilehue');
    if (pilp && pilp.cages.length > 3) {
      currentCenters = aquacultureCenters;
      localStorage.setItem('subvision_centers', JSON.stringify(aquacultureCenters));
    }

    let cleanedCenters = currentCenters;
    try {
      cleanedCenters = currentCenters.map((c: any) => {
        if (c.id === 'centro-huito') {
          const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
          return pilpilehueDefault || c;
        }
        return c;
      }).filter((c: any) => c.id !== 'centro-huito');
      
      if (!cleanedCenters.some((c: any) => c.id === 'centro-pilpilehue')) {
        const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
        if (pilpilehueDefault) cleanedCenters.unshift(pilpilehueDefault);
      }
    } catch {}

    const activeId = savedId === 'centro-huito' ? 'centro-pilpilehue' : savedId;
    if (activeId) {
      const found = cleanedCenters.find((c: any) => c.id === activeId);
      if (found) return found;
    }
    return cleanedCenters[0];
  });

  // Sync selected center when allowed list changes
  useEffect(() => {
    if (filteredCenters.length > 0) {
      const isSelectedAllowed = filteredCenters.some(c => c.id === selectedCenter?.id);
      if (!isSelectedAllowed) {
        setSelectedCenter(filteredCenters[0]);
      }
    }
  }, [filteredCenters, selectedCenter?.id]);

  // Keep selectedCenter in sync with centers array when center data changes (e.g. simulation or load)
  useEffect(() => {
    const updated = centers.find(c => c.id === selectedCenter?.id);
    if (updated && JSON.stringify(updated) !== JSON.stringify(selectedCenter)) {
      setSelectedCenter(updated);
    }
  }, [centers, selectedCenter?.id]);

  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem('subvision_active_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [waRules, setWaRules] = useState<WhatsAppRule[]>(() => {
    const saved = localStorage.getItem('subvision_wa_rules');
    return saved ? JSON.parse(saved) : initialWaRules;
  });

  const [waNotifications, setWaNotifications] = useState<WhatsAppNotification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [aiSettings, setAiSettings] = useState(() => {
    const saved = localStorage.getItem('subvision_ai_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Eliminar apiKey si estaba guardada en localStorage por versiones anteriores
      delete parsed.apiKey;
      return parsed;
    }
    return {
      model: 'deepseek-chat',
      temperature: 0.2
    };
  });
  useEffect(() => {
    localStorage.setItem('subvision_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  const [whatsAppSettings, setWhatsAppSettings] = useState(() => {
    const saved = localStorage.getItem('subvision_whatsapp_settings');
    return saved ? JSON.parse(saved) : {
      apiStatus: 'online',
      defaultRecipient: '+56 9 9629 9010 (Andrés Mansilla)',
      autoSend: true
    };
  });
  useEffect(() => {
    localStorage.setItem('subvision_whatsapp_settings', JSON.stringify(whatsAppSettings));
  }, [whatsAppSettings]);

  const [activities, setActivities] = useState<any[]>(() => {
    const saved = localStorage.getItem('subvision_operator_activities');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('subvision_operator_activities', JSON.stringify(activities));
  }, [activities]);

  const logActivity = async (action: string, target: string, emailOverride?: string) => {
    const email = emailOverride || currentUser?.email || 'sistema@servirov.cl';
    const newActivity = {
      user_email: email,
      action,
      target,
      timestamp: new Date().toLocaleString()
    };

    setActivities(prev => [newActivity, ...prev]);

    try {
      const { error } = await supabase
        .from('operator_activities')
        .insert([{
          user_email: email,
          action,
          target
        }]);
      if (error) {
        console.warn("Could not save activity to Supabase:", error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveCenterToSupabase = async (center: AquacultureCenter) => {
    try {
      const { error } = await supabase
        .from('aquaculture_centers')
        .upsert({
          id: center.id,
          name: center.name,
          location: center.location,
          region: center.region,
          coordinates: center.coordinates,
          water_params: center.waterParams,
          cages: center.cages,
          mooring_lines: center.mooringLines,
          historical_oxygen: center.historicalOxygen,
          historical_current: center.historicalCurrent
        });
      if (error) {
        console.warn(`Could not save center ${center.id} to Supabase:`, error.message);
      }
    } catch (e) {
      console.warn(`Error during upsert of center ${center.id} to Supabase:`, e);
    }
  };

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('aquaculture_centers')
        .select('*');

      if (!error && data && data.length > 0) {
        const mappedCenters: AquacultureCenter[] = data.map(c => ({
          id: c.id,
          name: c.name,
          location: c.location || '',
          region: c.region || '',
          coordinates: c.coordinates || '',
          waterParams: c.water_params || {
            temperature: 11.4,
            dissolvedOxygen: 7.8,
            ph: 8.1,
            salinity: 31.2,
            currentSpeed: 1.2
          },
          cages: c.cages || [],
          mooringLines: c.mooring_lines || [],
          historicalOxygen: c.historical_oxygen || [],
          historicalCurrent: c.historical_current || []
        }));
        
        // Ensure default centers are present
        const merged = [...mappedCenters];
        for (const defaultCenter of aquacultureCenters) {
          const exists = merged.some(c => c.id === defaultCenter.id);
          if (!exists) {
            merged.push(defaultCenter);
            await saveCenterToSupabase(defaultCenter);
          }
        }
        
        setCenters(merged);
        localStorage.setItem('subvision_centers', JSON.stringify(merged));
        return;
      } else if (data && data.length === 0) {
        // Database empty, upload defaults
        for (const defaultCenter of aquacultureCenters) {
          await saveCenterToSupabase(defaultCenter);
        }
        setCenters(aquacultureCenters);
        localStorage.setItem('subvision_centers', JSON.stringify(aquacultureCenters));
        return;
      }
    } catch (e) {
      console.warn("Could not load centers from Supabase, using local storage/fallback:", e);
    }

    // Fallback to local storage
    const saved = localStorage.getItem('subvision_centers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.map((c: any) => {
          if (c.id === 'centro-huito') {
            const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
            return pilpilehueDefault || c;
          }
          return c;
        }).filter((c: any) => c.id !== 'centro-huito');
        
        if (!cleaned.some((c: any) => c.id === 'centro-pilpilehue')) {
          const pilpilehueDefault = aquacultureCenters.find(ac => ac.id === 'centro-pilpilehue');
          if (pilpilehueDefault) cleaned.unshift(pilpilehueDefault);
        }
        
        setCenters(cleaned);
        localStorage.setItem('subvision_centers', JSON.stringify(cleaned));
      } catch {
        setCenters(aquacultureCenters);
        localStorage.setItem('subvision_centers', JSON.stringify(aquacultureCenters));
      }
    } else {
      setCenters(aquacultureCenters);
      localStorage.setItem('subvision_centers', JSON.stringify(aquacultureCenters));
    }
  };

  const saveReportToSupabase = async (report: ROVReport) => {
    try {
      const { error } = await supabase
        .from('rov_reports')
        .upsert({
          id: report.id,
          fecha: report.fecha,
          nombre: report.nombre,
          jefe_centro: report.jefeCentro,
          piloto: report.piloto,
          empresa: report.empresa,
          puerto: report.puerto,
          redes: report.redes,
          centro_id: report.centroId,
          user_email: report.userEmail || 'operador@servirov.cl'
        });
      if (error) {
        console.warn("Could not save report to Supabase table:", error.message);
      }
    } catch (err) {
      console.warn("Failed to insert report to Supabase:", err);
    }
  };

  const loadUserReports = async (email: string) => {
    try {
      // For SERVIROV accounts (Admin, Cliente, Piloto, Operador), fetch all reports across the company so everyone sees all findings
      const query = supabase
        .from('rov_reports')
        .select('*')
        .order('fecha', { ascending: false });

      const { data: dbReports, error } = await query;

      if (!error && dbReports && dbReports.length > 0) {
        const mappedReports: ROVReport[] = dbReports.map(r => ({
          id: r.id || `r-${Date.now()}-${Math.random()}`,
          fecha: r.fecha || '',
          nombre: r.nombre || '',
          jefeCentro: r.jefe_centro || '',
          piloto: r.piloto || '',
          empresa: r.empresa || '',
          puerto: r.puerto || 'Abierto',
          redes: r.redes || '',
          centroId: r.centro_id || '',
          userEmail: r.user_email || ''
        }));

        let merged = mappedReports.map((r: any) => {
          const defaultMatch = initialRovReports.find(d => d.id === r.id);
          if (defaultMatch) {
            return { ...defaultMatch, ...r, findings: r.findings || defaultMatch.findings };
          }
          return r;
        });

        for (const defaultReport of initialRovReports) {
          const exists = merged.some(r => r.id === defaultReport.id);
          if (!exists) {
            merged.push(defaultReport);
            await saveReportToSupabase(defaultReport);
          }
        }

        setRovReports(merged);
        localStorage.setItem(`subvision_rov_reports_${email}`, JSON.stringify(merged));
        return;
      }
    } catch (dbErr) {
      console.warn("Failed to fetch reports from Supabase database, falling back to local storage:", dbErr);
    }

    const saved = localStorage.getItem(`subvision_rov_reports_${email}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = parsed.map((r: any) => {
          const defaultMatch = initialRovReports.find(d => d.id === r.id);
          if (defaultMatch) {
            return { ...defaultMatch, ...r, findings: r.findings || defaultMatch.findings };
          }
          return r;
        });

        initialRovReports.forEach(def => {
          if (!merged.some((r: any) => r.id === def.id)) {
            merged.push(def);
          }
        });
        setRovReports(merged);
        localStorage.setItem(`subvision_rov_reports_${email}`, JSON.stringify(merged));
      } catch {
        setRovReports(initialRovReports);
      }
    } else {
      setRovReports(initialRovReports);
      localStorage.setItem(`subvision_rov_reports_${email}`, JSON.stringify(initialRovReports));
    }
  };

  const [rovReports, setRovReports] = useState<ROVReport[]>(() => {
    const savedUser = localStorage.getItem('subvision_current_user');
    if (!savedUser) return initialRovReports;
    
    try {
      const user = JSON.parse(savedUser);
      const saved = localStorage.getItem(`subvision_rov_reports_${user.email}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = parsed.map((r: any) => {
          const defaultMatch = initialRovReports.find(d => d.id === r.id);
          if (defaultMatch) {
            return { ...defaultMatch, ...r, findings: r.findings || defaultMatch.findings };
          }
          return r;
        });
        initialRovReports.forEach(def => {
          if (!merged.some((r: any) => r.id === def.id)) {
            merged.push(def);
          }
        });
        return merged;
      }
      return initialRovReports;
    } catch {
      return initialRovReports;
    }
  });

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map(act => ({
          user_email: act.user_email,
          action: act.action,
          target: act.target,
          timestamp: act.created_at ? new Date(act.created_at).toLocaleString() : new Date().toLocaleString()
        }));
        setActivities(mapped);
      }
    } catch (e) {
      console.warn("Could not load activities from Supabase:", e);
    }
  };

  useEffect(() => {
    loadCenters();
    const savedUser = localStorage.getItem('subvision_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        loadUserReports(user.email);
        loadActivities();
      } catch (e) {
        console.error("Error parsing current user on mount:", e);
      }
    } else {
      loadActivities();
    }
  }, []);

  const [usersList, setUsersList] = useState<typeof mockUser[]>(() => {
    const saved = localStorage.getItem('subvision_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((u: any) => u.email !== 'piloto2@servirov.cl');
        const merged = [...filtered];
        initialUsersList.forEach(initU => {
          if (!merged.some(u => u.email === initU.email)) {
            merged.push(initU);
          }
        });
        return merged;
      } catch (e) {
        console.error("Error parsing usersList from localStorage:", e);
      }
    }
    return initialUsersList;
  });

  useEffect(() => {
    setUsersList(prev => {
      const merged = [...prev];
      let changed = false;
      initialUsersList.forEach(initU => {
        if (!merged.some(u => u.email === initU.email)) {
          merged.push(initU);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('subvision_users_list', JSON.stringify(merged));
        return merged;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('subvision_centers', JSON.stringify(centers));
  }, [centers]);

  useEffect(() => {
    if (selectedCenter?.id) {
      localStorage.setItem('subvision_selected_center_id', selectedCenter.id);
    }
  }, [selectedCenter]);

  useEffect(() => {
    localStorage.setItem('subvision_active_alerts', JSON.stringify(activeAlerts));
  }, [activeAlerts]);

  useEffect(() => {
    localStorage.setItem('subvision_wa_rules', JSON.stringify(waRules));
  }, [waRules]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`subvision_rov_reports_${currentUser.email}`, JSON.stringify(rovReports));
    }
  }, [rovReports, currentUser]);

  useEffect(() => {
    localStorage.setItem('subvision_users_list', JSON.stringify(usersList));
  }, [usersList]);

  const addRovReport = async (report: Omit<ROVReport, 'id'>) => {
    const newReport: ROVReport = {
      ...report,
      id: `r-${Date.now()}`,
      centroId: selectedCenter.id,
      userEmail: currentUser?.email
    };
    
    // Update local state
    setRovReports(prev => [newReport, ...prev]);

    // Save to user-specific localStorage cache immediately
    if (currentUser) {
      const saved = localStorage.getItem(`subvision_rov_reports_${currentUser.email}`);
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem(`subvision_rov_reports_${currentUser.email}`, JSON.stringify([newReport, ...list]));
    }

    // Try to save to Supabase
    try {
      const { error } = await supabase
        .from('rov_reports')
        .insert([
          {
            fecha: report.fecha,
            nombre: report.nombre,
            jefe_centro: report.jefeCentro,
            piloto: report.piloto,
            empresa: report.empresa,
            puerto: report.puerto,
            redes: report.redes,
            user_email: currentUser?.email,
            centro_id: selectedCenter.id
          }
        ]);
      if (error) {
        console.warn("Could not save report to Supabase table:", error);
      }
    } catch (err) {
      console.warn("Failed to insert report to Supabase:", err);
    }
    
    await logActivity("Creación de Informe", report.nombre);
  };

  // Simulation: Trigger alerts occasionally
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(() => {
      // Simulate slight telemetry fluctuation
      setCenters(prevCenters => 
        prevCenters.map(center => {
          const oxygenFluctuation = (Math.random() - 0.5) * 0.2;
          const currentFluctuation = (Math.random() - 0.5) * 0.1;
          
          const updatedParams = {
            ...center.waterParams,
            dissolvedOxygen: Math.max(4.0, Math.min(12.0, Number((center.waterParams.dissolvedOxygen + oxygenFluctuation).toFixed(1)))),
            currentSpeed: Math.max(0.1, Math.min(5.0, Number((center.waterParams.currentSpeed + currentFluctuation).toFixed(1))))
          };

          const updatedCages = center.cages.map(cage => {
            const netChange = (Math.random() - 0.5) > 0.85 ? -0.1 : 0; // occasional degrade
            const tensionChange = (Math.random() - 0.5) * 2;
            const finalNet = Math.max(50, Math.min(100, Number((cage.netIntegrity + netChange).toFixed(1))));
            const finalTension = Math.max(10, Math.min(250, Number((cage.mooringTensionKn + tensionChange).toFixed(1))));
            
            let status: 'optimal' | 'warning' | 'critical' = 'optimal';
            if (finalNet < 80 || finalTension > 140) status = 'critical';
            else if (finalNet < 90 || finalTension > 100) status = 'warning';
            
            return {
              ...cage,
              netIntegrity: finalNet,
              mooringTensionKn: finalTension,
              status
            };
          });

          return {
            ...center,
            waterParams: updatedParams,
            cages: updatedCages
          };
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Keep selectedCenter updated with live metrics
  useEffect(() => {
    const liveCenter = centers.find(c => c.id === selectedCenter.id);
    if (liveCenter) {
      setSelectedCenter(liveCenter);
    }
  }, [centers, selectedCenter.id]);

  // Trigger WhatsApp alerts when rules are breached
  useEffect(() => {
    if (!currentUser) return;
    
    // Evaluate active rules against the selectedCenter
    waRules.forEach(rule => {
      if (!rule.active || rule.centerId !== selectedCenter.id) return;
      
      let breached = false;
      let val = 0;
      let alertMsg = '';
      
      if (rule.parameter === 'integrity') {
        const lowestIntegrityCage = [...selectedCenter.cages].sort((a, b) => a.netIntegrity - b.netIntegrity)[0];
        val = lowestIntegrityCage.netIntegrity;
        if (rule.condition === 'less_than' && val < rule.threshold) {
          breached = true;
          alertMsg = `⚠️ ALERTA SUBVISION - INTEGRIDAD DE MALLA CRÍTICA en ${lowestIntegrityCage.name} (${selectedCenter.name}): ${val}% (Límite: ${rule.threshold}%)`;
        }
      } else if (rule.parameter === 'mooring') {
        const highestTensionLine = [...selectedCenter.mooringLines].sort((a, b) => b.tensionKn - a.tensionKn)[0];
        val = highestTensionLine.tensionKn;
        if (rule.condition === 'greater_than' && val > rule.threshold) {
          breached = true;
          alertMsg = `⚠️ ALERTA SUBVISION - SOBRETENSIÓN FONDEO en ${highestTensionLine.code} (${selectedCenter.name}): ${val} kN (Límite: ${rule.threshold} kN)`;
        }
      } else if (rule.parameter === 'oxygen') {
        val = selectedCenter.waterParams.dissolvedOxygen;
        if (rule.condition === 'less_than' && val < rule.threshold) {
          breached = true;
          alertMsg = `⚠️ ALERTA SUBVISION - OXÍGENO DISUELTO BAJO en ${selectedCenter.name}: ${val} mg/L (Umbral: ${rule.threshold} mg/L)`;
        }
      } else if (rule.parameter === 'current') {
        val = selectedCenter.waterParams.currentSpeed;
        if (rule.condition === 'greater_than' && val > rule.threshold) {
          breached = true;
          alertMsg = `⚠️ ALERTA SUBVISION - CORRIENTES ALTAS en ${selectedCenter.name}: ${val} nudos (Umbral: ${rule.threshold} nudos)`;
        }
      }

      if (breached) {
        // Prevent duplicate spamming by checking if recently sent
        const alreadySent = waNotifications.some(n => n.message === alertMsg && (Date.now() - new Date(n.timestamp).getTime() < 60000));
        if (!alreadySent && whatsAppSettings.apiStatus === 'online' && whatsAppSettings.autoSend) {
          triggerWaNotification(alertMsg, rule.recipient);
        }
      }
    });
  }, [selectedCenter, waRules, currentUser, whatsAppSettings]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check both usersList and initialUsersList so newly added accounts (like Cliente and Piloto) work even if localStorage had cached an older usersList
    const isAllowed = usersList.some(u => u.email === email) || initialUsersList.some(u => u.email === email);
    if (!isAllowed) {
      console.warn("Login blocked: user profile has been deleted by admin");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (!error && data.user) {
        const isUserAdmin = data.user.user_metadata?.role === 'admin' || email === 'admin@servirov.cl' || email === 'operador@servirov.cl';
        const isUserCliente = data.user.user_metadata?.role === 'Cliente' || email === 'cliente@servirov.cl';
        const userObj = {
          email: data.user.email || email,
          password: password,
          name: data.user.user_metadata?.nombre || (isUserCliente ? 'Cliente SERVIROV' : 'Operador Subvision'),
          role: isUserAdmin ? 'admin' : isUserCliente ? 'Cliente' : (data.user.user_metadata?.cargo || 'Supervisor de Operaciones Marítimas'),
          avatar: isUserAdmin ? 'AG' : isUserCliente ? 'CL' : 'OS',
          company: isUserCliente ? 'SalmonChile / MultiX' : 'SERVIROV'
        };
        setCurrentUser(userObj);
        await loadUserReports(userObj.email);
        await logActivity("Inicio de Sesión", "Ingreso a la plataforma", userObj.email);
        if (isUserCliente) setActiveTab('cliente');
        else if (isUserAdmin) setActiveTab('admin');
        else setActiveTab('rov');
        setCurrentView('dashboard');
        return true;
      }
    } catch (e) {
      console.error("Supabase login error, fallback to mock login", e);
    }

    const found = usersList.find(u => u.email === email && u.password === password) || initialUsersList.find(u => u.email === email && u.password === password);
    if (found) {
      if (!usersList.some(u => u.email === found.email)) {
        const updated = [...usersList, found];
        setUsersList(updated);
        localStorage.setItem('subvision_users_list', JSON.stringify(updated));
      }
      setCurrentUser(found);
      await loadUserReports(found.email);
      await logActivity("Inicio de Sesión", `Ingreso a la plataforma (${found.role})`, found.email);
      if (found.role === 'Cliente' || found.email === 'cliente@servirov.cl') setActiveTab('cliente');
      else if (found.role === 'admin' || found.email === 'admin@servirov.cl' || found.email === 'operador@servirov.cl') setActiveTab('admin');
      else setActiveTab('rov');
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const registerUserAndCenter = async (data: {
    nombre: string;
    email: string;
    passwordId: string;
    role: string;
    centerName: string;
    centerLocation: string;
    centerRegion: string;
  }): Promise<boolean> => {
    let signUpData: any = null;
    try {
      const { data: sData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.passwordId,
        options: {
          data: {
            nombre: data.nombre,
            cargo: data.role,
            center_name: data.centerName,
            center_location: data.centerLocation,
            center_region: data.centerRegion
          }
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      signUpData = sData;
    } catch (e: any) {
      console.error("Supabase signup error:", e);
      throw e;
    }

    // Try to save user profile details to Supabase 'profiles' table if it exists
    if (signUpData && signUpData.user) {
      try {
        const { error: dbError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signUpData.user.id,
              email: data.email,
              nombre: data.nombre,
              cargo: data.role,
              center_name: data.centerName,
              center_location: data.centerLocation,
              center_region: data.centerRegion
            }
          ]);
        if (dbError) {
          console.warn("Could not insert user profile in Supabase table:", dbError);
        }
      } catch (dbErr) {
        console.warn("Failed to insert profile into Supabase database:", dbErr);
      }
    }

    const newUser = {
      name: data.nombre,
      email: data.email,
      password: data.passwordId,
      role: data.role,
      avatar: "OS",
      company: "SERVIROV"
    };

    setUsersList(prev => [...prev, newUser]);

    const centerId = `centro-${data.centerName.toLowerCase().replace(/\s+/g, '-')}`;
    const newCenter: AquacultureCenter = {
      id: centerId,
      name: data.centerName,
      location: data.centerLocation,
      region: data.centerRegion,
      coordinates: '41°48\'12" S, 73°30\'45" W',
      waterParams: {
        temperature: 11.2,
        dissolvedOxygen: 8.5,
        ph: 7.9,
        salinity: 31.8,
        currentSpeed: 1.1
      },
      cages: [
        { id: `${centerId}-101`, name: 'Módulo 101', species: 'Salmón del Atlántico', count: 45000, avgWeightKg: 3.5, biomassTons: 157.5, netIntegrity: 98.5, mooringTensionKn: 45.2, lastCleaned: '2026-07-06', status: 'optimal' },
        { id: `${centerId}-102`, name: 'Módulo 102', species: 'Salmón del Atlántico', count: 46200, avgWeightKg: 3.4, biomassTons: 157.08, netIntegrity: 96.0, mooringTensionKn: 48.1, lastCleaned: '2026-07-05', status: 'optimal' },
        { id: `${centerId}-103`, name: 'Módulo 103', species: 'Salmón del Atlántico', count: 48000, avgWeightKg: 3.6, biomassTons: 172.8, netIntegrity: 74.2, mooringTensionKn: 145.5, lastCleaned: '2026-06-20', status: 'critical' }
      ],
      mooringLines: [
        { id: `${centerId}-m1`, code: 'Línea A1', tensionKn: 85.4, limitKn: 180.0, angle: 45, status: 'optimal' },
        { id: `${centerId}-m2`, code: 'Línea A2', tensionKn: 92.1, limitKn: 180.0, angle: 135, status: 'optimal' },
        { id: `${centerId}-m3`, code: 'Línea B1', tensionKn: 145.5, limitKn: 180.0, angle: 225, status: 'warning' },
        { id: `${centerId}-m4`, code: 'Línea B2', tensionKn: 78.3, limitKn: 180.0, angle: 315, status: 'optimal' }
      ],
      historicalOxygen: [
        { time: '08:00', value: 8.4 },
        { time: '10:00', value: 8.2 },
        { time: '12:00', value: 8.5 },
        { time: '14:00', value: 8.0 },
        { time: '16:00', value: 8.1 },
        { time: '18:00', value: 8.3 },
        { time: '20:00', value: 8.5 }
      ],
      historicalCurrent: [
        { time: '08:00', value: 0.9 },
        { time: '10:00', value: 1.1 },
        { time: '12:00', value: 1.4 },
        { time: '14:00', value: 1.6 },
        { time: '16:00', value: 1.3 },
        { time: '18:00', value: 1.0 },
        { time: '20:00', value: 0.8 }
      ]
    };

    setCenters(prev => [...prev, newCenter]);
    setCurrentUser(newUser);
    setSelectedCenter(newCenter);
    
    // Generate 2 default reports for the newly registered center
    const newCenterReports: ROVReport[] = [
      { id: `r-${centerId}-1`, fecha: new Date().toISOString().substring(0, 10), nombre: 'INSPECCIÓN ESTRUCTURAL INICIAL', jefeCentro: data.nombre, piloto: 'Christian Oyarzún', empresa: 'SERVIROV', puerto: 'Abierto', redes: 'RED PECERA (Estado inicial verificado óptimo)', centroId: centerId },
      { id: `r-${centerId}-2`, fecha: new Date().toISOString().substring(0, 10), nombre: 'REVISIÓN DE FONDEOS PERIMETRALES', jefeCentro: data.nombre, piloto: 'Felipe Soto', empresa: 'SERVIROV', puerto: 'Abierto', redes: 'LÍNEAS DE FONDEO (Tensiones iniciales balanceadas)', centroId: centerId }
    ];
    const mergedWithNew = [...newCenterReports, ...initialRovReports];
    setRovReports(mergedWithNew);
    localStorage.setItem(`subvision_rov_reports_${newUser.email}`, JSON.stringify(mergedWithNew));

    setCurrentView('dashboard');
    return true;
  };

  const logout = async () => {
    if (currentUser) {
      await logActivity("Cierre de Sesión", "Salida de la plataforma", currentUser.email);
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signout error:", e);
    }
    setCurrentUser(null);
    setRovReports([]); // Reset reports on logout
    setCurrentView('dashboard');
    setWaNotifications([]);
  };

  const setSelectedCenterById = (id: string) => {
    const found = centers.find(c => c.id === id);
    if (found) {
      setSelectedCenter(found);
    }
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const addWaRule = (rule: Omit<WhatsAppRule, 'id'>) => {
    const newRule: WhatsAppRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    setWaRules(prev => [...prev, newRule]);
  };

  const toggleWaRule = (id: string) => {
    setWaRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, active: !rule.active } : rule
    ));
  };

  const deleteWaRule = (id: string) => {
    setWaRules(prev => prev.filter(rule => rule.id !== id));
  };

  const triggerWaNotification = (message: string, recipient: string, sender: 'user' | 'bot' = 'bot') => {
    const newNotification: WhatsAppNotification = {
      id: `notification-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      recipient,
      message,
      status: 'sent',
      sender
    };
    setWaNotifications(prev => [newNotification, ...prev]);

    // local only alert processing

    // Simulate WhatsApp status changes (Sent -> Delivered -> Read)
    setTimeout(() => {
      setWaNotifications(prev => prev.map(n => 
        n.id === newNotification.id ? { ...n, status: 'delivered' } : n
      ));
    }, 1500);

    setTimeout(() => {
      setWaNotifications(prev => prev.map(n => 
        n.id === newNotification.id ? { ...n, status: 'read' } : n
      ));
    }, 3000);
  };

  // Phone and Email Modal states
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneModalMessage, setPhoneModalMessage] = useState('');
  
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{
    id: string;
    nombre: string;
    fecha: string;
    jefeCentro: string;
    piloto: string;
    empresa: string;
    puerto: string;
    redes: string;
    recipientEmail: string;
    findings?: ROVFinding[];
  } | null>(null);

  const openPhoneModal = (message: string) => {
    setPhoneModalMessage(message);
    setIsPhoneModalOpen(true);
  };

  const openEmailModal = (report: any, email: string) => {
    setEmailModalData({
      ...report,
      recipientEmail: email
    });
    setIsEmailModalOpen(true);
  };

  // Allow manual toggle to simulate telemetry stress in demo
  const simulateTelemetryUpdate = () => {
    setCenters(prevCenters => 
      prevCenters.map(center => {
        if (center.id === selectedCenter.id) {
          // Increase currents, raise mooring tension, decrease oxygen, degrade cage 103 net
          return {
            ...center,
            waterParams: {
              ...center.waterParams,
              dissolvedOxygen: 5.1, // low oxygen trigger
              currentSpeed: 2.8 // high current
            },
            cages: center.cages.map(cage => {
              if (cage.id.endsWith('103')) {
                return {
                  ...cage,
                  netIntegrity: 62.4, // critical drop
                  mooringTensionKn: 135.2, // extreme tension
                  status: 'critical'
                };
              }
              return cage;
            })
          };
        }
        return center;
      })
    );
  };

  const deleteCenter = (id: string) => {
    setCenters(prev => prev.filter(c => c.id !== id));
    logActivity("Eliminación de Centro", `ID del Centro: ${id}`);
  };

  const deleteUser = (email: string) => {
    setUsersList(prev => prev.filter(u => u.email !== email));
    logActivity("Eliminación de Operador", `Correo: ${email}`);
  };

  const deleteRovReport = async (id: string) => {
    setRovReports(prev => prev.filter(r => r.id !== id));
    await logActivity("Eliminación de Informe", `ID del Informe: ${id}`);

    try {
      const { error } = await supabase
        .from('rov_reports')
        .delete()
        .eq('id', id);
      if (error) {
        console.warn("Could not delete report from Supabase table:", error.message);
      }
    } catch (err) {
      console.warn("Failed to delete report from Supabase:", err);
    }
  };

  const changeUserPassword = (email: string, newPasswordId: string) => {
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, password: newPasswordId } : u));
    logActivity("Restablecer Contraseña", `Usuario: ${email}`);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentView,
      selectedCenter,
      centers: filteredCenters,
      activeAlerts,
      waRules,
      waNotifications,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      rovReports,
      addRovReport,
      login,
      logout,
      setCurrentView,
      setSelectedCenterById,
      acknowledgeAlert,
      addWaRule,
      toggleWaRule,
      deleteWaRule,
      triggerWaNotification,
      simulateTelemetryUpdate,
      registerUserAndCenter,
      deleteCenter,
      aiSettings,
      setAiSettings,
      whatsAppSettings,
      setWhatsAppSettings,
      usersList,
      deleteUser,
      deleteRovReport,
      changeUserPassword,
      activities,
      logActivity,
      activeTab,
      setActiveTab,
      isPhoneModalOpen,
      setIsPhoneModalOpen,
      phoneModalMessage,
      openPhoneModal,
      isEmailModalOpen,
      setIsEmailModalOpen,
      emailModalData,
      openEmailModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
