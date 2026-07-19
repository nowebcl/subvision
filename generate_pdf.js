import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: {
    top: 50,
    bottom: 60,
    left: 50,
    right: 50
  }
});

// Path to save PDF in the user workspace
const outputPdfPath = path.resolve('c:/Users/NOWEB  DESKTOP/Documents/PROYECTOS  ANTIGRAVITY/SUBVISION/informe_subvision.pdf');
const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

// Brand Colors
const primaryColor = '#0891b2';   // Cyan 600
const secondaryColor = '#38bdf8'; // Sky 400
const darkColor = '#0f172a';      // Slate 900
const grayColor = '#334155';      // Slate 700
const lightBg = '#f8fafc';        // Slate 50
const borderColors = '#cbd5e1';   // Slate 300

// Helper to draw horizontal dividers
const drawDivider = (y) => {
  doc.strokeColor(primaryColor)
     .lineWidth(1.5)
     .moveTo(50, y)
     .lineTo(545, y)
     .stroke();
};

// Helper for section headers
const addSectionHeader = (title, y) => {
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text(title, 50, y);
  drawDivider(y + 22);
  doc.moveDown(1.5);
};

// Helper to draw a completely empty screenshot placeholder box with only a title above it
const drawEmptyBox = (x, y, w, h, label, drawBorder) => {
  doc.save();

  // Draw clean title text above the box
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text(label, x, y);
  
  // Draw an empty rectangle with clean border line only if drawBorder is true
  if (drawBorder) {
    doc.rect(x, y + 12, w, h)
       .strokeColor(borderColors)
       .lineWidth(1)
       .stroke();
  }

  doc.restore();
};

// Helper for screen description block with two empty placeholders below (wireframe and final design)
const addManualEntry = (name, desc, bullets, y) => {
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(name, 50, y);
  
  doc.fillColor(grayColor)
     .font('Helvetica')
     .fontSize(9)
     .text(desc, 50, y + 14, { width: 495, lineGap: 3.5 });
  
  let bulletY = y + 38;
  bullets.forEach((bullet) => {
    doc.fillColor(grayColor)
       .font('Helvetica')
       .fontSize(8.5)
       .text(`• ${bullet}`, 60, bulletY, { width: 475, lineGap: 2.5 });
    
    const textHeight = doc.heightOfString(`• ${bullet}`, { width: 475 });
    bulletY += textHeight + 3;
  });

  const placeholdersY = bulletY + 8;
  
  // Draw two empty boxes side-by-side below the text
  // Left: Boceto / Wireframe (Width: 220, Height: 100, NO border)
  drawEmptyBox(50, placeholdersY, 220, 100, 'Boceto / Wireframe', false);
  
  // Right: Diseño Final (Width: 220, Height: 100, NO border)
  drawEmptyBox(325, placeholdersY, 220, 100, 'Diseño Final', false);
};


// ==========================================
// PORTADA (PAGE 1)
// ==========================================
doc.rect(50, 50, 495, 742).strokeColor('#e2e8f0').lineWidth(1).stroke();

// Loading LOGO_CIRCULAR.png on Cover Page (Bigger size: width 110)
const logoCircularPath = path.resolve('public/LOGO_CIRCULAR.png');
const coverLogoX = 242.64; // Centered: (595.28 - 110) / 2
if (fs.existsSync(logoCircularPath)) {
  doc.image(logoCircularPath, coverLogoX, 120, { width: 110 });
} else {
  // Fallback circle logo
  doc.circle(297.64, 175, 55).fill(darkColor);
  doc.strokeColor(primaryColor).lineWidth(1.5).circle(297.64, 175, 48).stroke();
}

// Title and details
doc.fillColor(primaryColor)
   .font('Helvetica-Bold')
   .fontSize(32)
   .text('SUBVISION', 50, 275, { align: 'center', characterSpacing: 2 });

doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(16)
   .text('Plataforma de Inspección Inteligente para Acuicultura', 50, 315, { align: 'center' });

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(11)
   .text('Manual de Usuario, Identidad Gráfica y Especificaciones de Arquitectura Técnica.', 50, 345, { align: 'center' });

// System Details Panel
doc.rect(97.64, 400, 400, 120).fillAndStroke(lightBg, '#cbd5e1');
doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(11)
   .text('RESUMEN DE CAPACIDADES DEL PROTOTIPO', 115, 415);

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(9.5)
   .text('• Cerebro IA: Modelos DeepSeek-V3 & DeepSeek-R1 integrados.', 115, 435)
   .text('• Base de Datos: Supabase PostgreSQL Cloud para persistencia.', 115, 453)
   .text('• Visor 3D: Representación de jaulas y telemetría interactiva WebGL.', 115, 471)
   .text('• Notificaciones: Canal Automatizado de Alertas vía API de WhatsApp.', 115, 489);

// Developer & Date (Noweb Labs for Servirov)
doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(10)
   .text('DESARROLLADO POR:', 80, 680);
doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(10)
   .text('Noweb Labs', 80, 695);

doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(10)
   .text('PREPARADO PARA:', 230, 680);
doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(10)
   .text('Servirov', 230, 695);

doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(10)
   .text('FECHA DE EMISIÓN:', 380, 680);
doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(10)
   .text('Julio 2026 (Versión 1.3.0)', 380, 695);


// ==========================================
// SECCIÓN 2: IDENTIDAD GRÁFICA (PAGE 2)
// ==========================================
doc.addPage();

addSectionHeader('IDENTIDAD GRÁFICA DE SUBVISION', 60);

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(10)
   .text('La identidad de SUBVISION combina el entorno oceanográfico con la precisión tecnológica. Su diseño visual utiliza contrastes marcados para facilitar la visibilidad en ambientes industriales y de altamar.', 50, 110, { width: 495, lineGap: 4 });

// Logo design subsection
doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('1. Logotipo y Concepto Visual', 50, 160);

// Draw the real logo in a box (Bigger box & logo size)
const logoBoxX = 50;
const logoBoxY = 185;
doc.rect(logoBoxX, logoBoxY, 180, 80).fillAndStroke(lightBg, '#cbd5e1');

const logoNormalPath = path.resolve('public/LOGO.png');
if (fs.existsSync(logoNormalPath)) {
  doc.image(logoNormalPath, logoBoxX + 15, logoBoxY + 12, { fit: [150, 56] });
} else {
  doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(12).text('SUBVISION', logoBoxX + 45, logoBoxY + 30);
}

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(9.5)
   .text('El logotipo representa las ondas de propagación acústica (sonar) utilizadas para escaneo submarino. La letra "S" central simboliza la jaula acuícola y las corrientes marinas. Su diseño circular cerrado denota seguridad e integridad estructural.', 245, 185, { width: 300, lineGap: 3 });

// Colors Palette
doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('2. Paleta de Colores Corporativos', 50, 285);

const drawColorSwatch = (x, y, color, name, hex) => {
  doc.save();
  doc.rect(x, y, 70, 30).fill(color);
  doc.rect(x, y, 70, 30).strokeColor(borderColors).lineWidth(0.8).stroke();
  doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8.5).text(name, x, y + 36);
  doc.fillColor(grayColor).font('Helvetica').fontSize(8).text(hex, x, y + 46);
  doc.restore();
};

const swY = 310;
drawColorSwatch(50, swY, primaryColor, 'Azul Cyan (Primario)', '#0891B2');
drawColorSwatch(135, swY, secondaryColor, 'Azul Sky (Acento)', '#38BDF8');
drawColorSwatch(220, swY, darkColor, 'Pizarra (Dark)', '#0F172A');
drawColorSwatch(305, swY, grayColor, 'Gris Carbón (Texto)', '#334155');
drawColorSwatch(390, swY, '#e2e8f0', 'Líneas (Bordes)', '#E2E8F0');
drawColorSwatch(475, swY, lightBg, 'Fondo Claro', '#F8FAFC');

// Typography subsection
doc.fillColor(darkColor)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('3. Tipografía y Jerarquías de Texto', 50, 390);

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(9.5)
   .text('El sistema utiliza familias tipográficas lineales y limpias (Sans-serif) para facilitar la lectura de telemetría y datos densos en pantallas de control.', 50, 410, { width: 495, lineGap: 3 });

// Typography Table
const tableY = 440;
doc.rect(50, tableY, 495, 65).strokeColor('#e2e8f0').lineWidth(0.8).stroke();
doc.rect(50, tableY, 495, 16).fill('#f1f5f9');

// Table Headers
doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8.5)
   .text('Uso / Rol', 60, tableY + 5)
   .text('Fuente del Sistema', 200, tableY + 5)
   .text('Tamaño', 350, tableY + 5)
   .text('Estilo', 450, tableY + 5);

// Table Row 1
doc.fillColor(grayColor).font('Helvetica').fontSize(8)
   .text('Títulos de Sección', 60, tableY + 22)
   .text('Helvetica-Bold', 200, tableY + 22)
   .text('16 pt', 350, tableY + 22)
   .text('Negrita (Cyan/Slate)', 450, tableY + 22);

// Table Row 2
doc.fillColor(grayColor).font('Helvetica').fontSize(8)
   .text('Subtítulos de Tarjeta', 60, tableY + 36)
   .text('Helvetica-Bold', 200, tableY + 36)
   .text('11 pt', 350, tableY + 36)
   .text('Negrita (Slate)', 450, tableY + 36);

// Table Row 3
doc.fillColor(grayColor).font('Helvetica').fontSize(8)
   .text('Cuerpo de Texto', 60, tableY + 50)
   .text('Helvetica', 200, tableY + 50)
   .text('9.5 - 10 pt', 350, tableY + 50)
   .text('Regular (Slate 700)', 450, tableY + 50);


// ==========================================
// SECCIÓN 3: MANUAL DE USUARIO (PAGE 3)
// ==========================================
doc.addPage();

addSectionHeader('MANUAL DE USUARIO: ACCESO Y DASHBOARD', 60);

// Screen A: Login (y = 105)
addManualEntry(
  'A. Pantalla de Acceso Seguro (Login)',
  'Es el punto de entrada oficial para operadores de ROV, buzos técnicos y administradores de la plataforma SUBVISION.',
  [
    'Autenticación robusta que separa perfiles (Piloto de Inspección vs. Administrador general).',
    'Control de redirección automático según rol al ingresar al sistema.',
    'Validación visual de errores de credenciales en tiempo real.'
  ],
  105
);

// Screen B: Dashboard de Informes de Inspección (y = 345)
addManualEntry(
  'B. Dashboard de Informes de Inspección',
  'Es el panel principal que centraliza y organiza los reportes de anomalías estructurales recopilados durante las inmersiones de los ROVs.',
  [
    'Filtros inteligentes por centro de cultivo (Pilpilehue, Apiao, Quellón).',
    'Ficha técnica con coordenadas, piloto, gravedad del daño y detalles.',
    'Botón "Abrir Visor 3D" que mapea espacialmente el incidente en la jaula exacta.'
  ],
  345
);


// ==========================================
// SECCIÓN 3: MANUAL DE USUARIO 2 (PAGE 4)
// ==========================================
doc.addPage();

addSectionHeader('MANUAL DE USUARIO: ESTRUCTURAS Y BITÁCORAS DIARIAS', 60);

// Screen C: Módulo de Estructuras e Instalaciones (y = 105)
addManualEntry(
  'C. Módulo de Estructuras e Instalaciones',
  'Facilita la visualización del estado físico tridimensional y la telemetría mecánica de la red de fondeo y las jaulas.',
  [
    'Gráfico de telemetría de tensiones (en kN) que alerta sobre posibles fatigas de cabos.',
    'Vista matricial rápida del centro de cultivo con indicación visual de anomalías activas.',
    'Acceso directo para inspeccionar jaulas específicas en el Visor 3D.'
  ],
  105
);

// Screen D: Checklist de Inspección (y = 345)
addManualEntry(
  'D. Checklist de Inspección y Bitácora',
  'Permite a la tripulación completar la bitácora pre-operativa de los ROVs y buceos, garantizando el cumplimiento de normas de la Autoridad Marítima.',
  [
    'Formulario paso a paso de verificación del sistema (motores, visibilidad, etc.).',
    'Asistente de Inteligencia Artificial que traduce notas libres o voz a datos estructurados.',
    'Autocompletado automático de la planilla mediante procesamiento de lenguaje natural.'
  ],
  345
);


// ==========================================
// SECCIÓN 3: MANUAL DE USUARIO 3 (PAGE 5)
// ==========================================
doc.addPage();

addSectionHeader('MANUAL DE USUARIO: ASISTENTE AI Y ALERTAS WHATSAPP', 60);

// Screen E: Asistente AI Multimodal (y = 105)
addManualEntry(
  'E. Asistente AI Multimodal (DeepSeek)',
  'Consola técnica de inteligencia artificial que asiste en la interpretación de anomalías y sugerencias de reparación estructural.',
  [
    'Carga directa de ecogramas, sonares de barrido lateral y fotografías submarinas.',
    'Procesamiento avanzado mediante modelos de razonamiento lógico DeepSeek.',
    'Generación automática de sugerencias técnicas en base a manuales y normativas.'
  ],
  105
);

// Screen F: Alertas Automáticas y WhatsApp (y = 345)
addManualEntry(
  'F. Canal de Notificaciones y WhatsApp',
  'Módulo de comunicación operacional que vincula los diagnósticos de fallas de la IA con el equipo de buzos en terreno.',
  [
    'Panel de reglas para despachar alertas automáticas en caso de roturas críticas.',
    'Simulador de interfaz móvil para verificar los mensajes salientes.',
    'Botón de test manual para alertar instantáneamente a buzos y supervisores.'
  ],
  345
);


// ==========================================
// SECCIÓN 4: INFORME TÉCNICO (PAGE 6)
// ==========================================
doc.addPage();

addSectionHeader('INFORME TÉCNICO: ARQUITECTURA Y TECNOLOGÍAS', 60);

doc.fillColor(grayColor)
   .font('Helvetica')
   .fontSize(10)
   .text('La arquitectura técnica de SUBVISION se diseñó con un enfoque modular, de alta cohesión y bajo acoplamiento, optimizando los tiempos de procesamiento en alta mar.', 50, 110, { width: 495, lineGap: 4 });

const addTechDetails = (name, desc, y) => {
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(name, 50, y);
  
  doc.fillColor(grayColor)
     .font('Helvetica')
     .fontSize(9.5)
     .text(desc, 50, y + 14, { width: 495, lineGap: 3.5 });
};

addTechDetails(
  'A. Capa de Presentación (Frontend y Estilos)',
  '• React 19 & TypeScript 6.0: Arquitectura de componentes declarativos con tipado estricto para evitar excepciones en producción.\n• Vite 8.1: Herramienta de compilación ultrarrápida que optimiza el bundling para cargas en conexiones satelitales restringidas.\n• Tailwind CSS 4.0: Utilizado para desarrollar la interfaz en modo oscuro (Glassmorphism), aplicando gradientes armónicos y desenfoques visuales que facilitan el trabajo nocturno en cubierta.',
  150
);

addTechDetails(
  'B. Base de Datos en la Nube (Supabase Cloud)',
  '• Supabase (PostgreSQL): Almacenamiento estructurado relacional que gestiona la telemetría de las jaulas, las alertas operativas y las bitácoras diarias de buceo.\n• API REST & Seguridad RLS (Row Level Security): Garantiza que los informes de cada centro sean accesibles únicamente por personal autorizado por Servirov Ltda.',
  270
);

addTechDetails(
  'C. Procesamiento Conversacional e IA (DeepSeek Unified API)',
  '• DeepSeek-V3: Modelo de lenguaje fluido para la redacción de alertas automáticas y chats de asistencia técnica rápida.\n• DeepSeek-R1 Distill: Modelo enfocado en el razonamiento matemático y físico para el análisis estructurado de anomalías complejas de cabos y tensores, cruzando telemetría en tiempo real.',
  375
);

addTechDetails(
  'D. Motor de Renderizado (Visor Estructural 3D)',
  '• WebGL Canvas API: Visor interactivo en tres dimensiones desarrollado de forma nativa en el cliente, permitiendo girar, hacer zoom y examinar la distribución geométrica exacta de los centros de cultivo y sus puntos de anclaje sin sobrecargar el servidor.',
  490
);


// ==========================================
// FOOTERS / PAGE NUMBERS ON ALL PAGES
// ==========================================
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  
  // Footer divider line
  doc.strokeColor('#e2e8f0')
     .lineWidth(0.8)
     .moveTo(50, 780)
     .lineTo(545, 780)
     .stroke();

  // Footer text
  doc.fillColor('#94a3b8')
     .font('Helvetica')
     .fontSize(8)
     .text('SUBVISION © 2026 - Manual Técnico y Operacional', 50, 788);
  
  doc.text(`Página ${i + 1} de ${range.count}`, 500, 788, { align: 'right' });
}

// End document
doc.end();
console.log('PDF generated successfully at:', outputPdfPath);
