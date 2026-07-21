export interface CageData {
  id: string;
  name: string;
  species: string;
  count: number;
  avgWeightKg: number;
  biomassTons: number;
  netIntegrity: number; // in %
  mooringTensionKn: number; // in kN
  lastCleaned: string;
  status: 'optimal' | 'warning' | 'critical';
}

export interface WaterParameters {
  temperature: number; // °C
  dissolvedOxygen: number; // mg/L
  ph: number;
  salinity: number; // psu
  currentSpeed: number; // knots
}

export interface MooringLine {
  id: string;
  code: string;
  tensionKn: number;
  limitKn: number;
  angle: number; // degrees
  status: 'optimal' | 'warning' | 'critical';
}

export interface AquacultureCenter {
  id: string;
  name: string;
  location: string;
  region: string;
  coordinates: string;
  cages: CageData[];
  mooringLines: MooringLine[];
  waterParams: WaterParameters;
  historicalOxygen: { time: string; value: number }[];
  historicalCurrent: { time: string; value: number }[];
}

export const mockUser = {
  email: 'operador@servirov.cl',
  password: 'ClaveSeguraSubvision123!',
  name: 'Operador Subvision',
  role: 'Supervisor de Operaciones Marítimas',
  avatar: 'OS',
  company: 'SERVIROV'
};

export const initialUsersList = [
  {
    email: 'operador@servirov.cl',
    password: 'ClaveSeguraSubvision123!',
    name: 'Operador Subvision',
    role: 'Supervisor de Operaciones Marítimas',
    avatar: 'OS',
    company: 'SERVIROV'
  },
  {
    email: 'admin@servirov.cl',
    password: 'ClaveAdminSubvision789!',
    name: 'Administrador General',
    role: 'admin',
    avatar: 'AG',
    company: 'SERVIROV'
  },
  {
    email: 'piloto@servirov.cl',
    password: 'ClavePiloto123!',
    name: 'Cristian Barcena Córdova (Piloto ROV)',
    role: 'Piloto ROV',
    avatar: 'CB',
    company: 'SERVIROV'
  },
  {
    email: 'cliente@servirov.cl',
    password: 'ClaveCliente123!',
    name: 'CLIENTE',
    role: 'Cliente',
    avatar: 'CL',
    company: 'SalmonChile / MultiX / Camanchaca'
  }
];

export const aquacultureCenters: AquacultureCenter[] = [
  {
    id: 'centro-pilpilehue',
    name: 'Centro Pilpilehue',
    location: 'Canal de Dalcahue, Chiloé',
    region: 'Región de Los Lagos',
    coordinates: '42°23\'10" S, 73°08\'30" W',
    waterParams: {
      temperature: 11.4,
      dissolvedOxygen: 7.8,
      ph: 8.1,
      salinity: 31.2,
      currentSpeed: 1.2
    },
    cages: [
      { id: 'h-101', name: 'Módulo 101', species: 'Salmón Atlántico', count: 45000, avgWeightKg: 4.2, biomassTons: 189, netIntegrity: 98.4, mooringTensionKn: 42.1, lastCleaned: '2026-07-01', status: 'optimal' },
      { id: 'h-102', name: 'Módulo 102', species: 'Salmón Atlántico', count: 43500, avgWeightKg: 4.3, biomassTons: 187, netIntegrity: 96.1, mooringTensionKn: 39.8, lastCleaned: '2026-07-02', status: 'optimal' },
      { id: 'h-103', name: 'Módulo 103', species: 'Salmón Atlántico', count: 42000, avgWeightKg: 4.6, biomassTons: 193.2, netIntegrity: 74.2, mooringTensionKn: 148.9, lastCleaned: '2026-05-20', status: 'critical' }
    ],
    mooringLines: [
      { id: 'm-h1', code: 'Línea de Fondeo A1', tensionKn: 85.3, limitKn: 120.0, angle: 45, status: 'optimal' },
      { id: 'm-h2', code: 'Línea de Fondeo A2', tensionKn: 92.4, limitKn: 120.0, angle: 135, status: 'optimal' },
      { id: 'm-h3', code: 'Línea de Fondeo B1', tensionKn: 114.7, limitKn: 150.0, angle: 225, status: 'warning' },
      { id: 'm-h4', code: 'Línea de Fondeo B2', tensionKn: 148.9, limitKn: 150.0, angle: 315, status: 'critical' }
    ],
    historicalOxygen: [
      { time: '08:00', value: 8.2 },
      { time: '10:00', value: 8.1 },
      { time: '12:00', value: 7.9 },
      { time: '14:00', value: 7.8 },
      { time: '16:00', value: 7.6 },
      { time: '18:00', value: 7.8 },
      { time: '20:00', value: 8.0 }
    ],
    historicalCurrent: [
      { time: '08:00', value: 0.8 },
      { time: '10:00', value: 1.0 },
      { time: '12:00', value: 1.3 },
      { time: '14:00', value: 1.5 },
      { time: '16:00', value: 1.2 },
      { time: '18:00', value: 0.9 },
      { time: '20:00', value: 0.7 }
    ]
  },
  {
    id: 'centro-apiao',
    name: 'Centro Apiao',
    location: 'Chiloé Central',
    region: 'Región de Los Lagos',
    coordinates: '42°35\'18" S, 73°14\'52" W',
    waterParams: {
      temperature: 10.8,
      dissolvedOxygen: 8.4,
      ph: 8.0,
      salinity: 32.5,
      currentSpeed: 1.8
    },
    cages: [
      { id: 'a-301', name: 'Módulo 301', species: 'Trucha Arcoíris', count: 50000, avgWeightKg: 2.8, biomassTons: 140, netIntegrity: 99.0, mooringTensionKn: 55.4, lastCleaned: '2026-07-04', status: 'optimal' },
      { id: 'a-302', name: 'Módulo 302', species: 'Trucha Arcoíris', count: 49500, avgWeightKg: 2.9, biomassTons: 143.5, netIntegrity: 98.2, mooringTensionKn: 53.1, lastCleaned: '2026-07-05', status: 'optimal' },
      { id: 'a-303', name: 'Módulo 303', species: 'Trucha Arcoíris', count: 48000, avgWeightKg: 3.1, biomassTons: 148.8, netIntegrity: 74.2, mooringTensionKn: 135.2, lastCleaned: '2026-06-25', status: 'critical' }
    ],
    mooringLines: [
      { id: 'm-a1', code: 'Línea de Fondeo C1', tensionKn: 98.1, limitKn: 150.0, angle: 45, status: 'optimal' },
      { id: 'm-a2', code: 'Línea de Fondeo C2', tensionKn: 102.5, limitKn: 150.0, angle: 135, status: 'optimal' },
      { id: 'm-a3', code: 'Línea de Fondeo D1', tensionKn: 135.2, limitKn: 150.0, angle: 225, status: 'warning' },
      { id: 'm-a4', code: 'Línea de Fondeo D2', tensionKn: 95.6, limitKn: 150.0, angle: 315, status: 'optimal' }
    ],
    historicalOxygen: [
      { time: '08:00', value: 8.6 },
      { time: '10:00', value: 8.5 },
      { time: '12:00', value: 8.4 },
      { time: '14:00', value: 8.3 },
      { time: '16:00', value: 8.4 },
      { time: '18:00', value: 8.5 },
      { time: '20:00', value: 8.6 }
    ],
    historicalCurrent: [
      { time: '08:00', value: 1.2 },
      { time: '10:00', value: 1.4 },
      { time: '12:00', value: 1.7 },
      { time: '14:00', value: 2.1 },
      { time: '16:00', value: 1.8 },
      { time: '18:00', value: 1.3 },
      { time: '20:00', value: 1.1 }
    ]
  },
  {
    id: 'centro-quellon',
    name: 'Centro Quellón',
    location: 'Sur de Chiloé',
    region: 'Región de Los Lagos',
    coordinates: '43°09\'05" S, 73°36\'40" W',
    waterParams: {
      temperature: 10.2,
      dissolvedOxygen: 8.9,
      ph: 7.9,
      salinity: 33.1,
      currentSpeed: 2.1
    },
    cages: [
      { id: 'q-401', name: 'Módulo 401', species: 'Salmón Coho', count: 60000, avgWeightKg: 3.5, biomassTons: 210, netIntegrity: 97.8, mooringTensionKn: 78.4, lastCleaned: '2026-07-02', status: 'optimal' },
      { id: 'q-402', name: 'Módulo 402', species: 'Salmón Coho', count: 58500, avgWeightKg: 3.6, biomassTons: 210.6, netIntegrity: 98.5, mooringTensionKn: 74.6, lastCleaned: '2026-07-03', status: 'optimal' },
      { id: 'q-403', name: 'Módulo 403', species: 'Salmón Coho', count: 61000, avgWeightKg: 3.3, biomassTons: 201.3, netIntegrity: 74.2, mooringTensionKn: 162.4, lastCleaned: '2026-06-18', status: 'critical' }
    ],
    mooringLines: [
      { id: 'm-q1', code: 'Línea de Fondeo E1', tensionKn: 110.2, limitKn: 180.0, angle: 45, status: 'optimal' },
      { id: 'm-q2', code: 'Línea de Fondeo E2', tensionKn: 125.6, limitKn: 180.0, angle: 135, status: 'optimal' },
      { id: 'm-q3', code: 'Línea de Fondeo F1', tensionKn: 162.4, limitKn: 180.0, angle: 225, status: 'warning' },
      { id: 'm-q4', code: 'Línea de Fondeo F2', tensionKn: 108.9, limitKn: 180.0, angle: 315, status: 'optimal' }
    ],
    historicalOxygen: [
      { time: '08:00', value: 9.1 },
      { time: '10:00', value: 9.0 },
      { time: '12:00', value: 8.9 },
      { time: '14:00', value: 8.8 },
      { time: '16:00', value: 8.9 },
      { time: '18:00', value: 9.0 },
      { time: '20:00', value: 9.1 }
    ],
    historicalCurrent: [
      { time: '08:00', value: 1.5 },
      { time: '10:00', value: 1.8 },
      { time: '12:00', value: 2.2 },
      { time: '14:00', value: 2.5 },
      { time: '16:00', value: 2.1 },
      { time: '18:00', value: 1.6 },
      { time: '20:00', value: 1.4 }
    ]
  }
];

export interface SystemAlert {
  id: string;
  centerId: string;
  source: string;
  type: 'integrity' | 'mooring' | 'water';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export const initialAlerts: SystemAlert[] = [
  {
    id: 'alert-1',
    centerId: 'centro-pilpilehue',
    source: 'Módulo 103',
    type: 'integrity',
    message: 'Integridad de malla degradada por debajo del umbral mínimo de seguridad (74.2%)',
    severity: 'critical',
    timestamp: 'Hace 12 min',
    acknowledged: false
  },
  {
    id: 'alert-2',
    centerId: 'centro-pilpilehue',
    source: 'Línea de Fondeo B2',
    type: 'mooring',
    message: 'Tensión de línea en nivel crítico (148.9 kN / Límite 150 kN)',
    severity: 'critical',
    timestamp: 'Hace 5 min',
    acknowledged: false
  },
  {
    id: 'alert-3',
    centerId: 'centro-apiao',
    source: 'Módulo 203',
    type: 'integrity',
    message: 'Nivel de integridad de malla en nivel crítico (74.2%)',
    severity: 'critical',
    timestamp: 'Hace 45 min',
    acknowledged: false
  },
  {
    id: 'alert-4',
    centerId: 'centro-quellon',
    source: 'Módulo 303',
    type: 'integrity',
    message: 'Integridad de malla en nivel de alerta crítica (74.2%)',
    severity: 'critical',
    timestamp: 'Hace 1 hora',
    acknowledged: false
  }
];

export interface WhatsAppRule {
  id: string;
  centerId: string;
  parameter: 'integrity' | 'mooring' | 'oxygen' | 'current';
  condition: 'less_than' | 'greater_than';
  threshold: number;
  recipient: string;
  active: boolean;
}

export const initialWaRules: WhatsAppRule[] = [
  {
    id: 'rule-1',
    centerId: 'centro-pilpilehue',
    parameter: 'integrity',
    condition: 'less_than',
    threshold: 85,
    recipient: '+56 9 9629 9010 (Andrés Mansilla)',
    active: true
  },
  {
    id: 'rule-2',
    centerId: 'centro-pilpilehue',
    parameter: 'mooring',
    condition: 'greater_than',
    threshold: 120,
    recipient: '+56 9 9629 9010 (Andrés Mansilla)',
    active: true
  },
  {
    id: 'rule-3',
    centerId: 'centro-pilpilehue',
    parameter: 'oxygen',
    condition: 'less_than',
    threshold: 5.5,
    recipient: '+56 9 9629 9010 (Andrés Mansilla)',
    active: false
  }
];

export interface WhatsAppNotification {
  id: string;
  timestamp: string;
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  sender?: 'user' | 'bot';
}
