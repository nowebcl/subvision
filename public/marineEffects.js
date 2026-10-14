/**
 * ============================================================================
 * SUBVISION SERVIROV - PHOTOREALISTIC ATLANTIC SALMON & ROV GRAPHICS ENGINE (v3.2)
 * ============================================================================
 * Mejoras Biológicas, Físicas y Telemétricas Submarinas:
 * 1. Morfología anatómica real de Salmón del Atlántico (Salmo salar):
 *    - Proporción esbelta 5.5:1 (cuerpo fusiforme hidrodinámico)
 *    - Aletas pectorales ensanchadas, aleta dorsal, aleta adiposa y caudal ahorquillada
 *    - Textura 1024x512 de piel real (manchas en X, flancos plateados de guanina,
 *      línea lateral irisada, opérculo branquial y ojos anatómicos)
 *    - Mapeo UV longitudinal directo (sin inversión vertical)
 * 2. Cinemática de nado sub-carangiforme en GPU (InstancedBufferAttribute aPhase):
 *    - Cabeza hidrodinámicamente estable, onda propagada cuadrática hacia la aleta caudal
 *    - Alabeo (banking) en giros circulares dentro de cada jaula (volumen 22m x 22m)
 * 3. Iluminación marina y atmósfera oceánica de fiordo templado:
 *    - Fondo y niebla marina realista (#081d33, visibilidad amplia de inspección)
 *    - Faros LED de inspección ROV puros (blanco frío 6000K) acoplados al lente
 *    - Sedimentos orgánicos ("marine snow") y cáusticas subacuáticas
 * 4. Pipeline de post-procesado con aberración cromática, viñeteado y grano de sensor ROV.
 * ============================================================================
 */

(function (global) {
  'use strict';

  // --- 1. GENERADOR DE TEXTURA PROCEDURAL DE ALTA DEFINICIÓN (1024x512) ---
  function createPhotorealisticSalmonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // EJE X (Coordenada U de 0 a 1): Circunferencia anatómica del cuerpo
    // U=0.0 (X=0): Flanco derecho (Plata metálico brillante)
    // U=0.25 (X=256): Lomo dorsal (Gris carbón / verde oliva oscuro con pecas negras)
    // U=0.50 (X=512): Flanco izquierdo (Plata metálico brillante)
    // U=0.75 (X=768): Vientre ventral (Blanco perla puro nacarado)
    // U=1.00 (X=1024): Flanco derecho (Cierre circunferencial continuo)
    const horizGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    horizGrad.addColorStop(0.00, '#c2d2dd'); // Flanco derecho plateado
    horizGrad.addColorStop(0.12, '#627c84'); // Transición dorsal
    horizGrad.addColorStop(0.19, '#253733'); // Lomo dorsal oscuro (verde oliva azulado)
    horizGrad.addColorStop(0.25, '#182622'); // Centro de la espina dorsal
    horizGrad.addColorStop(0.31, '#253733'); // Lomo dorsal
    horizGrad.addColorStop(0.38, '#627c84'); // Transición a flanco izquierdo
    horizGrad.addColorStop(0.50, '#c2d2dd'); // Flanco izquierdo plateado
    horizGrad.addColorStop(0.63, '#e5eff4'); // Transición vientre
    horizGrad.addColorStop(0.75, '#ffffff'); // Vientre blanco nacarado puro
    horizGrad.addColorStop(0.87, '#e5eff4'); // Transición vientre a flanco
    horizGrad.addColorStop(1.00, '#c2d2dd'); // Cierre continuo
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // EJE Y (Coordenada V de 0 a 1): Longitudinal de hocico (Y=0) a cola (Y=512)
    const vertGrad = ctx.createLinearGradient(0, 0, 0, 512);
    vertGrad.addColorStop(0.00, 'rgba(20, 26, 28, 0.65)');   // Hocico y mandíbula oscura
    vertGrad.addColorStop(0.06, 'rgba(30, 42, 45, 0.20)');   // Cabeza
    vertGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.00)');// Flancos limpios reflectantes
    vertGrad.addColorStop(0.84, 'rgba(255, 255, 255, 0.00)');
    vertGrad.addColorStop(0.94, 'rgba(35, 48, 52, 0.40)');   // Pedúnculo caudal
    vertGrad.addColorStop(1.00, 'rgba(20, 30, 35, 0.75)');   // Aleta caudal translúcida
    ctx.fillStyle = vertGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Micro-relieve de escamas reflectantes de guanina
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    for (let sy = 40; sy < 460; sy += 4) {
      for (let sx = 0; sx < 1024; sx += 6) {
        const offset = ((sy / 4) % 2 === 0) ? 3 : 0;
        ctx.fillRect(sx + offset, sy, 2.8, 1.6);
      }
    }

    // Línea lateral sensorial con irisación plata/rosácea característica del salmón adulto
    ctx.fillStyle = 'rgba(225, 185, 205, 0.40)';
    ctx.fillRect(35, 55, 40, 360);  // Flanco derecho
    ctx.fillRect(475, 55, 40, 360); // Flanco izquierdo

    // Manchas negras cruciformes ("X-spots") exclusivas de Salmo salar
    // Concentradas a lo largo del lomo superior (X entre 150 y 360, Y de 60 a 400)
    ctx.fillStyle = 'rgba(12, 16, 15, 0.92)';
    for (let i = 0; i < 380; i++) {
      const x = 160 + (Math.sin(i * 19.3) * 0.5 + 0.5) * 190;
      const y = 60 + (Math.cos(i * 13.7) * 0.5 + 0.5) * 350;
      const r = 1.1 + (Math.sin(i * 5.3) * 0.5 + 0.5) * 2.2;

      // Forma auténtica en X o cruz doble
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.arc(x + 1.6, y + 1.0, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ojos biológicos de salmón: iris dorado/bronce, pupila negra cristalina y brillo corneal
    const renderRealisticEye = (ex, ey) => {
      // Cavidad ocular exterior oscura
      ctx.fillStyle = 'rgba(15, 20, 24, 0.85)';
      ctx.beginPath();
      ctx.arc(ex, ey, 9.0, 0, Math.PI * 2);
      ctx.fill();
      // Anillo de iris bronce-dorado
      ctx.fillStyle = '#c59f35';
      ctx.beginPath();
      ctx.arc(ex, ey, 7.2, 0, Math.PI * 2);
      ctx.fill();
      // Pupila negra azabache
      ctx.fillStyle = '#05070a';
      ctx.beginPath();
      ctx.arc(ex, ey, 4.8, 0, Math.PI * 2);
      ctx.fill();
      // Destello especular de luz
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 1.6, ey - 1.6, 1.8, 0, Math.PI * 2);
      ctx.fill();
    };
    renderRealisticEye(65, 38);
    renderRealisticEye(505, 38);

    // Opérculo branquial con borde metálico curvado
    ctx.strokeStyle = 'rgba(45, 65, 72, 0.90)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(68, 70, 30, -Math.PI * 0.3, Math.PI * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(505, 70, 30, Math.PI * 0.6, Math.PI * 1.3);
    ctx.stroke();

    // Rayos oscuros translúcidos de la aleta caudal
    ctx.strokeStyle = 'rgba(25, 35, 40, 0.50)';
    ctx.lineWidth = 1.6;
    for (let k = 15; k < 1010; k += 16) {
      ctx.beginPath();
      ctx.moveTo(k, 435);
      ctx.lineTo(k, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // flipY = false garantiza que Y=0 (hocico/ojos) coincide con V=0 (Z=+1.65 en la geometría)
    texture.flipY = false;
    return texture;
  }

  // --- 2. GEOMETRÍA ANATÓMICA FUSIFORME (SALMO SALAR CON ALETAS INTEGRALES) ---
  function createPhotorealisticSalmonGeometry() {
    const geo = new THREE.BufferGeometry();

    // 17 anillos longitudinales: hocico afilado (+1.65), torso máximo (0.00), pedúnculo y cola (-1.90)
    // [z, radioHorizontal X, radioVertical Y, centroVertical Y]
    const profile = [
      [ 1.65, 0.005, 0.005,  0.00],  // 0: Punta del hocico
      [ 1.52, 0.055, 0.065, -0.01],  // 1: Mandíbula / boca
      [ 1.35, 0.110, 0.135, -0.01],  // 2: Cabeza pre-ocular
      [ 1.15, 0.155, 0.195, -0.01],  // 3: Posición del ojo
      [ 0.90, 0.190, 0.255,  0.00],  // 4: Opérculo / agallas
      [ 0.60, 0.220, 0.310,  0.01],  // 5: Hombro pectoral
      [ 0.25, 0.240, 0.355,  0.02],  // 6: Pecho / aleta dorsal
      [-0.05, 0.245, 0.360,  0.02],  // 7: Torso medio (espesor máximo)
      [-0.35, 0.230, 0.345,  0.01],  // 8: Post-dorsal
      [-0.65, 0.200, 0.305,  0.00],  // 9: Pelvis
      [-0.95, 0.160, 0.250, -0.01],  // 10: Anal / aleta adiposa
      [-1.20, 0.115, 0.185, -0.01],  // 11: Pre-pedúnculo
      [-1.40, 0.065, 0.120,  0.00],  // 12: Pedúnculo caudal
      [-1.55, 0.035, 0.085,  0.00],  // 13: Base de cola
      [-1.68, 0.018, 0.220,  0.00],  // 14: Expansión de aleta caudal
      [-1.80, 0.012, 0.380,  0.00],  // 15: Pala caudal
      [-1.90, 0.008, 0.480,  0.00]   // 16: Puntas bifurcadas de la cola
    ];

    const rings = profile.length;
    const radialSegments = 16;

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let r = 0; r < rings; r++) {
      const [z, rx, ry, cy] = profile[r];
      const v = r / (rings - 1); // v = 0 en hocico (+1.65), v = 1 en cola (-1.90)

      for (let s = 0; s <= radialSegments; s++) {
        const u = s / radialSegments;
        const angle = u * Math.PI * 2;
        const x = Math.cos(angle) * rx;
        let y = Math.sin(angle) * ry + cy;

        // Aleta dorsal suave (anillos 6 a 9, lomo s=3..5)
        if (r >= 6 && r <= 9 && (s === 3 || s === 4 || s === 5)) {
          const finFactor = 1.0 - Math.abs(r - 7.5) / 2.0;
          y += 0.22 * Math.max(0, finFactor);
        }

        // Aleta adiposa pequeña típica de salmónidos (anillo 11, s=4)
        if (r === 11 && (s === 3 || s === 4 || s === 5)) {
          y += 0.08;
        }

        // Aleta anal ventral (anillo 10, vientre s=11..13)
        if (r === 10 && (s === 11 || s === 12 || s === 13)) {
          y -= 0.11;
        }

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let r = 0; r < rings - 1; r++) {
      for (let s = 0; s < radialSegments; s++) {
        const i0 = r * (radialSegments + 1) + s;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (radialSegments + 1) + s;
        const i3 = i2 + 1;

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    // Aletas pectorales ensanchadas a ambos lados del cuerpo (anillo 5, hombro)
    const baseVCount = positions.length / 3;

    // Aleta pectoral izquierda (flanco izquierdo, x < 0)
    positions.push(
      -0.20, -0.04,  0.60, // base delantera
      -0.21, -0.06,  0.45, // base trasera
      -0.42, -0.14,  0.30, // punta de aleta
      -0.36, -0.10,  0.48  // borde de ataque
    );
    uvs.push(0.50, 0.35, 0.50, 0.40, 0.48, 0.42, 0.49, 0.37);

    // Aleta pectoral derecha (flanco derecho, x > 0)
    positions.push(
       0.20, -0.04,  0.60,
       0.21, -0.06,  0.45,
       0.42, -0.14,  0.30,
       0.36, -0.10,  0.48
    );
    uvs.push(0.00, 0.35, 0.00, 0.40, 0.02, 0.42, 0.01, 0.37);

    // Triángulos de aletas (doble cara)
    indices.push(baseVCount, baseVCount + 2, baseVCount + 1);
    indices.push(baseVCount, baseVCount + 3, baseVCount + 2);
    indices.push(baseVCount, baseVCount + 1, baseVCount + 2);
    indices.push(baseVCount, baseVCount + 2, baseVCount + 3);

    indices.push(baseVCount + 4, baseVCount + 5, baseVCount + 6);
    indices.push(baseVCount + 4, baseVCount + 6, baseVCount + 7);
    indices.push(baseVCount + 4, baseVCount + 6, baseVCount + 5);
    indices.push(baseVCount + 4, baseVCount + 7, baseVCount + 6);

    geo.setIndex(indices);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();

    return geo;
  }

  // --- 3. CARDUMEN DE SALMONES EN GPU (INSTANCEDMESH) ---
  function initSalmonSchool(scene, rows, cols, cageW, cageD, cageSpacing, offsetX, offsetZ) {
    const fishPerCage = 50; // Cardumen natural y equilibrado (~700 peces)
    const totalFish = rows * cols * fishPerCage;

    const fishGeo = createPhotorealisticSalmonGeometry();
    const fishTexture = createPhotorealisticSalmonTexture();

    // Atributo de fase independiente por cada pez para animación GPU
    const aPhaseArray = new Float32Array(totalFish);
    for (let i = 0; i < totalFish; i++) {
      aPhaseArray[i] = Math.random() * Math.PI * 2;
    }
    fishGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(aPhaseArray, 1));

    // Material físico de escamas plateadas húmedas
    const fishMaterial = new THREE.MeshStandardMaterial({
      map: fishTexture,
      roughness: 0.22,  // Brillo especular húmedo
      metalness: 0.52,  // Reflejo metálico plateado genuino
      side: THREE.DoubleSide
    });

    const uniforms = {
      uTime: { value: 0 },
      uSwimSpeed: { value: 5.4 },
      uSwimAmp: { value: 0.16 }
    };

    // Vertex Shader: Locomoción sub-carangiforme (cabeza firme, ondulación cuadrática en la cola)
    fishMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uSwimSpeed = uniforms.uSwimSpeed;
      shader.uniforms.uSwimAmp = uniforms.uSwimAmp;

      shader.vertexShader = `
        attribute float aPhase;
        uniform float uTime;
        uniform float uSwimSpeed;
        uniform float uSwimAmp;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        // Normalización longitudinal de cabeza (+1.65) a cola (-1.90)
        float zNorm = clamp((1.65 - position.z) / 3.55, 0.0, 1.0);
        float tailWhip = pow(zNorm, 1.85); // Aceleración de flexión hacia la aleta caudal

        float freq = 2.8;
        float wave = sin(position.z * freq - uTime * uSwimSpeed + aPhase);

        // Ondulación lateral S-Wave (cabeza estable, cola flexionando con potencia)
        transformed.x += wave * uSwimAmp * tailWhip;
        // Leve flexión vertical coordinada
        transformed.y += sin(position.z * (freq * 0.5) - uTime * uSwimSpeed + aPhase) * (uSwimAmp * 0.08) * tailWhip;
        `
      );
    };

    const instancedMesh = new THREE.InstancedMesh(fishGeo, fishMaterial, totalFish);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const schoolData = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = -offsetX + cageW / 2 + c * (cageW + cageSpacing);
        const cz = -offsetZ + cageD / 2 + r * (cageD + cageSpacing);
        const dir = (r + c) % 2 === 0 ? 1 : -1;

        for (let f = 0; f < fishPerCage; f++) {
          schoolData.push({
            cx,
            cz,
            // Radio en anillo donde circula el banco (2.5m a 9.2m, utilizando todo el volumen abierto de la jaula)
            radiusX: 2.8 + Math.random() * 6.4,
            radiusZ: 2.8 + Math.random() * 6.4,
            depthY: -1.0 - Math.random() * 9.5, // Profundidades bajo el agua: Y = 7.0 a -2.5 (cota 1m a 11m)
            angle: Math.random() * Math.PI * 2,
            speed: (0.35 + Math.random() * 0.20) * dir,
            verticalSpeed: 0.18 + Math.random() * 0.25,
            verticalAmp: 0.3 + Math.random() * 0.5,
            // Escala exacta de salmón adulto (~80 a 95 cm dentro de la jaula de 22 metros)
            scale: 0.25 + Math.random() * 0.04
          });
        }
      }
    }

    const dummy = new THREE.Object3D();

    function update(time) {
      uniforms.uTime.value = time;

      for (let i = 0; i < totalFish; i++) {
        const fish = schoolData[i];
        fish.angle += fish.speed * 0.016;

        const px = fish.cx + Math.cos(fish.angle) * fish.radiusX;
        const pz = fish.cz + Math.sin(fish.angle) * fish.radiusZ;
        const py = fish.depthY + Math.sin(time * fish.verticalSpeed + fish.angle) * fish.verticalAmp;

        dummy.position.set(px, py, pz);

        // Orientación suave en la dirección tangencial del flujo del cardumen
        const nextX = fish.cx + Math.cos(fish.angle + fish.speed * 0.05) * fish.radiusX;
        const nextZ = fish.cz + Math.sin(fish.angle + fish.speed * 0.05) * fish.radiusZ;
        const nextY = fish.depthY + Math.sin(time * fish.verticalSpeed + fish.angle + 0.05) * fish.verticalAmp;

        dummy.lookAt(nextX, nextY, nextZ);
        // Inclinación / alabeo natural del pez al girar en curva (banking angle)
        dummy.rotateZ(-fish.speed * 0.18);
        dummy.scale.set(fish.scale, fish.scale, fish.scale);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    }

    return { instancedMesh, update };
  }

  // --- 4. NIEVE MARINA DISPERSA TRANSLÚCIDA (SEDIMENTOS Y PLANCTON) ---
  function initMarineSnow(scene, particleCount = 1400) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const bounds = { x: 140, yBottom: -50, yTop: 10, z: 90 };

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * bounds.x * 2;
      positions[i * 3 + 1] = bounds.yBottom + Math.random() * (bounds.yTop - bounds.yBottom);
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.012 + 0.004;
      velocities[i * 3 + 1] = -0.016 - Math.random() * 0.020;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(235, 245, 255, 0.75)');
    grad.addColorStop(0.35, 'rgba(190, 230, 245, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      size: 0.9,
      map: texture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    function update(time) {
      const posArr = geo.attributes.position.array;
      const sway = Math.sin(time * 0.5) * 0.010;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArr[i3 + 0] += velocities[i3 + 0] + sway;
        posArr[i3 + 1] += velocities[i3 + 1];
        posArr[i3 + 2] += velocities[i3 + 2];

        if (posArr[i3 + 1] < bounds.yBottom) {
          posArr[i3 + 1] = bounds.yTop;
          posArr[i3 + 0] = (Math.random() - 0.5) * bounds.x * 2;
          posArr[i3 + 2] = (Math.random() - 0.5) * bounds.z * 2;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }

    return { points, update };
  }

  // --- 5. CÁUSTICAS SOLARES SUBMARINAS ---
  function initCaustics(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    const geo = new THREE.PlaneGeometry(190, 80);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const causticsPlane = new THREE.Mesh(geo, mat);
    causticsPlane.rotation.x = -Math.PI / 2;
    causticsPlane.position.set(0, 7.9, 0);
    scene.add(causticsPlane);

    let lastDraw = 0;

    function update(time) {
      if (time - lastDraw < 0.04) return;
      lastDraw = time;

      const imgData = ctx.createImageData(256, 256);
      const data = imgData.data;
      const t = time * 2.0;

      for (let y = 0; y < 256; y += 2) {
        for (let x = 0; x < 256; x += 2) {
          const u = x * 0.055;
          const v = y * 0.055;
          const val = Math.sin(u + t) +
                      Math.sin(v + t * 1.3) +
                      Math.sin((u + v) * 0.8 + t * 1.4);
          const intensity = Math.max(0, Math.floor(Math.pow((val + 3) / 6, 3.2) * 255));

          const baseIdx = (y * 256 + x) * 4;
          data[baseIdx + 0] = Math.min(255, intensity + 35);
          data[baseIdx + 1] = Math.min(255, intensity + 75);
          data[baseIdx + 2] = 255;
          data[baseIdx + 3] = intensity;

          data[baseIdx + 4] = data[baseIdx];
          data[baseIdx + 5] = data[baseIdx + 1];
          data[baseIdx + 6] = data[baseIdx + 2];
          data[baseIdx + 7] = intensity;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      texture.needsUpdate = true;
    }

    return { causticsPlane, update };
  }

  // --- 6. SUPERFICIE MARINA TRANSLÚCIDA (Y = 0) ---
  function initDynamicWaterSurface(scene) {
    const geo = new THREE.PlaneGeometry(1200, 1200, 48, 48);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x092b45,
      transparent: true,
      opacity: 0.20,
      roughness: 0.10,
      metalness: 0.12,
      transmission: 0.88,
      ior: 1.333,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const water = new THREE.Mesh(geo, mat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);

    function update(time) {
      const p = geo.attributes.position;
      const count = p.count;
      const t = time * 1.1;

      for (let i = 0; i < count; i++) {
        const u = p.getX(i);
        const v = p.getY(i);
        const wave = Math.sin(u * 0.035 + t) * 0.18 +
                     Math.cos(v * 0.045 + t * 0.85) * 0.14;
        p.setZ(i, wave);
      }
      geo.computeVertexNormals();
      p.needsUpdate = true;
    }

    return { water, update };
  }

  // --- 7. POST-PROCESADO CINEMATOGRÁFICO DE CÁMARA ROV ---
  function initROVPostProcessing(renderer, scene, camera) {
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    const ROVShader = {
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTime: { value: 0 },
        uAberration: { value: 0.0009 },
        uGrain: { value: 0.007 },
        uVignette: { value: 0.16 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uAberration;
        uniform float uGrain;
        uniform float uVignette;
        varying vec2 vUv;

        float hash(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        void main() {
          vec2 uv = vUv;
          vec2 toCenter = uv - vec2(0.5, 0.5);
          float dist = length(toCenter);

          // 1. Aberración cromática periférica leve
          vec2 disp = toCenter * dist * uAberration;
          float r = texture2D(tDiffuse, uv + disp).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - disp).b;
          vec3 col = vec3(r, g, b);

          // 2. Grano ultra-fino de sensor de video ROV
          float noise = hash(uv * uResolution * 0.5 + vec2(uTime * 15.0, uTime * 28.0));
          col += (noise - 0.5) * uGrain;

          // 3. Viñeteado perimetral sutil
          float vignette = smoothstep(0.98, 0.65, dist * 1.05);
          col *= mix(1.0, vignette, uVignette);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    };

    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const quadScene = new THREE.Scene();
    const quadMat = new THREE.ShaderMaterial({
      ...ROVShader,
      depthTest: false,
      depthWrite: false
    });
    const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat);
    quadScene.add(quadMesh);

    function resize(w, h) {
      renderTarget.setSize(w, h);
      ROVShader.uniforms.uResolution.value.set(w, h);
    }

    function render(time) {
      ROVShader.uniforms.uTime.value = time;
      ROVShader.uniforms.tDiffuse.value = renderTarget.texture;

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.render(quadScene, orthoCamera);
    }

    return { render, resize };
  }

  // --- MOTOR INTEGRADO DE GRÁFICOS MARINOS ---
  function initSubVisionMarineEngine(scene, camera, renderer, options = {}) {
    const rows = options.rows || 2;
    const cols = options.cols || 7;
    const cageW = options.cageW || 22;
    const cageD = options.cageD || 22;
    const cageSpacing = options.cageSpacing || 2;
    const offsetX = options.offsetX || (cols * cageW + (cols - 1) * cageSpacing) / 2;
    const offsetZ = options.offsetZ || (rows * cageD + (rows - 1) * cageSpacing) / 2;

    // Atmósfera marina limpia de fiordo templado
    const waterColor = 0x081d33;
    scene.background = new THREE.Color(waterColor);
    scene.fog = new THREE.FogExp2(waterColor, 0.0028); // Visibilidad submarina clara
    renderer.setClearColor(waterColor, 1);

    // Luz ambiental subacuática suave
    const marineAmbient = new THREE.AmbientLight(0x426b8a, 1.35);
    scene.add(marineAmbient);

    // Luz solar diurna penetrando la columna de agua
    const sunLight = new THREE.DirectionalLight(0xf5fbff, 1.5);
    sunLight.position.set(60, 140, 50);
    scene.add(sunLight);

    // Faros LED de inspección ROV (blanco puro 6000K, montados sobre la cámara)
    const rovLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rovLight.position.set(0, 0, 1);
    camera.add(rovLight);
    scene.add(camera);

    // Subsistemas
    const salmonSchool = initSalmonSchool(scene, rows, cols, cageW, cageD, cageSpacing, offsetX, offsetZ);
    const marineSnow = initMarineSnow(scene, 1400);
    const caustics = initCaustics(scene);
    const waterSurface = initDynamicWaterSurface(scene);
    const postProcessing = initROVPostProcessing(renderer, scene, camera);

    let isUserDragging = false;
    window.addEventListener('pointerdown', () => { isUserDragging = true; });
    window.addEventListener('pointerup', () => { isUserDragging = false; });

    function resize(w, h) {
      postProcessing.resize(w, h);
    }

    function updateAndRender(time) {
      if (!isUserDragging) {
        const driftSpeed = time * 0.35;
        camera.position.x += Math.sin(driftSpeed * 0.6) * 0.012;
        camera.position.y += Math.cos(driftSpeed * 0.4) * 0.008;
        camera.position.z += Math.sin(driftSpeed * 0.5 + 1.0) * 0.012;
      }

      salmonSchool.update(time);
      marineSnow.update(time);
      caustics.update(time);
      waterSurface.update(time);

      try {
        postProcessing.render(time);
      } catch (err) {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      }
    }

    return {
      salmonSchool,
      marineSnow,
      caustics,
      waterSurface,
      postProcessing,
      resize,
      updateAndRender
    };
  }

  global.SubVisionMarineEngine = {
    init: initSubVisionMarineEngine,
    initSalmonSchool,
    initMarineSnow,
    initCaustics,
    initDynamicWaterSurface,
    initROVPostProcessing
  };

})(typeof window !== 'undefined' ? window : this);
