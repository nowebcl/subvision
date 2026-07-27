const fs = require('fs');
const file = 'c:/Users/NOWEB  DESKTOP/Documents/PROYECTOS  ANTIGRAVITY/SUBVISION/public/visor.html';
let content = fs.readFileSync(file, 'utf8');

const newFunc = `    function getMarker3DPosition(report, finding, globalIdx, urlCenterId) {
      let cageId = (finding && finding.jaula) ? finding.jaula : (typeof detectCageId === 'function' ? detectCageId(report) : '101');
      if (!cageId) cageId = '101';
      cageId = cageId.replace('Jaula ', '').trim();

      let lookupId = cageId;
      if (cageId.startsWith('3') || cageId.startsWith('4')) {
        lookupId = '1' + cageId.substring(1);
      }
      
      const parsedNum = parseInt(lookupId, 10);
      let index = 0;
      if (!isNaN(parsedNum) && parsedNum >= 101 && parsedNum <= 110) {
        index = parsedNum - 101;
      }

      const rows = 2;
      const cols = 5;
      const cageW = 22;
      const cageD = 22;
      const cageSpacing = 2; 
      
      const offsetX = (cols * cageW + (cols-1)*cageSpacing) / 2;
      const offsetZ = (rows * cageD + (rows-1)*cageSpacing) / 2;

      const r = Math.floor(index / cols);
      const c = index % cols;

      const cx = -offsetX + cageW/2 + c*(cageW+cageSpacing);
      const cz = -offsetZ + cageD/2 + r*(cageD+cageSpacing);

      const seccion = finding ? (finding.seccion || '').toLowerCase() : '';
      let secKey = 'fondo';
      if (seccion.includes('flotador') || seccion.includes('superficie')) secKey = 'flotador';
      else if (seccion.includes('lateral')) secKey = 'lateral';

      // Variar la posicion con globalIdx para no superponer si hay varios en la misma jaula
      const offsetVariations = [
        [0, 0], [cageW/2, 0], [-cageW/2, 0], [0, cageD/2], [0, -cageD/2],
        [cageW/2, cageD/2], [-cageW/2, -cageD/2]
      ];
      const varIdx = globalIdx % offsetVariations.length;
      const vx = offsetVariations[varIdx][0];
      const vz = offsetVariations[varIdx][1];

      if (secKey === 'flotador') {
        // En la pasarela
        return new THREE.Vector3(cx + vx, 8.5, cz + vz);
      } else if (secKey === 'lateral') {
        // Pared de la malla (Y entre 8 y -4)
        return new THREE.Vector3(cx + vx, 2, cz + vz);
      } else {
        // Fondo (Embudo inferior, Y = -12)
        // El embudo se reduce (bW = cageW * 0.4 = 8.8)
        return new THREE.Vector3(cx + vx * 0.4, -12, cz + vz * 0.4);
      }
    }`;

content = content.replace(/    function getMarker3DPosition\([\s\S]*?(?=    async function loadReportsAndCreateMarkers)/, newFunc + '\n\n');

fs.writeFileSync(file, content);
console.log('MARKER POSITION REPLACEMENT SUCCESSFUL');
