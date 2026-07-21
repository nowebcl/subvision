export interface NetDetail {
  nombre: string;
  tipo: 'Pecera' | 'Lobera' | 'Antipájaro' | 'Secundaria';
  ojoMallaMm: number;
  profundidadMts: number;
  estado: 'Óptimo' | 'Biofouling' | 'Desgaste' | 'Rotura';
}

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
  netsCount: number;
  nets: NetDetail[];
  reportSummary: {
    reportId: string;
    fecha: string;
    titulo: string;
    piloto: string;
    hallazgoClave: string;
    profundidadMts: number;
    nivelBiofouling: string;
    estadoCosturas: string;
  };
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
      {
        id: 'h-101',
        name: 'Módulo 101',
        species: 'Salmón Atlántico',
        count: 45000,
        avgWeightKg: 4.2,
        biomassTons: 189,
        netIntegrity: 98.4,
        mooringTensionKn: 42.1,
        lastCleaned: '2026-07-01',
        status: 'optimal',
        netsCount: 4,
        nets: [
          { nombre: 'Malla Pecera Nylon Sin Nudo', tipo: 'Pecera', ojoMallaMm: 25, profundidadMts: 20, estado: 'Óptimo' },
          { nombre: 'Red Lobera HDPE Alta Densidad', tipo: 'Lobera', ojoMallaMm: 80, profundidadMts: 25, estado: 'Óptimo' },
          { nombre: 'Malla Antipájaro Perimetral', tipo: 'Antipájaro', ojoMallaMm: 50, profundidadMts: 3, estado: 'Óptimo' },
          { nombre: 'Red Colectora de Fondo', tipo: 'Secundaria', ojoMallaMm: 30, profundidadMts: 22, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-pilpilehue-2',
          fecha: '2026-07-19',
          titulo: 'AUDITORÍA INTEGRAL 4 MALLAS MÓDULO 101',
          piloto: 'Cristian Barcena Córdova (Piloto ROV)',
          hallazgoClave: 'Sin anomalías estructurales en las 4 mallas instaladas. Costuras inferiores alineadas.',
          profundidadMts: 22,
          nivelBiofouling: 'Bajo (1.8% alga verde)',
          estadoCosturas: 'Tensión nominal homogénea'
        }
      },
      {
        id: 'h-102',
        name: 'Módulo 102',
        species: 'Salmón Atlántico',
        count: 38200,
        avgWeightKg: 4.8,
        biomassTons: 183.3,
        netIntegrity: 86.5,
        mooringTensionKn: 88.3,
        lastCleaned: '2026-06-12',
        status: 'warning',
        netsCount: 3,
        nets: [
          { nombre: 'Malla Pecera Nylon 28mm', tipo: 'Pecera', ojoMallaMm: 28, profundidadMts: 18, estado: 'Biofouling' },
          { nombre: 'Red Lobera HDPE 80mm', tipo: 'Lobera', ojoMallaMm: 80, profundidadMts: 22, estado: 'Óptimo' },
          { nombre: 'Malla Antipájaro 50mm', tipo: 'Antipájaro', ojoMallaMm: 50, profundidadMts: 3, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-pilpilehue-5',
          fecha: '2026-07-16',
          titulo: 'INSPECCIÓN DE BIOFOULING Y UNIONES MÓDULO 102',
          piloto: 'Carlos Varas',
          hallazgoClave: 'Adherencia de hidrozoos y alga en paño norte a -12m. Se sugiere lavado preventivo en 72h.',
          profundidadMts: 18,
          nivelBiofouling: 'Moderado (18.4% hidrozoos)',
          estadoCosturas: 'Desgaste preventivo en cuadrante N'
        }
      },
      {
        id: 'h-103',
        name: 'Módulo 103',
        species: 'Salmón Atlántico',
        count: 42000,
        avgWeightKg: 4.6,
        biomassTons: 193.2,
        netIntegrity: 74.2,
        mooringTensionKn: 148.9,
        lastCleaned: '2026-05-20',
        status: 'critical',
        netsCount: 2,
        nets: [
          { nombre: 'Malla Pecera Ultra-Dyneema 32mm', tipo: 'Pecera', ojoMallaMm: 32, profundidadMts: 25, estado: 'Rotura' },
          { nombre: 'Red Lobera HDPE 90mm', tipo: 'Lobera', ojoMallaMm: 90, profundidadMts: 28, estado: 'Desgaste' }
        ],
        reportSummary: {
          reportId: 'r-pilpilehue-today',
          fecha: '2026-07-21',
          titulo: 'REPORTE CRÍTICO ROV: DESGARRO Y FONDEO MÓDULO 103',
          piloto: 'Cristian Barcena Córdova (Piloto ROV)',
          hallazgoClave: 'Desgarro vertical de 1.2m en paño de fondo pecera a -20m. Tensión crítica de fondeo en 148.9 kN.',
          profundidadMts: 25,
          nivelBiofouling: 'Alto (34.2% alga filosa)',
          estadoCosturas: 'Falla severa en cabo tensor'
        }
      }
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
      {
        id: 'a-301',
        name: 'Módulo 301',
        species: 'Trucha Arcoíris',
        count: 50000,
        avgWeightKg: 2.8,
        biomassTons: 140,
        netIntegrity: 99.0,
        mooringTensionKn: 55.4,
        lastCleaned: '2026-07-04',
        status: 'optimal',
        netsCount: 4,
        nets: [
          { nombre: 'Malla Pecera Truchera 20mm', tipo: 'Pecera', ojoMallaMm: 20, profundidadMts: 15, estado: 'Óptimo' },
          { nombre: 'Red Lobera HDPE 80mm', tipo: 'Lobera', ojoMallaMm: 80, profundidadMts: 20, estado: 'Óptimo' },
          { nombre: 'Malla Antipájaro 45mm', tipo: 'Antipájaro', ojoMallaMm: 45, profundidadMts: 3, estado: 'Óptimo' },
          { nombre: 'Malla Sombra Térmica 10mm', tipo: 'Secundaria', ojoMallaMm: 10, profundidadMts: 5, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-apiao-301',
          fecha: '2026-07-18',
          titulo: 'AUDITORÍA ESTRACTURAL 4 MALLAS MÓDULO 301',
          piloto: 'Hugo Díaz',
          hallazgoClave: 'Paños y mallas impecables sin biofouling. Cabos de tensión en rango normal.',
          profundidadMts: 20,
          nivelBiofouling: 'Mínimo (1.0%)',
          estadoCosturas: 'Conforme 100%'
        }
      },
      {
        id: 'a-302',
        name: 'Módulo 302',
        species: 'Trucha Arcoíris',
        count: 47800,
        avgWeightKg: 3.0,
        biomassTons: 143.4,
        netIntegrity: 88.1,
        mooringTensionKn: 92.0,
        lastCleaned: '2026-06-28',
        status: 'warning',
        netsCount: 2,
        nets: [
          { nombre: 'Malla Pecera Truchera 22mm', tipo: 'Pecera', ojoMallaMm: 22, profundidadMts: 18, estado: 'Biofouling' },
          { nombre: 'Red Lobera HDPE 80mm', tipo: 'Lobera', ojoMallaMm: 80, profundidadMts: 22, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-apiao-302',
          fecha: '2026-07-15',
          titulo: 'MONITOREO DE MITÍLIDOS Y PAÑOS MÓDULO 302',
          piloto: 'Carlos Varas',
          hallazgoClave: 'Incrustación de mitílidos (choritos) en el anillo de flotación a -8m. Sin roturas.',
          profundidadMts: 18,
          nivelBiofouling: 'Moderado (14.1% mitílidos)',
          estadoCosturas: 'Tensión aceptable'
        }
      },
      {
        id: 'a-303',
        name: 'Módulo 303',
        species: 'Trucha Arcoíris',
        count: 48000,
        avgWeightKg: 3.1,
        biomassTons: 148.8,
        netIntegrity: 71.5,
        mooringTensionKn: 135.2,
        lastCleaned: '2026-06-25',
        status: 'critical',
        netsCount: 3,
        nets: [
          { nombre: 'Malla Pecera Truchera 24mm', tipo: 'Pecera', ojoMallaMm: 24, profundidadMts: 20, estado: 'Desgaste' },
          { nombre: 'Red Lobera HDPE 90mm', tipo: 'Lobera', ojoMallaMm: 90, profundidadMts: 24, estado: 'Rotura' },
          { nombre: 'Malla Antipájaro 50mm', tipo: 'Antipájaro', ojoMallaMm: 50, profundidadMts: 3, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-apiao-303',
          fecha: '2026-07-20',
          titulo: 'REPORTE ALERTA ROV: FISURA DE UNIÓN MÓDULO 303',
          piloto: 'Cristian Barcena Córdova (Piloto ROV)',
          hallazgoClave: 'Fisura en cabo de unión de red lobera con riesgo de desgarro en paño pecera.',
          profundidadMts: 24,
          nivelBiofouling: 'Severo (28.5% algas filosas)',
          estadoCosturas: 'Atención prioritaria'
        }
      }
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
      {
        id: 'q-401',
        name: 'Módulo 401',
        species: 'Salmón Coho',
        count: 60000,
        avgWeightKg: 3.5,
        biomassTons: 210,
        netIntegrity: 97.8,
        mooringTensionKn: 78.4,
        lastCleaned: '2026-07-02',
        status: 'optimal',
        netsCount: 3,
        nets: [
          { nombre: 'Malla Pecera Coho 35mm', tipo: 'Pecera', ojoMallaMm: 35, profundidadMts: 22, estado: 'Óptimo' },
          { nombre: 'Red Lobera HDPE 85mm', tipo: 'Lobera', ojoMallaMm: 85, profundidadMts: 26, estado: 'Óptimo' },
          { nombre: 'Malla Antipájaro 50mm', tipo: 'Antipájaro', ojoMallaMm: 50, profundidadMts: 3, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-quellon-401',
          fecha: '2026-07-14',
          titulo: 'CERTIFICACIÓN ROV PRE-COSECHA MÓDULO 401',
          piloto: 'Hugo Díaz',
          hallazgoClave: 'Paños y mallas limpias sin incrustaciones. Óptima tracción estructural.',
          profundidadMts: 26,
          nivelBiofouling: 'Bajo (2.8%)',
          estadoCosturas: 'Sin novedades'
        }
      },
      {
        id: 'q-402',
        name: 'Módulo 402',
        species: 'Salmón Coho',
        count: 56200,
        avgWeightKg: 3.8,
        biomassTons: 213.5,
        netIntegrity: 84.2,
        mooringTensionKn: 115.0,
        lastCleaned: '2026-06-18',
        status: 'warning',
        netsCount: 2,
        nets: [
          { nombre: 'Malla Pecera Coho 35mm', tipo: 'Pecera', ojoMallaMm: 35, profundidadMts: 20, estado: 'Biofouling' },
          { nombre: 'Red Lobera HDPE 85mm', tipo: 'Lobera', ojoMallaMm: 85, profundidadMts: 24, estado: 'Óptimo' }
        ],
        reportSummary: {
          reportId: 'r-quellon-402',
          fecha: '2026-07-12',
          titulo: 'INSPECCIÓN DE ALGAS ROJAS MÓDULO 402',
          piloto: 'Carlos Varas',
          hallazgoClave: 'Acumulación de alga roja en paño inferior este a -16m. Lavado necesario.',
          profundidadMts: 20,
          nivelBiofouling: 'Alto (22.3% alga roja)',
          estadoCosturas: 'Revisión recomendada'
        }
      },
      {
        id: 'q-403',
        name: 'Módulo 403',
        species: 'Salmón Coho',
        count: 61000,
        avgWeightKg: 3.3,
        biomassTons: 201.3,
        netIntegrity: 68.9,
        mooringTensionKn: 162.4,
        lastCleaned: '2026-06-10',
        status: 'critical',
        netsCount: 4,
        nets: [
          { nombre: 'Malla Pecera Coho 38mm', tipo: 'Pecera', ojoMallaMm: 38, profundidadMts: 25, estado: 'Desgaste' },
          { nombre: 'Red Lobera HDPE 95mm', tipo: 'Lobera', ojoMallaMm: 95, profundidadMts: 30, estado: 'Rotura' },
          { nombre: 'Malla Antipájaro 50mm', tipo: 'Antipájaro', ojoMallaMm: 50, profundidadMts: 3, estado: 'Óptimo' },
          { nombre: 'Red Secundaria Guía Fondeo', tipo: 'Secundaria', ojoMallaMm: 40, profundidadMts: 28, estado: 'Desgaste' }
        ],
        reportSummary: {
          reportId: 'r-quellon-403',
          fecha: '2026-07-17',
          titulo: 'AUDITORÍA CRÍTICA ROV: ROTURA LOBERA MÓDULO 403',
          piloto: 'Cristian Barcena Córdova (Piloto ROV)',
          hallazgoClave: 'Rotura abrasiva en red lobera a -28m por rozamiento con línea tensor F1 (162.4 kN).',
          profundidadMts: 30,
          nivelBiofouling: 'Severo (41.0%)',
          estadoCosturas: 'Falla crítica de tracción'
        }
      }
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
