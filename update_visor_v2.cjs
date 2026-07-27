const fs = require('fs');
const file = 'c:/Users/NOWEB  DESKTOP/Documents/PROYECTOS  ANTIGRAVITY/SUBVISION/public/visor.html';
let content = fs.readFileSync(file, 'utf8');

const newCages = `    function createCages() {
      cageGroup = new THREE.Group();

      const rows = 2;
      const cols = 5;
      const cageW = 22;
      const cageD = 22;
      const cageSpacing = 2; 
      
      const offsetX = (cols * cageW + (cols-1)*cageSpacing) / 2;
      const offsetZ = (rows * cageD + (rows-1)*cageSpacing) / 2;

      const walkwayMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const walkwayThick = 1.5;

      // 1. Walkways (Marco de Superficie)
      for (let r = 0; r <= rows; r++) {
        const z = -offsetZ + r * (cageD + cageSpacing) - (r===0 ? 0 : cageSpacing/2);
        const geo = new THREE.BoxGeometry(offsetX * 2, walkwayThick, walkwayThick);
        const mesh = new THREE.Mesh(geo, walkwayMat);
        mesh.position.set(0, 8, z);
        cageGroup.add(mesh);
      }
      for (let c = 0; c <= cols; c++) {
        const x = -offsetX + c * (cageW + cageSpacing) - (c===0 ? 0 : cageSpacing/2);
        const geo = new THREE.BoxGeometry(walkwayThick, walkwayThick, offsetZ * 2);
        const mesh = new THREE.Mesh(geo, walkwayMat);
        mesh.position.set(x, 8, 0);
        cageGroup.add(mesh);
      }

      // Materiales
      const netMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
      const netWireMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6 });
      const pajareraMat = new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 2 });
      const weightMat = new THREE.MeshStandardMaterial({ color: 0xd91616, roughness: 0.5 });
      const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });

      // Geometrias reusables
      const weightGeo = new THREE.ConeGeometry(0.8, 1.5, 8);
      weightGeo.translate(0, -0.75, 0);
      const buoyGeo = new THREE.CylinderGeometry(1.5, 1.0, 2.5, 16);
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = -offsetX + cageW/2 + c*(cageW+cageSpacing);
          const cz = -offsetZ + cageD/2 + r*(cageD+cageSpacing);

          // 2. Red Pajarera (Techo Piramidal)
          const pGeo = new THREE.BufferGeometry();
          const pHeight = 4;
          const pyY = 8 + walkwayThick/2;
          const pPts = [
            new THREE.Vector3(-cageW/2, pyY, -cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
            new THREE.Vector3(cageW/2, pyY, -cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
            new THREE.Vector3(cageW/2, pyY, cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
            new THREE.Vector3(-cageW/2, pyY, cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
            // base rectangle
            new THREE.Vector3(-cageW/2, pyY, -cageD/2), new THREE.Vector3(cageW/2, pyY, -cageD/2),
            new THREE.Vector3(cageW/2, pyY, -cageD/2), new THREE.Vector3(cageW/2, pyY, cageD/2),
            new THREE.Vector3(cageW/2, pyY, cageD/2), new THREE.Vector3(-cageW/2, pyY, cageD/2),
            new THREE.Vector3(-cageW/2, pyY, cageD/2), new THREE.Vector3(-cageW/2, pyY, -cageD/2),
          ];
          pGeo.setFromPoints(pPts);
          const pLine = new THREE.LineSegments(pGeo, pajareraMat);
          pLine.position.set(cx, 0, cz);
          cageGroup.add(pLine);

          // 3. Red Pecera (Caja + Embudo Inferior)
          const netDepth1 = 12; // straight part
          const netDepth2 = 8;  // funnel part
          const bW = cageW * 0.4; // bottom width of funnel
          
          const netGeom = new THREE.BufferGeometry();
          const v = [
            // Top rect (Y = 8)
            -cageW/2, 8, -cageD/2,   cageW/2, 8, -cageD/2,   cageW/2, 8, cageD/2,   -cageW/2, 8, cageD/2,
            // Mid rect (Y = 8 - netDepth1)
            -cageW/2, 8-netDepth1, -cageD/2,   cageW/2, 8-netDepth1, -cageD/2,   cageW/2, 8-netDepth1, cageD/2,   -cageW/2, 8-netDepth1, cageD/2,
            // Bot rect (Y = 8 - netDepth1 - netDepth2)
            -bW/2, 8-netDepth1-netDepth2, -bW/2,   bW/2, 8-netDepth1-netDepth2, -bW/2,   bW/2, 8-netDepth1-netDepth2, bW/2,   -bW/2, 8-netDepth1-netDepth2, bW/2
          ];
          const vertices = new Float32Array(v);
          const indices = [
            0,1,5, 0,5,4, 1,2,6, 1,6,5, 2,3,7, 2,7,6, 3,0,4, 3,4,7, // top walls
            4,5,9, 4,9,8, 5,6,10, 5,10,9, 6,7,11, 6,11,10, 7,4,8, 7,8,11, // funnel walls
            8,9,10, 8,10,11 // bottom floor
          ];
          netGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          netGeom.setIndex(indices);
          netGeom.computeVertexNormals();
          
          const netMesh = new THREE.Mesh(netGeom, netMat);
          netMesh.position.set(cx, 0, cz);
          cageGroup.add(netMesh);

          const edges = new THREE.EdgesGeometry(netGeom);
          const line = new THREE.LineSegments(edges, netWireMat);
          line.position.set(cx, 0, cz);
          cageGroup.add(line);

          // 4. Pesos (Conos Rojos) en el borde inferior del embudo
          const pts = [
            new THREE.Vector3(-bW/2, 8-netDepth1-netDepth2, -bW/2),
            new THREE.Vector3(bW/2, 8-netDepth1-netDepth2, -bW/2),
            new THREE.Vector3(bW/2, 8-netDepth1-netDepth2, bW/2),
            new THREE.Vector3(-bW/2, 8-netDepth1-netDepth2, bW/2)
          ];
          for(let i=0; i<4; i++) {
            const pA = pts[i];
            const pB = pts[(i+1)%4];
            // put 3 weights along each edge
            for(let step=0; step<=3; step++) {
              if (step===3 && i<3) continue; // avoid exact overlap at corners
              const wPos = new THREE.Vector3().lerpVectors(pA, pB, step/3);
              const wMesh = new THREE.Mesh(weightGeo, weightMat);
              wMesh.position.set(cx + wPos.x, wPos.y, cz + wPos.z);
              wMesh.rotation.x = Math.PI; // point down
              cageGroup.add(wMesh);
            }
          }

          // Labels
          const lGeo = new THREE.PlaneGeometry(8, 4);
          const idStr = (100 + (r*cols + c + 1)).toString();
          const lMat = new THREE.MeshBasicMaterial({ map: createLabelTexture(idStr), side: THREE.DoubleSide, transparent: true });
          const lMesh = new THREE.Mesh(lGeo, lMat);
          lMesh.rotation.x = -Math.PI / 2;
          lMesh.position.set(cx, 8.5, cz);
          cageGroup.add(lMesh);
        }
      }

      // 6. Boyas Perimetrales (Cubetas naranjas)
      const boyaY = 7.5;
      for (let r = 0; r <= rows; r++) {
        const z = -offsetZ + r * (cageD + cageSpacing) - (r===0 ? 0 : cageSpacing/2);
        [-offsetX - 4, offsetX + 4].forEach(x => {
          const boya = new THREE.Mesh(buoyGeo, buoyMat);
          boya.position.set(x, boyaY, z);
          cageGroup.add(boya);
        });
      }
      for (let c = 0; c <= cols; c++) {
        const x = -offsetX + c * (cageW + cageSpacing) - (c===0 ? 0 : cageSpacing/2);
        [-offsetZ - 4, offsetZ + 4].forEach(z => {
          const boya = new THREE.Mesh(buoyGeo, buoyMat);
          boya.position.set(x, boyaY, z);
          cageGroup.add(boya);
        });
      }

      scene.add(cageGroup);
    }`;

// Inject new createCages
content = content.replace(/    function createCages\(\) \{[\s\S]*?(?=    function createMooringLines)/, newCages + '\n\n');

// Replace createMooringLines
const newMooring = `    function createMooringLines() {
      // 5. Grilla Submarina y Líneas de Tensión
      const gridY = -35;
      const offsetX = 60;
      const offsetZ = 30;

      const lineMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });
      const mooringMat = new THREE.LineBasicMaterial({ color: 0xd91616, linewidth: 2 }); // Red thick lines

      // Draw underwater grid
      for(let x = -offsetX-20; x <= offsetX+20; x+=20) {
        const pts = [new THREE.Vector3(x, gridY, -offsetZ-20), new THREE.Vector3(x, gridY, offsetZ+20)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, lineMat));
      }
      for(let z = -offsetZ-20; z <= offsetZ+20; z+=20) {
        const pts = [new THREE.Vector3(-offsetX-20, gridY, z), new THREE.Vector3(offsetX+20, gridY, z)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, lineMat));
      }

      // Add spheres at intersections of grid
      const sphGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const sphMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 });
      for(let x = -offsetX-20; x <= offsetX+20; x+=20) {
        for(let z = -offsetZ-20; z <= offsetZ+20; z+=20) {
          const mesh = new THREE.Mesh(sphGeo, sphMat);
          mesh.position.set(x, gridY, z);
          scene.add(mesh);
        }
      }

      // Diagonal Red Mooring Lines (from top corners outwards)
      const topCorners = [
        new THREE.Vector3(-offsetX, 8, -offsetZ),
        new THREE.Vector3(offsetX, 8, -offsetZ),
        new THREE.Vector3(-offsetX, 8, offsetZ),
        new THREE.Vector3(offsetX, 8, offsetZ)
      ];
      const botAnchors = [
        new THREE.Vector3(-offsetX-50, gridY, -offsetZ-50),
        new THREE.Vector3(offsetX+50, gridY, -offsetZ-50),
        new THREE.Vector3(-offsetX-50, gridY, offsetZ+50),
        new THREE.Vector3(offsetX+50, gridY, offsetZ+50)
      ];

      topCorners.forEach((tc, idx) => {
        const pts = [tc, botAnchors[idx]];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, mooringMat));
      });
      
      // Also add red lines from middle edges
      const midTops = [
        new THREE.Vector3(-offsetX, 8, 0), new THREE.Vector3(offsetX, 8, 0)
      ];
      const midBots = [
        new THREE.Vector3(-offsetX-50, gridY, 0), new THREE.Vector3(offsetX+50, gridY, 0)
      ];
      midTops.forEach((tc, idx) => {
        const pts = [tc, midBots[idx]];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, mooringMat));
      });
    }`;

content = content.replace(/    function createMooringLines\(\) \{[\s\S]*?(?=    function onPointerMove)/, newMooring + '\n\n');

// Also inject updated markers to match the new size (approx -50 to 50 X, -30 to 30 Z)
const newMarkersLogic = `
        threeMarkers = [
          { id: 1, position: new THREE.Vector3(-55, 8, -25), title: 'Boya Noroeste', depth: '0.0m', status: 'optimal', description: 'Flotabilidad y tensión dentro de rangos normales.' },
          { id: 2, position: new THREE.Vector3(25, -10, 10), title: 'Pecera Interior Sur', depth: '-12.0m', status: 'warning', description: 'Desgaste superficial en malla exterior.' },
          { id: 3, position: new THREE.Vector3(55, 8, 25), title: 'Boya Sureste', depth: '0.0m', status: 'critical', description: 'Hundimiento anómalo, revisar tensión de fondeo.' },
          { id: 4, position: new THREE.Vector3(-10, -20, 0), title: 'Embudo Central', depth: '-20.0m', status: 'optimal', description: 'Costura de pesos en perfecto estado.' }
        ];

        threeMarkers.forEach(m => {
          createSpriteMarker(m.id, m.position.x, m.position.y, m.position.z, m.status, m.findingId);
        });
`;
content = content.replace(/        threeMarkers = \[[\s\S]*?(?=        threeMarkers\.forEach)/, newMarkersLogic);

fs.writeFileSync(file, content);
console.log('REPLACEMENT V2 SUCCESSFUL');
