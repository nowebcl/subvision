import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Waves, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  FileText,
  User,
  Building2,
  FileDown,
  Eye,
  Smartphone,
  Mail
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    selectedCenter, 
    activeAlerts, 
    acknowledgeAlert, 
    rovReports, 
    addRovReport,
    currentUser,
    centers,
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
    activeTab,
    setActiveTab,
    openPhoneModal,
    openEmailModal
  } = useApp();

  const canAccessCliente = currentUser && (currentUser.role === 'Cliente' || currentUser.role === 'admin' || currentUser.email === 'admin@servirov.cl');
  const canAccessAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@servirov.cl' || currentUser.email === 'operador@servirov.cl');

  // Ensure Pilot cannot access Client or Admin tabs
  useEffect(() => {
    if (activeTab === 'cliente' && !canAccessCliente) {
      setActiveTab('rov');
    }
    if (activeTab === 'admin' && !canAccessAdmin) {
      setActiveTab('rov');
    }
  }, [activeTab, canAccessCliente, canAccessAdmin, setActiveTab]);

  const isRealPilot = (u: any) => u.role !== 'Cliente' && u.role !== 'admin' && !u.role.toLowerCase().includes('supervisor') && u.email !== 'admin@servirov.cl' && u.email !== 'operador@servirov.cl';
  const isRealPilotName = (name: string) => name && name !== 'Operador Subvision' && name !== 'Administrador General' && !name.toLowerCase().includes('admin') && !name.toLowerCase().includes('supervisor');

  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [emailPromptReport, setEmailPromptReport] = useState<any>(null);
  const [emailPromptInput, setEmailPromptInput] = useState('amansilla@servirov.cl');
  
  // Dashboard Tabs
  const [selectedOperatorEmail, setSelectedOperatorEmail] = useState<string | null>(null);
  const [adminNewPasswordInput, setAdminNewPasswordInput] = useState('');

  // ROV Table Filters & Search
  const [pilotFilter, setPilotFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // New Report Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFecha, setFormFecha] = useState(new Date().toISOString().substring(0, 10));
  const [formNombre, setFormNombre] = useState('INFORME DIARIO');
  const [formJefe, setFormJefe] = useState('NN');
  const [formPiloto, setFormPiloto] = useState('');
  const [formEmpresa, setFormEmpresa] = useState('SERVIROV');
  const [formPuerto, setFormPuerto] = useState<'Abierto' | 'Cerrado'>('Abierto');
  const [formRedes, setFormRedes] = useState('RED LOBERA; REDES PECERAS;');

  const [hoveredOxygenPoint, setHoveredOxygenPoint] = useState<{ x: string; y: number } | null>(null);

  const handleDeleteCenter = (centerId: string, centerName: string) => {
    if (window.confirm(`¿Está seguro que desea eliminar el centro "${centerName}"?`)) {
      deleteCenter(centerId);
    }
  };

  const handleDeleteUser = (email: string, name: string) => {
    if (email === currentUser?.email) {
      alert("No puede eliminar su propio perfil de administrador.");
      return;
    }
    if (window.confirm(`¿Está seguro que desea eliminar al operador/piloto "${name}" (${email})?`)) {
      deleteUser(email);
    }
  };  // PDF Export single report function
  const handleExportSinglePdf = (report: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build findings array
    let textDesc = `${report.nombre} ${report.redes}`.toLowerCase();
    let cageId = '103';
    if (textDesc.includes('101')) cageId = '101';
    else if (textDesc.includes('102')) cageId = '102';
    else if (textDesc.includes('104')) cageId = '104';
    else if (textDesc.includes('105')) cageId = '105';
    else if (textDesc.includes('106')) cageId = '106';
    else if (textDesc.includes('107')) cageId = '107';
    else if (textDesc.includes('108') || textDesc.includes('b2')) cageId = '108';
    else if (textDesc.includes('110')) cageId = '110';
    else if (textDesc.includes('112')) cageId = '112';

    let photoUrl = '/report_ins301.png';
    if (textDesc.includes('105') || textDesc.includes('rotura') || textDesc.includes('falla') || textDesc.includes('desgarro')) {
      photoUrl = '/report_pecera409.jpg';
    } else if (textDesc.includes('108') || textDesc.includes('b2') || textDesc.includes('anclaje')) {
      photoUrl = '/report_ins311.png';
    } else if (textDesc.includes('103')) {
      photoUrl = '/report_j303.png';
    }

    let clasificacion = 'Sin Hallazgos';
    if (textDesc.includes('rotura') || textDesc.includes('falla') || textDesc.includes('desgarro')) {
      clasificacion = 'Rotura de Red';
    } else if (textDesc.includes('tensión') || textDesc.includes('fondeo')) {
      clasificacion = 'Sobretensión Fondeo';
    } else if (textDesc.includes('algas') || textDesc.includes('biofouling')) {
      clasificacion = 'Biofouling Pesado';
    }

    let depth = '15';
    if (textDesc.includes('105')) depth = '12';
    else if (textDesc.includes('108') || textDesc.includes('b2')) depth = '24';
    else if (textDesc.includes('110')) depth = '18';

    const reportFindings = report.findings || [
      {
        id: 'f-fallback',
        jaula: cageId,
        seccion: textDesc.includes('lobera') ? 'Lobera' : 'Pecera',
        clasificacion: clasificacion,
        observacion: report.redes || report.nombre,
        fotoUrl: photoUrl,
        profundidad: depth + ' metros'
      }
    ];

    let findingsHtml = '';
    reportFindings.forEach((f: any, idx: number) => {
      const isRed = f.clasificacion === 'Rotura de Red';
      findingsHtml += `
        <h3 class="section-title">HALLAZGO #${idx + 1} - RED ${f.seccion.toUpperCase()} (JAULA ${f.jaula})</h3>
        <div class="report-row" style="margin-bottom: 25px;">
          <div class="left-col">
            <p><strong>IdPunto:</strong> ${39360 + parseInt(f.jaula) || 39368}</p>
            <p><strong>Jaula:</strong> ${f.jaula}</p>
            <p><strong>Sección Red:</strong> ${f.seccion}</p>
            <p><strong>Clasificación:</strong> ${f.clasificacion}</p>
            <p><strong>Profundidad:</strong> ${f.profundidad}</p>
            <p><strong>Observación:</strong> ${f.observacion.toUpperCase()}</p>
            <p><strong>Conjunto:</strong> 300</p>
          </div>
          <div class="right-col">
            <img src="${f.fotoUrl}" style="border: ${isRed ? '2px solid #ef4444' : '1px solid #cbd5e1'}" />
            <div class="overlay-timestamp">${report.fecha} 12:31:54 J${f.jaula} -41 OC 0 0.0M</div>
          </div>
        </div>
      `;
    });



    printWindow.document.write(`
      <html>
        <head>
          <title>INFORME DE INSPECCIÓN SUBMARINA - ${report.fecha}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              font-size: 10px;
              line-height: 1.5;
              background-color: #ffffff;
              margin: 0;
              padding: 10px;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-text {
              font-size: 16px;
              font-weight: 800;
              color: #0369a1;
              letter-spacing: 0.5px;
            }
            .header-title-area {
              text-align: right;
            }
            .header-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
            }
            .header-subtitle {
              font-size: 10px;
              font-weight: 700;
              color: #475569;
              margin: 4px 0 0 0;
              text-transform: uppercase;
            }
            .summary-box {
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              margin-bottom: 15px;
              overflow: hidden;
            }
            .summary-title {
              background: #f1f5f9;
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              text-align: center;
              padding: 4px 0;
              margin: 0;
              border-bottom: 1px solid #cbd5e1;
              letter-spacing: 1px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              text-align: center;
            }
            .summary-col {
              padding: 6px 0;
            }
            .summary-col span {
              display: block;
              font-size: 7px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .summary-col p {
              margin: 0;
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
            }
            .summary-col:not(:last-child) {
              border-right: 1px solid #cbd5e1;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              padding: 10px 0;
              margin-bottom: 20px;
            }
            .meta-item {
              font-size: 9.5px;
              color: #475569;
            }
            .meta-item strong {
              color: #0f172a;
              font-weight: 700;
            }
            .section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
              margin: 15px 0;
              letter-spacing: 0.5px;
            }
            .report-row {
              display: flex;
              gap: 20px;
              margin-top: 10px;
              page-break-inside: avoid;
            }
            .left-col {
              width: 40%;
              font-size: 9.5px;
              color: #475569;
              line-height: 1.6;
            }
            .left-col p {
              margin: 3px 0;
            }
            .left-col strong {
              color: #0f172a;
              font-weight: 700;
            }
            .right-col {
              width: 60%;
              position: relative;
              aspect-ratio: 16/9;
              background: #000;
              border-radius: 4px;
              overflow: hidden;
              border: 1px solid #cbd5e1;
            }
            .right-col img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .overlay-timestamp {
              position: absolute;
              top: 6px;
              left: 8px;
              font-family: monospace;
              font-size: 8.5px;
              color: #ffffff;
              background: rgba(0, 0, 0, 0.45);
              padding: 1px 5px;
              border-radius: 2px;
              letter-spacing: 0.5px;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 10px;
              right: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          <!-- Top Brand Header -->
          <div class="header-container">
            <div class="logo-area">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#0369a1" style="display: inline-block; vertical-align: middle;"><path d="M12 2L8.5 6.5L4 4L6.5 12H17.5L20 4L15.5 6.5L12 2ZM6.5 14H17.5V16H6.5V14ZM6.5 18H17.5V20H6.5V18Z"/></svg>
              <div style="line-height: 1;">
                <span class="logo-text">Camanchaca</span>
                <span style="font-size: 7px; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">SISTEMA ROV</span>
              </div>
            </div>
            <div class="header-title-area">
              <h1 class="header-title">Informe de Inspección Submarina</h1>
              <p class="header-subtitle">DETALLE DE HALLAZGOS DIARIOS</p>
            </div>
          </div>

          <!-- Resumen Box -->
          <div class="summary-box">
            <h4 class="summary-title">Resumen</h4>
            <div class="summary-grid">
              <div class="summary-col">
                <span>Red Lobera</span>
                <p>${reportFindings.filter((f: any) => f.seccion.toLowerCase().includes('lobera')).length}</p>
              </div>
              <div class="summary-col">
                <span>Red Pecera</span>
                <p>${reportFindings.filter((f: any) => f.seccion.toLowerCase().includes('pecera') || f.seccion.toLowerCase().includes('fondo') || f.seccion.toLowerCase().includes('lateral')).length}</p>
              </div>
              <div class="summary-col">
                <span>Mortalidad</span>
                <p>0</p>
              </div>
              <div class="summary-col">
                <span>Reticulado</span>
                <p>0</p>
              </div>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div class="meta-grid">
            <div class="meta-item"><strong>Fecha:</strong> ${report.fecha}</div>
            <div class="meta-item"><strong>Hora Ini Faena:</strong> 08:00</div>
            <div class="meta-item"><strong>Nombre Piloto:</strong> ${report.piloto.toUpperCase()}</div>
            <div class="meta-item"><strong>Centro:</strong> ${selectedCenter.name}</div>
            <div class="meta-item"><strong>Hora Fin Faena:</strong> 19:00</div>
            <div class="meta-item"><strong>Faenas Solicitadas:</strong> redes peceras;</div>
            <div class="meta-item"><strong>Estado Puerto:</strong> ${report.puerto.toLowerCase()}</div>
          </div>

          <!-- Dynamic Findings List -->
          ${findingsHtml}

          <!-- Footer -->
          <div class="footer">
            <span>Generado por Aquaforms.</span>
            <span>1/1</span>
            <span>${report.fecha} 20:10:50</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportTablePdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Summary counts
    let peceraCount = 0;
    let loberaCount = 0;
    let mortalidadCount = 0;
    let reticuladoCount = 0;

    filteredReports.forEach(r => {
      const textDesc = `${r.nombre} ${r.redes}`.toLowerCase();
      if (textDesc.includes('pecera') || textDesc.includes('malla')) peceraCount++;
      if (textDesc.includes('lobera') || textDesc.includes('cabezal')) loberaCount++;
      if (textDesc.includes('mortalidad')) mortalidadCount++;
    });

    // Chunk reports for page layout
    // Page 1 gets 3 reports
    // Sub-sequent pages get 4 reports each
    const pages = [];
    let currentIdx = 0;
    
    // Page 1
    pages.push(filteredReports.slice(currentIdx, currentIdx + 3));
    currentIdx += 3;
    
    // Rest of pages
    while (currentIdx < filteredReports.length) {
      pages.push(filteredReports.slice(currentIdx, currentIdx + 4));
      currentIdx += 4;
    }

    // Build pages HTML
    let pagesHtml = '';
    
    pages.forEach((pageReports, pageIdx) => {
      const isFirstPage = pageIdx === 0;
      let pageContent = '';

      if (isFirstPage) {
        // Render Full Header and Resumen
        pageContent += `
          <!-- Top Brand Header -->
          <div class="header-container">
            <div class="logo-area">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#0369a1" style="display: inline-block; vertical-align: middle;"><path d="M12 2L8.5 6.5L4 4L6.5 12H17.5L20 4L15.5 6.5L12 2ZM6.5 14H17.5V16H6.5V14ZM6.5 18H17.5V20H6.5V18Z"/></svg>
              <div style="line-height: 1;">
                <span class="logo-text">Camanchaca</span>
                <span style="font-size: 7px; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">SISTEMA ROV</span>
              </div>
            </div>
            <div class="header-title-area">
              <h1 class="header-title">Informe de Inspección Submarina</h1>
              <p class="header-subtitle">MORTALIDAD MODULO 300 Y 400</p>
            </div>
          </div>

          <!-- Resumen Box -->
          <div class="summary-box">
            <h4 class="summary-title">Resumen</h4>
            <div class="summary-grid">
              <div class="summary-col">
                <span>Red Lobera</span>
                <p>${loberaCount}</p>
              </div>
              <div class="summary-col">
                <span>Red Pecera</span>
                <p>${peceraCount}</p>
              </div>
              <div class="summary-col">
                <span>Mortalidad</span>
                <p>${mortalidadCount}</p>
              </div>
              <div class="summary-col">
                <span>Reticulado</span>
                <p>${reticuladoCount}</p>
              </div>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div class="meta-grid">
            <div class="meta-item"><strong>Fecha:</strong> ${filteredReports[0]?.fecha || '20/07/2026'}</div>
            <div class="meta-item"><strong>Hora Ini Faena:</strong> 08:00</div>
            <div class="meta-item"><strong>Nombre Piloto:</strong> ${filteredReports[0]?.piloto.toUpperCase() || 'MICHAEL MALDONADO'}</div>
            <div class="meta-item"><strong>Centro:</strong> ${selectedCenter.name}</div>
            <div class="meta-item"><strong>Hora Fin Faena:</strong> 19:00</div>
            <div class="meta-item"><strong>Faenas Solicitadas:</strong> redes peceras;</div>
            <div class="meta-item"><strong>Estado Puerto:</strong> ${filteredReports[0]?.puerto.toLowerCase() || 'abierto'}</div>
          </div>
        `;
      }

      // Page Title
      pageContent += `<h3 class="section-title">RED PECERA</h3>`;

      // Render rows
      pageReports.forEach(r => {
        const textDesc = `${r.nombre} ${r.redes}`.toLowerCase();
        let cageId = '301';
        if (textDesc.includes('101')) cageId = '101';
        else if (textDesc.includes('102')) cageId = '102';
        else if (textDesc.includes('103')) cageId = '103';
        else if (textDesc.includes('104')) cageId = '104';
        else if (textDesc.includes('105')) cageId = '105';
        else if (textDesc.includes('106')) cageId = '106';
        else if (textDesc.includes('107')) cageId = '107';
        else if (textDesc.includes('108') || textDesc.includes('b2')) cageId = '108';
        else if (textDesc.includes('110')) cageId = '110';
        else if (textDesc.includes('112')) cageId = '112';

        let photoUrl = '/report_ins301.png';
        if (textDesc.includes('105') || textDesc.includes('rotura') || textDesc.includes('falla') || textDesc.includes('desgarro')) {
          photoUrl = '/report_pecera409.jpg';
        } else if (textDesc.includes('108') || textDesc.includes('b2') || textDesc.includes('anclaje')) {
          photoUrl = '/report_ins311.png';
        } else if (textDesc.includes('103')) {
          photoUrl = '/report_j303.png';
        }

        let clasificacion = 'Sin Hallazgos';
        if (textDesc.includes('rotura') || textDesc.includes('falla') || textDesc.includes('desgarro')) {
          clasificacion = 'Rotura de Red';
        } else if (textDesc.includes('tensión') || textDesc.includes('fondeo')) {
          clasificacion = 'Sobretensión Fondeo';
        } else if (textDesc.includes('algas') || textDesc.includes('biofouling')) {
          clasificacion = 'Biofouling Pesado';
        }

        let depth = '15';
        if (textDesc.includes('105')) depth = '12';
        else if (textDesc.includes('108') || textDesc.includes('b2')) depth = '24';
        else if (textDesc.includes('110')) depth = '18';

        pageContent += `
          <div class="report-row">
            <div class="left-col">
              <p><strong>IdPunto:</strong> ${39360 + parseInt(cageId) || 39368}</p>
              <p><strong>Jaula:</strong> ${cageId}</p>
              <p><strong>Seccion Pecera:</strong> Fondo</p>
              <p><strong>Clasificación Hallazgo:</strong> ${clasificacion}</p>
              <p><strong>Profundidad:</strong> ${depth}</p>
              <p><strong>Observación:</strong> ${r.redes.toUpperCase()}</p>
              <p><strong>Conjunto:</strong> 300</p>
            </div>
            <div class="right-col">
              <img src="${photoUrl}" />
              <div class="overlay-timestamp">${r.fecha} 12:31:54 J${cageId} -41 OC 0 0.0M</div>
            </div>
          </div>
        `;
      });

      // Page Footer
      const totalPages = pages.length;
      pageContent += `
        <div class="footer">
          <span>Generado por Aquaforms.</span>
          <span>${pageIdx + 1}/${totalPages}</span>
          <span>${filteredReports[0]?.fecha || '2026-07-20'} 20:10:50</span>
        </div>
      `;

      // Wrap page content with page-break class
      pagesHtml += `
        <div class="${pageIdx < totalPages - 1 ? 'page-break' : ''}" style="position: relative; min-height: 277mm; box-sizing: border-box; padding-bottom: 20mm;">
          ${pageContent}
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Resumen Informes ROV - ${selectedCenter.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              font-size: 10px;
              line-height: 1.5;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-text {
              font-size: 16px;
              font-weight: 800;
              color: #0369a1;
              letter-spacing: 0.5px;
            }
            .header-title-area {
              text-align: right;
            }
            .header-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
            }
            .header-subtitle {
              font-size: 10px;
              font-weight: 700;
              color: #475569;
              margin: 4px 0 0 0;
              text-transform: uppercase;
            }
            .summary-box {
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              margin-bottom: 15px;
              overflow: hidden;
            }
            .summary-title {
              background: #f1f5f9;
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              text-align: center;
              padding: 4px 0;
              margin: 0;
              border-bottom: 1px solid #cbd5e1;
              letter-spacing: 1px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              text-align: center;
            }
            .summary-col {
              padding: 6px 0;
            }
            .summary-col span {
              display: block;
              font-size: 7px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .summary-col p {
              margin: 0;
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
            }
            .summary-col:not(:last-child) {
              border-right: 1px solid #cbd5e1;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              padding: 10px 0;
              margin-bottom: 20px;
            }
            .meta-item {
              font-size: 9.5px;
              color: #475569;
            }
            .meta-item strong {
              color: #0f172a;
              font-weight: 700;
            }
            .section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
              margin: 15px 0;
              letter-spacing: 0.5px;
            }
            .report-row {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .left-col {
              width: 40%;
              font-size: 9.5px;
              color: #475569;
              line-height: 1.6;
            }
            .left-col p {
              margin: 3px 0;
            }
            .left-col strong {
              color: #0f172a;
              font-weight: 700;
            }
            .right-col {
              width: 60%;
              position: relative;
              aspect-ratio: 16/9;
              background: #000;
              border-radius: 4px;
              overflow: hidden;
              border: 1px solid #cbd5e1;
            }
            .right-col img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .overlay-timestamp {
              position: absolute;
              top: 6px;
              left: 8px;
              font-family: monospace;
              font-size: 8.5px;
              color: #ffffff;
              background: rgba(0, 0, 0, 0.45);
              padding: 1px 5px;
              border-radius: 2px;
              letter-spacing: 0.5px;
            }
            .footer {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${pagesHtml}

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportClientPackagePdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let centersHtml = '';
    centers.forEach(c => {
      const cCages = c.cages.slice(0, 3);
      const cAvgNet = Number((cCages.reduce((acc, cg) => acc + cg.netIntegrity, 0) / (cCages.length || 1)).toFixed(1));
      centersHtml += `
        <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 12px; background: #f8fafc;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px;">🏢 ${c.name.toUpperCase()} (${c.location})</h4>
          <p style="margin: 2px 0; font-size: 11px; color: #475569;"><strong>Región:</strong> ${c.region} • <strong>Coordenadas:</strong> ${c.coordinates}</p>
          <p style="margin: 2px 0; font-size: 11px; color: #475569;"><strong>Parámetros Agua:</strong> Temp ${c.waterParams.temperature}°C, O2 ${c.waterParams.dissolvedOxygen} mg/L</p>
          <p style="margin: 2px 0; font-size: 11px; color: #475569;"><strong>Integridad Promedio Mallas:</strong> <span style="color: ${cAvgNet < 85 ? '#ef4444' : '#10b981'}; font-weight: bold;">${cAvgNet}%</span> (${cCages.length} Módulos)</p>
        </div>
      `;
    });

    let pilotsHtml = '';
    const pilots = usersList.filter(isRealPilot);
    pilots.forEach(p => {
      const pReports = rovReports.filter(r => r.piloto === p.name || r.userEmail === p.email).length;
      pilotsHtml += `
        <div style="border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #0f172a; font-size: 12px;">👨‍✈️ ${p.name}</strong>
            <span style="font-size: 10px; color: #64748b; display: block;">${p.role} • ${p.company}</span>
            <span style="font-size: 10px; color: #0284c7; font-family: monospace;">Contacto: ${p.email}</span>
          </div>
          <div style="text-align: right;">
            <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${pReports} Informes ROV</span>
          </div>
        </div>
      `;
    });

    let reportsSummaryHtml = '';
    rovReports.slice(0, 15).forEach(r => {
      reportsSummaryHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 6px; font-weight: bold; color: #334155;">${r.fecha}</td>
          <td style="padding: 6px; color: #0f172a; font-weight: 600;">${r.nombre}</td>
          <td style="padding: 6px; color: #475569;">${r.piloto}</td>
          <td style="padding: 6px; color: #0284c7;">${r.puerto}</td>
          <td style="padding: 6px; color: #64748b; font-size: 10px;">${r.redes}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Dossier Completo Cliente - SERVIROV / SUBVISION</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 25px; color: #1e293b; }
            h1 { font-size: 20px; color: #0f172a; margin-bottom: 4px; }
            h2 { font-size: 15px; color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; }
            .header-box { border-bottom: 3px solid #06b6d4; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 6px; font-weight: 800; color: #475569; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h1>DOSSIER DE MONITOREO CLIENTE • SUBVISION ROV OS</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Empresa Operadora: <strong>SERVIROV</strong> • Fecha Emisión: <strong>${new Date().toLocaleDateString()}</strong> • Total Hallazgos/Informes: <strong>${rovReports.length}</strong></p>
          </div>

          <h2>1. Directorio de Centros Operativos Activos</h2>
          ${centersHtml}

          <h2>2. Pilotos ROV y Personal Técnico Autorizado</h2>
          ${pilotsHtml}

          <h2>3. Registro Cronológico de Informes y Hallazgos con Fechas</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Informe</th>
                <th>Piloto</th>
                <th>Estado</th>
                <th>Detalle Redes / Hallazgos</th>
              </tr>
            </thead>
            <tbody>
              ${reportsSummaryHtml}
            </tbody>
          </table>

          <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center;">
            Documento confidencial generado por la plataforma SUBVISION para monitoreo de Cliente. Todos los derechos reservados SERVIROV 2026.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compute averages for KPIs
  const cages = selectedCenter.cages.slice(0, 3);
  const avgNetIntegrity = Number((cages.reduce((acc, c) => acc + c.netIntegrity, 0) / cages.length).toFixed(1));
  const maxMooringTension = Math.max(...selectedCenter.mooringLines.map(l => l.tensionKn));

  // Determine integrity theme colors
  let integrityColor = 'text-emerald-500';
  let integrityStroke = 'stroke-emerald-500';
  let integrityBg = 'bg-emerald-50';
  if (avgNetIntegrity < 85) {
    integrityColor = 'text-red-500';
    integrityStroke = 'stroke-red-500';
    integrityBg = 'bg-red-50';
  } else if (avgNetIntegrity < 93) {
    integrityColor = 'text-amber-500';
    integrityStroke = 'stroke-amber-500';
    integrityBg = 'bg-amber-50';
  }

  // Filter alerts for the selected center
  const centerAlerts = activeAlerts.filter(a => a.centerId === selectedCenter.id && !a.acknowledged);

  // ROV Reports Processing
  const filteredReports = rovReports.filter(report => {
    const matchesCenter = !report.centroId || report.centroId === selectedCenter.id;
    const matchesSearch = report.piloto.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPilot = pilotFilter === '' || report.piloto === pilotFilter;
    const matchesStatus = statusFilter === 'todos' || report.puerto === statusFilter;
    return matchesCenter && matchesSearch && matchesPilot && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage) || 1;

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPiloto) return;

    addRovReport({
      fecha: formFecha,
      nombre: formNombre,
      jefeCentro: formJefe,
      piloto: formPiloto,
      empresa: formEmpresa,
      puerto: formPuerto,
      redes: formRedes
    });

    // Reset and close
    setFormPiloto('');
    setFormJefe('NN');
    setIsModalOpen(false);
  };

  // SVG Chart points
  const oxygenData = selectedCenter.historicalOxygen;
  const getSvgPath = (data: { value: number }[], min: number, max: number, width: number, height: number) => {
    const range = max - min;
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setPilotFilter('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  // Mooring schematic vectors
  const centerOfMass = { x: 100, y: 100 };
  const getLineCoordinates = (angle: number, length: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x2: centerOfMass.x + length * Math.cos(angleRad),
      y2: centerOfMass.y + length * Math.sin(angleRad)
    };
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 bg-slate-50 overflow-y-auto animate-fade-in text-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {activeTab === 'rov' ? 'Monitoreo de Informes y Hallazgos' : activeTab === 'cliente' ? 'Portal Cliente: Directorio de Centros y Pilotos' : activeTab === 'admin' ? 'Panel de Administración de Sistema' : 'Panel de Operaciones Marítimas'}
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            {activeTab === 'admin' ? 'Configuraciones globales y gestión de centros activos' : activeTab === 'cliente' ? 'Monitoreo integral, fichas técnicas y descarga completa de reportes con fechas' : `Centro de Cultivo: ${selectedCenter?.name || ''} • ${selectedCenter?.location || ''}`}
          </p>
        </div>

        {/* Tab Controls Switcher */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl w-max gap-1 select-none flex-wrap">
          <button
            onClick={() => setActiveTab('rov')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
              activeTab === 'rov' 
                ? 'bg-white text-cyan-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Informes y Fechas</span>
          </button>

          {canAccessCliente && (
            <button
              onClick={() => setActiveTab('cliente')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                activeTab === 'cliente' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Pilotos y Centros</span>
            </button>
          )}

          {currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@servirov.cl') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                activeTab === 'admin' 
                  ? 'bg-white text-cyan-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administración</span>
            </button>
          )}
        </div>
      </div>

      {/* Warnings bar */}
      {centerAlerts.length > 0 && activeTab !== 'rov' && (
        <div className="bg-white border-l-4 border-red-500 rounded-xl p-4 shadow-premium flex flex-col gap-3">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Alertas de Estructura Activas ({centerAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {centerAlerts.map(alert => (
              <div key={alert.id} className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{alert.source} • <span className="text-slate-400 font-normal">{alert.timestamp}</span></div>
                  <p className="text-slate-600 mt-0.5 text-[11px]">{alert.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const statusText = alert.type === 'integrity' ? 'ROTURA CRÍTICA DE MALLA' : 'SOBRETENSIÓN CRÍTICA DE FONDEO';
                      const message = `🚨 ALERTA SUBVISION - SERVIROV 🚨\n⚠️ ESTADO: ${statusText}\n📍 MÓDULO: ${alert.source.replace('Jaula', 'Módulo')} (${selectedCenter.name})\n⏱️ REGISTRO: ${new Date().toLocaleTimeString().substring(0, 5)}\n⚙️ ACCIÓN REQUERIDA: REVISIÓN URGENTE EN TERRENO.`;
                      openPhoneModal(message);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Simular Teléfono</span>
                  </button>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border-none"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: TELEMETRY & CCTV */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI: Water Temperature */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Temp. Agua</span>
                <span className="text-xl font-bold text-slate-800 block mt-1">{selectedCenter.waterParams.temperature} °C</span>
                <span className="text-[10px] text-slate-400">Rango óptimo (9-14°C)</span>
              </div>
              <div className="p-2.5 bg-cyan-50 rounded-lg text-cyan-600">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Dissolved Oxygen */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Oxígeno Disuelto</span>
                <span className={`text-xl font-bold block mt-1 ${selectedCenter.waterParams.dissolvedOxygen < 6.0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {selectedCenter.waterParams.dissolvedOxygen} mg/L
                </span>
                <span className="text-[10px] text-slate-400">Umbral mínimo: 6.0 mg/L</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <Waves className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Net Integrity */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Promedio Mallas</span>
                <span className="text-xl font-bold text-slate-800 block mt-1">{avgNetIntegrity}%</span>
                <span className="text-[10px] text-slate-400">Promedio de {cages.length} módulos</span>
              </div>
              <div className={`p-2.5 ${integrityBg} rounded-lg ${integrityColor}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Peak Mooring Line Tension */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Tensión Fondeo Pico</span>
                <span className="text-xl font-bold text-slate-800 block mt-1">{maxMooringTension.toFixed(1)} kN</span>
                <span className="text-[10px] text-slate-400">Límite anclaje: 180 kN</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* CCTV & Gauges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Circular gauge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Red de Integridad</h3>
                <span className="text-[10px] text-slate-400 font-mono">Sensors Check</span>
              </div>

              {/* Progress Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center my-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    className={`${integrityStroke} transition-all duration-1000`}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * avgNetIntegrity) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-extrabold tracking-tighter ${integrityColor}`}>{avgNetIntegrity}%</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Integridad</span>
                </div>
              </div>

              <div className="w-full space-y-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Óptimo (&gt;90%):</span>
                  <span className="font-bold text-emerald-600">{cages.filter(c => c.netIntegrity >= 90).length} Módulos</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Alerta (&lt;90%):</span>
                  <span className="font-bold text-red-600">{cages.filter(c => c.netIntegrity < 90).length} Módulos</span>
                </div>
              </div>
            </div>

            {/* Center Card: AI CCTV Video Window */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium lg:col-span-2 flex flex-col justify-between">
              <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider">CCTV Feed Inteligente - Módulo 105</h3>
                </div>
                <span className="text-[9px] font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Sonar Active
                </span>
              </div>

              {/* CCTV Viewport */}
              <div className="relative rounded-xl bg-slate-900 overflow-hidden border border-slate-800 min-h-[220px] flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000000bd_100%)] pointer-events-none z-10" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-0">
                  <div className="w-64 h-64 rounded-full border border-cyan-500/20 relative animate-sonar flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full rounded-full border-r border-t border-cyan-500/30 animate-sweep" />
                  </div>
                </div>

                {/* Overlaid bounding box */}
                <div className="absolute top-[25%] left-[30%] w-24 h-16 border-2 border-dashed border-red-500 z-20 flex flex-col justify-between p-1">
                  <span className="text-[7px] font-mono text-white bg-red-600 px-1 py-0.5 leading-none w-max rounded">NET TEAR DETECTED</span>
                  <span className="text-[7px] font-mono text-red-400 text-right">Conf: 94.2%</span>
                </div>

                <div className="text-white/30 font-mono text-[10px] z-10">[TRANSMISIÓN SUBMARINA EN VIVO]</div>

                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[9px] font-mono z-20 bg-slate-950/60 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>REC CAGE-105-CAM01</span>
                  </div>
                  <div>FPS: 29.8</div>
                </div>
              </div>
            </div>
          </div>

          {/* Oxygen Line Graph */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex flex-col justify-between">
            <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">Historial Telemetría de Oxígeno (12 Horas)</h3>
              <span className="text-[10px] text-slate-400 font-mono">Sensors Feed</span>
            </div>

            <div className="relative h-40 w-full border-b border-slate-100 pt-2">
              <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="112.5" x2="300" y2="112.5" stroke="#f8fafc" strokeWidth="1" />

                <path d={`${getSvgPath(oxygenData, 6.0, 10.0, 300, 150)} L 300,150 L 0,150 Z`} fill="url(#glow)" />
                <path d={getSvgPath(oxygenData, 6.0, 10.0, 300, 150)} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />

                {oxygenData.map((d, index) => {
                  const x = (index / (oxygenData.length - 1)) * 300;
                  const y = 150 - ((d.value - 6.0) / 4.0) * 150;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white stroke-cyan-600 cursor-pointer hover:r-5 transition-all"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredOxygenPoint({ x: d.time, y: d.value })}
                      onMouseLeave={() => setHoveredOxygenPoint(null)}
                    />
                  );
                })}
              </svg>
              {hoveredOxygenPoint && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded-lg border border-slate-700">
                  Hora: {hoveredOxygenPoint.x} • Oxígeno: <span className="text-cyan-400 font-bold">{hoveredOxygenPoint.y} mg/L</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-3">
              <span>{oxygenData[0].time}</span>
              <span>Parámetro de Oxígeno Disuelto Promedio en Centro Cultivo</span>
              <span>{oxygenData[oxygenData.length - 1].time}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INFORMES INSPECCIÓN ROV */}
      {activeTab === 'rov' && (
        <div className="space-y-6">
          
          {/* Main Table controls card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            
            {/* Header controls bar */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Informes Inspección ROV</h2>
              </div>

              {/* Filters & action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Input */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar informe..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                  />
                </div>

                {/* Pilot Selector */}
                <select
                  value={pilotFilter}
                  onChange={(e) => { setPilotFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white text-xs cursor-pointer appearance-none pr-8 relative"
                >
                  <option value="">Filtrar Piloto: Todos</option>
                  {Array.from(new Set(rovReports.map(r => r.piloto))).filter(isRealPilotName).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* Status Selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white text-xs cursor-pointer"
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="Abierto">Abierto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>

                {/* Reset Filters Icon */}
                <button
                  onClick={handleResetFilters}
                  title="Restablecer filtros"
                  className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Export List to PDF */}
                <button
                  onClick={handleExportTablePdf}
                  title="Exportar listado filtrado a PDF"
                  className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0 flex items-center gap-1.5 font-bold text-[10px] uppercase"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exportar</span>
                </button>

                {/* Add New Button - Hidden for Cliente profile */}
                {(!currentUser || (currentUser.role !== 'Cliente' && currentUser.email !== 'cliente@servirov.cl')) && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo</span>
                  </button>
                )}

              </div>
            </div>

            {/* ROV Reports Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50">
                    <th className="py-3.5 px-6 w-12 text-center"></th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Fecha</th>
                    <th className="py-3.5 px-4">Nombre</th>
                    <th className="py-3.5 px-4">Jefe de Centro</th>
                    <th className="py-3.5 px-4">Piloto</th>
                    <th className="py-3.5 px-4">Empresa</th>
                    <th className="py-3.5 px-4 text-center">Puerto</th>
                    <th className="py-3.5 px-4">Redes</th>
                    <th className="py-3.5 px-4 text-center">Visor 3D</th>
                    <th className="py-3.5 px-6 text-center w-24">Reporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentReports.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400 font-mono">
                        No se encontraron informes coincidentes.
                      </td>
                    </tr>
                  ) : (
                    currentReports.map(report => (
                      <tr key={report.id} className="hover:bg-slate-50/40 transition-colors">
                        
                        {/* Status Checkmark dot */}
                        <td className="py-3.5 px-6 text-center">
                          <span className="relative flex h-2.5 w-2.5 mx-auto">
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                              report.puerto === 'Abierto' ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{report.fecha}</td>

                        {/* Name */}
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{report.nombre}</td>

                        {/* Jefe de centro */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{report.jefeCentro}</td>

                        {/* Pilot */}
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{report.piloto}</td>

                        {/* Company */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono font-medium">{report.empresa}</td>

                        {/* Puerto Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase inline-block leading-none border ${
                            report.puerto === 'Abierto'
                              ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50'
                              : 'bg-red-100/50 text-red-700 border-red-200/50'
                          }`}>
                            {report.puerto}
                          </span>
                        </td>

                        {/* Nets list */}
                        <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate" title={report.redes}>
                          {report.redes}
                        </td>

                        {/* Visor 3D Link */}
                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`/visor.html?center=${selectedCenter.id}&report=${report.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-lg border border-cyan-200/50 transition-all inline-flex items-center justify-center gap-1 text-[10px] mx-auto w-max"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Visor</span>
                          </a>
                        </td>

                        {/* Row Actions Icon - Export PDF & Send Email */}
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleExportSinglePdf(report)}
                              title="Exportar informe a PDF"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all select-none cursor-pointer"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEmailPromptReport(report);
                                setIsEmailPromptOpen(true);
                              }}
                              title="Enviar por correo electrónico"
                              className="p-1.5 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-700 rounded-lg border border-cyan-200/50 transition-all select-none cursor-pointer shadow-xs"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20 text-xs">
              <div className="text-slate-400">
                Mostrando <span className="font-semibold text-slate-700">{indexOfFirstReport + 1}</span> a <span className="font-semibold text-slate-700">{Math.min(indexOfLastReport, filteredReports.length)}</span> de <span className="font-semibold text-slate-700">{filteredReports.length}</span> registros
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">
                  Página <span className="font-bold text-slate-700">{currentPage}</span> de {totalPages}
                </span>

                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CLIENTE: DIRECTORY OF CENTERS & PILOTS & FULL MONITORING */}
      {activeTab === 'cliente' && canAccessCliente && (
        <div className="space-y-6 animate-fadeIn">
          {/* SECTION 1: CENTROS DE CULTIVO OPERATIVOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-600" />
                <span>Directorio de Centros Marítimos y Estado Estructural ({centers.length} Centros)</span>
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">Monitoreo Acuicultura Chiloé</span>
                <button
                  onClick={handleExportClientPackagePdf}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-950" />
                  <span>Descargar Dossier PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {centers.map(c => {
                const cCages = c.cages.slice(0, 3);
                const cAvgNet = Number((cCages.reduce((acc, cg) => acc + cg.netIntegrity, 0) / (cCages.length || 1)).toFixed(1));
                const cReportsCount = rovReports.filter(r => r.centroId === c.id || r.nombre.toLowerCase().includes(c.name.toLowerCase().replace('centro ', ''))).length;

                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-premium hover:shadow-xl transition-all p-5 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block">{c.region}</span>
                          <h4 className="text-base font-extrabold text-slate-800 mt-0.5 group-hover:text-cyan-700 transition-colors">{c.name}</h4>
                          <p className="text-xs text-slate-500">{c.location}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cAvgNet >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          Integridad: {cAvgNet}%
                        </span>
                      </div>

                      {/* Technical Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100/80 mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Temp. Agua</span>
                          <span className="font-bold text-slate-700">{c.waterParams.temperature} °C</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Oxígeno Disuelto</span>
                          <span className="font-bold text-slate-700">{c.waterParams.dissolvedOxygen} mg/L</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Módulos / Jaulas</span>
                          <span className="font-bold text-slate-700">{c.cages.length} Jaulas</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Líneas Fondeo</span>
                          <span className="font-bold text-slate-700">{c.mooringLines.length} Líneas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {cReportsCount} Informes de ROV
                      </span>
                      <button
                        onClick={() => {
                          window.open(`/visor.html?center=${c.id}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-bold text-xs border border-cyan-200 transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visor 3D</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DIRECTORIO DE PILOTAS Y PILOTOS ROV AUTORIZADOS */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Equipo Operativo y Pilotos ROV SERVIROV ({usersList.filter(isRealPilot).length} Especialistas)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Personal Certificado Submarino</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {usersList.filter(isRealPilot).map(u => {
                const pilotReportsCount = rovReports.filter(r => r.piloto === u.name || r.userEmail === u.email).length;
                const isSuper = u.role === 'admin' || u.role.includes('Supervisor');

                return (
                  <div key={u.email} className="bg-white rounded-2xl border border-slate-100 shadow-premium p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div>
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-md ${
                          isSuper ? 'bg-gradient-to-br from-purple-600 to-indigo-700' : 'bg-gradient-to-br from-cyan-600 to-blue-700'
                        }`}>
                          {u.avatar || u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-800 truncate" title={u.name}>{u.name}</h4>
                          <span className="text-xs font-semibold text-cyan-700 block">{u.role}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.company || 'SERVIROV'}</span>
                        </div>
                      </div>

                      {/* Certifications and Pilot Specs */}
                      <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100/80 mb-4">
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium">Correo Electrónico:</span>
                          <span className="font-mono font-semibold text-slate-700 truncate max-w-[150px]">{u.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium">Informes Emitidos:</span>
                          <span className="font-bold text-emerald-600">{pilotReportsCount} Reportes con Firma</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium">Licencia DGTM:</span>
                          <span className="font-semibold text-slate-700">{isSuper ? 'Clase I Marítima' : 'Clase II ROV Pesado'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-slate-400 font-medium">Estado:</span>
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Operativo en Campo
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">ID: {u.email.split('@')[0].toUpperCase()}-2026</span>
                      <button
                        onClick={() => {
                          setPilotFilter(u.name);
                          setActiveTab('rov');
                        }}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1"
                      >
                        <span>Filtrar Sus Hallazgos</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: STRUCTURES & ANCHORS */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cages List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium lg:col-span-2 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">Parámetros Estructurales de Módulos</h3>
              <span className="text-[10px] text-slate-400 font-mono">Tension Metrics</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-2">Módulo</th>
                    <th className="py-2.5 px-2">Especie</th>
                    <th className="py-2.5 px-2 text-right">Biomasa (t)</th>
                    <th className="py-2.5 px-2 text-right">Malla (%)</th>
                    <th className="py-2.5 px-2 text-right">Tensión Fondeo</th>
                    <th className="py-2.5 px-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cages.map(cage => (
                    <tr key={cage.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-bold text-slate-800">{cage.name.replace('Jaula', 'Módulo')}</td>
                      <td className="py-3 px-2 text-slate-500">{cage.species}</td>
                      <td className="py-3 px-2 text-right text-slate-700 font-semibold">{cage.biomassTons} t</td>
                      <td className="py-3 px-2 text-right font-bold">
                        <span className={cage.netIntegrity < 80 ? 'text-red-500' : cage.netIntegrity < 90 ? 'text-amber-500' : 'text-slate-700'}>
                          {cage.netIntegrity}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-700">{cage.mooringTensionKn.toFixed(1)} kN</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider inline-block leading-none ${
                          cage.status === 'optimal' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : cage.status === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cage.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anchor radar schematic */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">Esquema Fondeos Anclados</h3>
              <span className="text-[10px] text-slate-400 font-mono">Radar Schematic</span>
            </div>

            <div className="flex items-center justify-center bg-slate-950 rounded-xl p-3.5 relative min-h-[200px] w-full border border-slate-900 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#000000bd_100%)] pointer-events-none" />
              <svg className="w-48 h-48 z-10" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <rect x="85" y="85" width="30" height="30" rx="4" fill="#1e293b" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
                
                {selectedCenter.mooringLines.map(line => {
                  const length = (line.tensionKn / line.limitKn) * 75;
                  const target = getLineCoordinates(line.angle, length);
                  
                  let strokeColor = '#10b981';
                  if (line.status === 'critical') strokeColor = '#ef4444';
                  else if (line.status === 'warning') strokeColor = '#f59e0b';
                  
                  return (
                    <g key={line.id}>
                      <line x1={centerOfMass.x} y1={centerOfMass.y} x2={target.x2} y2={target.y2} stroke={strokeColor} strokeWidth="2" />
                      <circle cx={target.x2} cy={target.y2} r="4.5" fill={strokeColor} className="animate-pulse" />
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="w-full mt-4 space-y-1 text-[11px] text-slate-500">
              {selectedCenter.mooringLines.map(line => (
                <div key={line.id} className="flex justify-between border-b border-slate-50 pb-1">
                  <span>{line.code}:</span>
                  <span className={`font-bold ${line.status === 'critical' ? 'text-red-500' : line.status === 'warning' ? 'text-amber-500' : 'text-slate-800'}`}>
                    {line.tensionKn} kN
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW REPORT DRAWER/MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 animate-fade-in relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2.5 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-cyan-600" />
              Nuevo Informe Inspección ROV
            </h3>

            <form onSubmit={handleCreateReport} className="space-y-4 text-left">
              
              {/* Fecha */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block uppercase text-[9px]">Fecha</label>
                <input
                  type="date"
                  required
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Nombre / Tipo */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block uppercase text-[9px]">Nombre del Informe</label>
                <select
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs cursor-pointer"
                >
                  <option value="INFORME DIARIO">INFORME DIARIO</option>
                  <option value="MORTALIDAD INSPECCIÓN">MORTALIDAD INSPECCIÓN</option>
                  <option value="INSPECCIÓN ANCLAJES">INSPECCIÓN ANCLAJES</option>
                  <option value="LIMPIEZA DE MALLA">LIMPIEZA DE MALLA</option>
                </select>
              </div>

              {/* Jefe de centro */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block uppercase text-[9px]">Jefe de Centro</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formJefe}
                    onChange={(e) => setFormJefe(e.target.value)}
                    placeholder="Ej. NN o Andrés Mansilla"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Piloto */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block uppercase text-[9px]">Piloto ROV</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formPiloto}
                    onChange={(e) => setFormPiloto(e.target.value)}
                    placeholder="Ej. Cristian Barcena Córdova"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Empresa */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block uppercase text-[9px]">Empresa</label>
                  <input
                    type="text"
                    required
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                  />
                </div>

                {/* Puerto Estado */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block uppercase text-[9px]">Puerto</label>
                  <select
                    value={formPuerto}
                    onChange={(e: any) => setFormPuerto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs cursor-pointer"
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>

              {/* Redes */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block uppercase text-[9px]">Redes Involucradas</label>
                <input
                  type="text"
                  required
                  value={formRedes}
                  onChange={(e) => setFormRedes(e.target.value)}
                  placeholder="Ej. RED LOBERA; REDES PECERAS;"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-100 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-all text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all text-center"
                >
                  Crear Informe
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-xs">
          {/* Left Column: Centers & Operators */}
          <div className="space-y-6">
            {/* Active Centers Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  <span>Gestión de Centros Activos</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Listado completo de centros operativos registrados en la base de datos local
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Nombre</th>
                      <th className="pb-3">Ubicación</th>
                      <th className="pb-3 text-center">Módulos</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {centers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-3">{c.location}</td>
                        <td className="py-3 text-center">{c.cages.length}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteCenter(c.id, c.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                            title="Eliminar Centro"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {centers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No hay centros activos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operator Profiles Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  <span>Gestión de Operadores y Pilotos</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Administra las cuentas de pilotos autorizados para operar la plataforma
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Nombre</th>
                      <th className="pb-3">Correo</th>
                      <th className="pb-3">Cargo</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {usersList.map(u => (
                      <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3 font-mono text-[10px]">{u.role === 'admin' ? 'Administrador' : u.role}</td>
                        <td className="py-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOperatorEmail(u.email)}
                            className="p-1.5 rounded-lg text-cyan-600 hover:bg-cyan-50 hover:text-cyan-800 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-cyan-100 shadow-sm"
                            title="Ver Detalle / Actividad"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.email, u.name)}
                            disabled={u.email === currentUser?.email}
                            className={`p-1.5 rounded-lg transition-all ${
                              u.email === currentUser?.email 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center justify-center border border-transparent hover:border-red-100 shadow-sm'
                            }`}
                            title={u.email === currentUser?.email ? "No puedes eliminarte a ti mismo" : "Eliminar Operador"}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No hay operadores registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consolidated Reports card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <span>Consolidado General de Informes</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Visualiza y elimina de forma definitiva cualquier informe registrado en el sistema
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Nombre</th>
                      <th className="pb-3">Centro</th>
                      <th className="pb-3">Piloto</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {rovReports.map(r => {
                      const centerName = centers.find(c => c.id === r.centroId)?.name || r.centroId || 'Centro Eliminado';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-800">{r.fecha}</td>
                          <td className="py-3">{r.nombre}</td>
                          <td className="py-3 text-cyan-600 font-bold">{centerName}</td>
                          <td className="py-3">{r.piloto}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Está seguro que desea eliminar el informe "${r.nombre}"?`)) {
                                  deleteRovReport(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                              title="Eliminar Informe"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {rovReports.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No hay informes registrados en la base de datos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Settings Column */}
          <div className="space-y-6">
            {/* AI Configurations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  <span>Configuración de Inteligencia Artificial (DeepSeek)</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Establece los parámetros del motor predictivo y chatbot inteligente
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block uppercase text-[9px]">DeepSeek API Key</label>
                  <input
                    type="password"
                    value={aiSettings.apiKey}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                    placeholder="Ingrese clave de API"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block uppercase text-[9px]">Modelo de Lenguaje</label>
                    <select
                      value={aiSettings.model}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs cursor-pointer"
                    >
                      <option value="deepseek-chat">DeepSeek-V3 (Chat)</option>
                      <option value="deepseek-reasoner">DeepSeek-R1 (Razonamiento)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block uppercase text-[9px]">Temperatura ({aiSettings.temperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full h-8 cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Notification Configurations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-600" />
                  <span>Notificaciones de Alertas (WhatsApp API)</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ajusta los destinatarios y el estado del despachador de mensajería
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block uppercase text-[9px]">Estado de WhatsApp API</label>
                    <select
                      value={whatsAppSettings.apiStatus}
                      onChange={(e: any) => setWhatsAppSettings(prev => ({ ...prev, apiStatus: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs cursor-pointer"
                    >
                      <option value="online">Activo / Conectado</option>
                      <option value="offline">Inactivo / Desconectado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block uppercase text-[9px]">Envío Automático</label>
                    <div className="flex items-center h-8">
                      <input
                        type="checkbox"
                        checked={whatsAppSettings.autoSend}
                        onChange={(e) => setWhatsAppSettings(prev => ({ ...prev, autoSend: e.target.checked }))}
                        className="w-4 h-4 rounded text-cyan-600 border-slate-100 focus:ring-cyan-500 cursor-pointer"
                        id="autoSendCheckbox"
                      />
                      <label htmlFor="autoSendCheckbox" className="ml-2 text-slate-600 font-medium cursor-pointer">
                        Despachar en infracción
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block uppercase text-[9px]">Destinatario de Alertas por Defecto</label>
                  <input
                    type="text"
                    value={whatsAppSettings.defaultRecipient}
                    onChange={(e) => setWhatsAppSettings(prev => ({ ...prev, defaultRecipient: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                    placeholder="Ej. +56 9 XXXXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operator Details Modal */}
      {selectedOperatorEmail && (() => {
        const op = usersList.find(u => u.email === selectedOperatorEmail);
        if (!op) return null;
        
        // Find their assigned center name
        let assignedCenterName = 'No asignado';
        if (op.email === 'operador@servirov.cl') {
          assignedCenterName = 'Centro Pilpilehue';
        } else if (op.role === 'admin') {
          assignedCenterName = 'Todos los Centros (Administrador)';
        }

        // Get activities for this specific user
        const opActivities = activities.filter(act => act.user_email === op.email);

        // Get reports created by this specific user
        const opReports = rovReports.filter(rep => rep.userEmail === op.email || rep.piloto.toLowerCase().includes(op.name.toLowerCase()));

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-slate-100 shadow-premium flex flex-col p-6 space-y-6 text-xs animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Detalles del Operador</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{op.name} • {op.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOperatorEmail(null);
                    setAdminNewPasswordInput('');
                  }}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Info and Password */}
                <div className="space-y-6">
                  {/* Operator Info card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
                    <h4 className="font-bold text-slate-800">Información Operativa</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Cargo</span>
                        <span className="font-semibold text-slate-700 block mt-0.5">{op.role === 'admin' ? 'Administrador' : op.role}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Centro Asignado</span>
                        <span className="font-semibold text-cyan-600 block mt-0.5">{assignedCenterName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Password Reset card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
                    <h4 className="font-bold text-slate-800">Recuperación y Cambio de Contraseña</h4>
                    <p className="text-[10px] text-slate-400">
                      Asigne una nueva clave de acceso directamente para este operador
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nueva contraseña"
                        value={adminNewPasswordInput}
                        onChange={(e) => setAdminNewPasswordInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                      />
                      <button
                        onClick={() => {
                          if (!adminNewPasswordInput.trim()) {
                            alert("Por favor ingrese una contraseña válida.");
                            return;
                          }
                          changeUserPassword(op.email, adminNewPasswordInput);
                          alert(`Contraseña de ${op.name} actualizada con éxito.`);
                          setAdminNewPasswordInput('');
                        }}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Reports list */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
                    <h4 className="font-bold text-slate-800">Informes Creados ({opReports.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {opReports.map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div>
                            <div className="font-semibold text-slate-800 text-[10px]">{r.fecha}</div>
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5 uppercase">{r.nombre}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Está seguro que desea eliminar el informe "${r.nombre}"?`)) {
                                deleteRovReport(r.id);
                              }
                            }}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title="Eliminar Informe"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {opReports.length === 0 && (
                        <p className="text-slate-400 text-center py-4">No se registran informes creados por este operador.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Activity Log */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col space-y-4">
                  <h4 className="font-bold text-slate-800">Registro de Actividad en la App</h4>
                  <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-3 pr-1">
                    {opActivities.map((act, index) => (
                      <div key={index} className="border-l-2 border-cyan-500 pl-3 py-1 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                          <span>{act.timestamp}</span>
                        </div>
                        <div className="font-semibold text-slate-800 text-[11px]">{act.action}</div>
                        <p className="text-slate-600 text-[10px]">{act.target}</p>
                      </div>
                    ))}
                    {opActivities.length === 0 && (
                      <p className="text-slate-400 text-center py-12">No hay registros de actividad para este operador.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Email Recipient Prompt Modal */}
      {isEmailPromptOpen && emailPromptReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-600 animate-pulse" />
                <span>Enviar Reporte por Correo</span>
              </h3>
              <button 
                onClick={() => setIsEmailPromptOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Configure el correo destinatario para despachar el informe diario de faenas del <strong>{selectedCenter.name}</strong>.
              </p>
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Correo Electrónico Destinatario</label>
                <input 
                  type="email"
                  value={emailPromptInput}
                  onChange={(e) => setEmailPromptInput(e.target.value)}
                  placeholder="ejemplo@servirov.cl"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEmailPromptOpen(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsEmailPromptOpen(false);
                  openEmailModal(emailPromptReport, emailPromptInput);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer border-none"
              >
                Generar Correo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
