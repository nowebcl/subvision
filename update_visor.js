const fs = require('fs');
const file = 'c:/Users/NOWEB  DESKTOP/Documents/PROYECTOS  ANTIGRAVITY/SUBVISION/public/visor.html';
let content = fs.readFileSync(file, 'utf8');

// Replace createSeabed
const newSeabed = `    function createSeabed() {
      const gridHelper = new THREE.GridHelper(400, 40, 0x0e2b5c, 0x0b1c3c);
      gridHelper.position.y = -50;
      scene.add(gridHelper);

      const compassGeo = new THREE.PlaneGeometry(36, 36);
      const compassTexture = createCompassTexture();
      const compassMat = new THREE.MeshBasicMaterial({
        map: compassTexture,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const compassMesh = new THREE.Mesh(compassGeo, compassMat);
      compassMesh.rotation.x = -Math.PI / 2;
      compassMesh.position.set(-42, 7.9, -15);
      scene.add(compassMesh);

      const planeGeo = new THREE.PlaneGeometry(1200, 1200);
      const planeMat = new THREE.MeshStandardMaterial({ color: 0x05122b, roughness: 0.85, metalness: 0.12 });
      const seabedPlane = new THREE.Mesh(planeGeo, planeMat);
      seabedPlane.rotation.x = -Math.PI / 2;
      seabedPlane.position.y = -50.1;
      scene.add(seabedPlane);

      // WATER PLANE at Y=0
      const waterGeo = new THREE.PlaneGeometry(1200, 1200);
      const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
      const waterPlane = new THREE.Mesh(waterGeo, waterMat);
      waterPlane.rotation.x = -Math.PI / 2;
      waterPlane.position.y = 0;
      scene.add(waterPlane);
    }`;

content = content.replace(/    function createSeabed\(\) \{[\s\S]*?(?=    function createCages)/, newSeabed + '\n\n');

// Replace createCages
const newCages = `    function createCages() {
      cageGroup = new THREE.Group();

      // PASARELAS (Y=0.5)
      const pasarelaGeoLarga = new THREE.BoxGeometry(2, 1, 48);
      const pasarelaGeoCorta = new THREE.BoxGeometry(28, 1, 2);
      const pasarelaGeoMedio = new THREE.BoxGeometry(26, 1, 2);
      const pasarelaMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });

      const p1 = new THREE.Mesh(pasarelaGeoLarga, pasarelaMat); p1.position.set(-13, 0.5, 0); cageGroup.add(p1);
      const p2 = new THREE.Mesh(pasarelaGeoLarga, pasarelaMat); p2.position.set(13, 0.5, 0); cageGroup.add(p2);
      const p3 = new THREE.Mesh(pasarelaGeoCorta, pasarelaMat); p3.position.set(0, 0.5, -24); cageGroup.add(p3);
      const p4 = new THREE.Mesh(pasarelaGeoCorta, pasarelaMat); p4.position.set(0, 0.5, 24); cageGroup.add(p4);
      const p5 = new THREE.Mesh(pasarelaGeoMedio, pasarelaMat); p5.position.set(0, 0.5, 0); cageGroup.add(p5);

      // BOYAS (Y=0.5)
      const boyaGeo = new THREE.SphereGeometry(1, 16, 16);
      const boyaMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
      for (let z = -24; z <= 24; z += 12) {
        const b1 = new THREE.Mesh(boyaGeo, boyaMat); b1.position.set(-14, 0.5, z); cageGroup.add(b1);
        const b2 = new THREE.Mesh(boyaGeo, boyaMat); b2.position.set(14, 0.5, z); cageGroup.add(b2);
      }

      // RED PAJARERA (Y 0 to 3)
      const pajareraGroup = new THREE.Group();
      pajareraGroup.position.set(0, 2, 0);
      const pajareraGeo = new THREE.BoxGeometry(26, 3, 48);
      const pajareraEdges = new THREE.EdgesGeometry(pajareraGeo);
      const pajareraLine = new THREE.LineSegments(pajareraEdges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
      pajareraGroup.add(pajareraLine);
      const pajareraMesh = new THREE.Mesh(pajareraGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide }));
      pajareraGroup.add(pajareraMesh);
      cageGroup.add(pajareraGroup);

      // RED LOBERA (Y -40 to 0) - Emissive Cyan
      const loberaGroup = new THREE.Group();
      loberaGroup.position.set(0, -20, 0);
      const loberaGeo = new THREE.BoxGeometry(26, 40, 48);
      const loberaEdges = new THREE.EdgesGeometry(loberaGeo);
      const loberaLine = new THREE.LineSegments(loberaEdges, new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 }));
      loberaGroup.add(loberaLine);
      const loberaMesh = new THREE.Mesh(loberaGeo, new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.2, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }));
      loberaGroup.add(loberaMesh);
      cageGroup.add(loberaGroup);

      // PECERAS (Y -20 to 0) - Electric Blue
      const peceraGeo = new THREE.BoxGeometry(20, 20, 20);
      const peceraEdges = new THREE.EdgesGeometry(peceraGeo);
      const peceraMatLine = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
      const peceraMatMesh = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
      
      const pecera1Group = new THREE.Group();
      pecera1Group.position.set(0, -10, -12);
      pecera1Group.add(new THREE.LineSegments(peceraEdges, peceraMatLine));
      pecera1Group.add(new THREE.Mesh(peceraGeo, peceraMatMesh));
      cageGroup.add(pecera1Group);

      const pecera2Group = new THREE.Group();
      pecera2Group.position.set(0, -10, 12);
      pecera2Group.add(new THREE.LineSegments(peceraEdges, peceraMatLine));
      pecera2Group.add(new THREE.Mesh(peceraGeo, peceraMatMesh));
      cageGroup.add(pecera2Group);

      // Labels
      const labelGeo = new THREE.PlaneGeometry(8, 4);
      const label1Mat = new THREE.MeshBasicMaterial({ map: createLabelTexture('101'), side: THREE.DoubleSide, transparent: true });
      const l1 = new THREE.Mesh(labelGeo, label1Mat); l1.rotation.x = -Math.PI / 2; l1.position.set(0, 1, -12); cageGroup.add(l1);
      
      const label2Mat = new THREE.MeshBasicMaterial({ map: createLabelTexture('102'), side: THREE.DoubleSide, transparent: true });
      const l2 = new THREE.Mesh(labelGeo, label2Mat); l2.rotation.x = -Math.PI / 2; l2.position.set(0, 1, 12); cageGroup.add(l2);

      scene.add(cageGroup);
    }`;

content = content.replace(/    function createCages\(\) \{[\s\S]*?(?=    function createMooringLines)/, newCages + '\n\n');

// Replace createMooringLines
const newMooring = `    function createMooringLines() {
      const anchorPoints = [
        { start: new THREE.Vector3(-13, 0, -24), end: new THREE.Vector3(-50, -50, -70) },
        { start: new THREE.Vector3(13, 0, -24), end: new THREE.Vector3(50, -50, -70) },
        { start: new THREE.Vector3(-13, 0, 24), end: new THREE.Vector3(-50, -50, 70) },
        { start: new THREE.Vector3(13, 0, 24), end: new THREE.Vector3(50, -50, 70) },
        { start: new THREE.Vector3(-13, 0, 0), end: new THREE.Vector3(-60, -50, 0) },
        { start: new THREE.Vector3(13, 0, 0), end: new THREE.Vector3(60, -50, 0) }
      ];

      anchorPoints.forEach(pt => {
        const points = [pt.start, pt.end];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);

        const anchorGeo = new THREE.BoxGeometry(4, 4, 4);
        const anchorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
        const anchor = new THREE.Mesh(anchorGeo, anchorMat);
        anchor.position.copy(pt.end);
        scene.add(anchor);
      });
    }`;

content = content.replace(/    function createMooringLines\(\) \{[\s\S]*?(?=    function onPointerMove)/, newMooring + '\n\n');

// Update markers as well if needed. Since HTML relies on threeMarkers, let's update loadReportsAndCreateMarkers
// to use the exact same coordinates we defined.
const newMarkersLogic = `
        threeMarkers = [
          { id: 1, position: new THREE.Vector3(13, -40, 24), title: 'Vértice Sur-Este', depth: '-40.0m', status: 'optimal', description: 'Tensión de red envolvente óptima.' },
          { id: 2, position: new THREE.Vector3(-10, -15, 0), title: 'Pared Oeste Pecera 101', depth: '-15.0m', status: 'warning', description: 'Desgaste moderado y presencia de biofouling.' },
          { id: 3, position: new THREE.Vector3(0, -40, -24), title: 'Fondo Lobera Norte', depth: '-40.0m', status: 'critical', description: 'Rotura detectada en el paño de fondo envolvente.' },
          { id: 4, position: new THREE.Vector3(-13, 0, -24), title: 'Tensión Fondeo Norte-Oeste', depth: '0.0m', status: 'optimal', description: 'Línea de fondeo operando dentro de los rangos de tensión.' }
        ];

        threeMarkers.forEach(m => {
          createSpriteMarker(m.id, m.position.x, m.position.y, m.position.z, m.status, m.findingId);
        });
`;

// In visor.html, there is a function loadReportsAndCreateMarkers() which sets up threeMarkers
content = content.replace(/        const fixedPositions = \[[\s\S]*?(?=        threeMarkers\.forEach)/, newMarkersLogic);

fs.writeFileSync(file, content);
console.log('REPLACEMENT SUCCESSFUL');
