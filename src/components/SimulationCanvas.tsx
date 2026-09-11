import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { TopicDefinition, SimulationTelemetry } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Compass, 
  Layers, 
  Zap, 
  Activity,
  ChevronRight
} from 'lucide-react';

interface SimulationCanvasProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  onTelemetryUpdate: (telemetry: SimulationTelemetry) => void;
  showVectors: boolean;
  showTrail: boolean;
  showGrid: boolean;
  onToggleVectors: () => void;
  onToggleTrail: () => void;
  onToggleGrid: () => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  topic,
  parameters,
  onTelemetryUpdate,
  showVectors,
  showTrail,
  showGrid,
  onToggleVectors,
  onToggleTrail,
  onToggleGrid
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<'3d' | 'top' | 'front'>('3d');

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const trailLineRef = useRef<THREE.Line | null>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  const simTimeRef = useRef<number>(0);

  // Mouse interaction state for custom Orbit Controls
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 12,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Initialize and update camera position based on spherical coordinates
  const updateCameraTransform = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = cameraTarget.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = cameraTarget.current.y + radius * Math.cos(phi);
    const z = cameraTarget.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTarget.current);
  }, []);

  // Camera preset buttons
  const setCameraPreset = (mode: '3d' | 'top' | 'front') => {
    setCameraMode(mode);
    if (mode === 'top') {
      cameraSpherical.current = { radius: 14, theta: 0, phi: 0.01 };
      cameraTarget.current.set(0, 0, 0);
    } else if (mode === 'front') {
      cameraSpherical.current = { radius: 13, theta: 0, phi: Math.PI / 2 };
      cameraTarget.current.set(0, 1.5, 0);
    } else {
      cameraSpherical.current = { radius: 12, theta: Math.PI / 4, phi: Math.PI / 3 };
      cameraTarget.current.set(0, 1, 0);
    }
    updateCameraTransform();
  };

  // Reset simulation
  const handleReset = () => {
    simTimeRef.current = 0;
    setSimTime(0);
    trailPointsRef.current = [];
    if (trailLineRef.current) {
      trailLineRef.current.geometry.setFromPoints([]);
    }
  };

  // Reset camera view
  const handleResetCamera = () => {
    setCameraPreset('3d');
  };

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Slate-50 background for clean educational contrast
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    setCameraPreset('3d');

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.5, 30);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // 5. Dynamic Group for topic-specific objects
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // 6. Trail Line
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xef4444, // Bright Red
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    trailLine.frustumCulled = false;
    scene.add(trailLine);
    trailLineRef.current = trailLine;

    // 7. Grid & Coordinates
    const gridHelper = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.01;
    gridHelper.name = 'gridHelper';
    scene.add(gridHelper);

    // Coordinate Axes
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.name = 'axesHelper';
    scene.add(axesHelper);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Update Grid visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    const grid = sceneRef.current.getObjectByName('gridHelper');
    const axes = sceneRef.current.getObjectByName('axesHelper');
    if (grid) grid.visible = showGrid;
    if (axes) axes.visible = showGrid;
  }, [showGrid]);

  // Update Trail visibility
  useEffect(() => {
    if (trailLineRef.current) {
      trailLineRef.current.visible = showTrail;
    }
  }, [showTrail]);

  // Reset trail when topic or parameters change
  useEffect(() => {
    trailPointsRef.current = [];
    if (trailLineRef.current) {
      trailLineRef.current.geometry.setFromPoints([]);
    }
    handleReset();
  }, [topic.id]);

  // Build Topic Objects whenever topic changes
  useEffect(() => {
    const group = dynamicGroupRef.current;
    if (!group) return;

    // Clear previous topic elements
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }

    // Populate objects according to topic
    if (topic.id === 'circle-wheel') {
      // 1. Wheel rim (Torus)
      const rimGeo = new THREE.TorusGeometry(1.5, 0.08, 20, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.name = 'wheelRim';
      rim.castShadow = true;

      // Hub (Center)
      const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 32);
      hubGeo.rotateX(Math.PI / 2);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.9, roughness: 0.2 });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.name = 'wheelHub';

      // Spokes (8 căm xe)
      const spokeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
      const spokesGroup = new THREE.Group();
      spokesGroup.name = 'wheelSpokes';
      for (let i = 0; i < 8; i++) {
        const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.0, 12);
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.rotation.z = (i * Math.PI) / 8;
        spokesGroup.add(spoke);
      }

      // Marker point P on the rim (Tracing Cycloid)
      const markerGeo = new THREE.SphereGeometry(0.14, 24, 24);
      const markerMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.name = 'rimMarker';

      // Ground contact indicator
      const contactGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const contactMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Green
      const contactMarker = new THREE.Mesh(contactGeo, contactMat);
      contactMarker.name = 'contactMarker';

      // Road track (Flat plane)
      const roadGeo = new THREE.PlaneGeometry(60, 4);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, -0.01, 0);
      road.receiveShadow = true;
      group.add(road);

      // Road dashed line
      const roadLineGeo = new THREE.PlaneGeometry(60, 0.1);
      roadLineGeo.rotateX(-Math.PI / 2);
      const roadLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const roadLine = new THREE.Mesh(roadLineGeo, roadLineMat);
      roadLine.position.set(0, 0, 0);
      group.add(roadLine);

      // Wheel assembly
      const wheelAssembly = new THREE.Group();
      wheelAssembly.name = 'wheelAssembly';
      wheelAssembly.add(rim);
      wheelAssembly.add(hub);
      wheelAssembly.add(spokesGroup);
      wheelAssembly.add(marker);
      group.add(wheelAssembly);
      group.add(contactMarker);

    } else if (topic.id === 'circle-earth') {
      // Sun at Center
      const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.name = 'sunMesh';
      group.add(sun);

      // Sun Glow Corona
      const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      const sunGlow = new THREE.Mesh(glowGeo, glowMat);
      group.add(sunGlow);

      // Earth Orbit Ring
      const orbitGeo = new THREE.RingGeometry(3.96, 4.04, 128);
      orbitGeo.rotateX(Math.PI / 2);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.name = 'orbitRing';
      group.add(orbitRing);

      // Earth Assembly
      const earthAssembly = new THREE.Group();
      earthAssembly.name = 'earthAssembly';

      const earthGeo = new THREE.SphereGeometry(0.45, 32, 32);
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.6,
        metalness: 0.1,
      });
      const earth = new THREE.Mesh(earthGeo, earthMat);
      earth.name = 'earthMesh';
      earthAssembly.add(earth);

      // Earth Equator line
      const equatorGeo = new THREE.RingGeometry(0.46, 0.48, 64);
      equatorGeo.rotateX(Math.PI / 2);
      const equatorMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
      const equator = new THREE.Mesh(equatorGeo, equatorMat);
      earthAssembly.add(equator);

      // Earth Axis Rod (Nghiêng 23.5°)
      const axisGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 16);
      const axisMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const axis = new THREE.Mesh(axisGeo, axisMat);
      earthAssembly.add(axis);

      // Moon
      const moonOrbit = new THREE.Group();
      moonOrbit.name = 'moonOrbit';
      const moonGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(0.9, 0, 0);
      moonOrbit.add(moon);
      earthAssembly.add(moonOrbit);

      group.add(earthAssembly);

    } else if (topic.id === 'ellipse-kepler') {
      // Sun at Focus 1
      const sunGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.name = 'keplerSun';
      group.add(sun);

      // Focus 2 Marker
      const f2Geo = new THREE.SphereGeometry(0.12, 16, 16);
      const f2Mat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      const f2 = new THREE.Mesh(f2Geo, f2Mat);
      f2.name = 'focus2Marker';
      group.add(f2);

      // Ellipse Path Line
      const ellipsePoints: THREE.Vector3[] = [];
      const segments = 180;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        ellipsePoints.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
      }
      const ellipseGeo = new THREE.BufferGeometry().setFromPoints(ellipsePoints);
      const ellipseMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
      const ellipseLine = new THREE.Line(ellipseGeo, ellipseMat);
      ellipseLine.name = 'ellipseLine';
      group.add(ellipseLine);

      // Swept Area Sector Wedge (Định luật 2 Kepler)
      const sectorGeo = new THREE.BufferGeometry();
      const sectorMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const sectorMesh = new THREE.Mesh(sectorGeo, sectorMat);
      sectorMesh.name = 'sweepSector';
      group.add(sectorMesh);

      // Planet
      const planetGeo = new THREE.SphereGeometry(0.35, 32, 32);
      const planetMat = new THREE.MeshStandardMaterial({
        color: 0x059669, // Emerald
        roughness: 0.4,
        metalness: 0.2,
      });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.name = 'keplerPlanet';
      group.add(planet);

    } else if (topic.id === 'parabola-projectile') {
      // Ground plane
      const groundGeo = new THREE.PlaneGeometry(50, 20);
      groundGeo.rotateX(-Math.PI / 2);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.set(15, 0, 0);
      ground.receiveShadow = true;
      group.add(ground);

      // Launch cannon / pedestal
      const baseGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(0, 0.2, 0);
      group.add(base);

      // Cannon Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16);
      barrelGeo.translate(0, 0.6, 0);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.name = 'cannonBarrel';
      barrel.position.set(0, 0.4, 0);
      group.add(barrel);

      // Theoretical Parabola Guide Curve
      const paraGeo = new THREE.BufferGeometry();
      const paraMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 0.3,
        gapSize: 0.15,
        linewidth: 2,
      });
      const paraLine = new THREE.Line(paraGeo, paraMat);
      paraLine.name = 'parabolaGuide';
      group.add(paraLine);

      // Target impact marker
      const targetGeo = new THREE.RingGeometry(0.2, 0.8, 32);
      targetGeo.rotateX(-Math.PI / 2);
      const targetMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
      const target = new THREE.Mesh(targetGeo, targetMat);
      target.name = 'impactTarget';
      target.position.set(10, 0.02, 0);
      group.add(target);

      // Flying projectile
      const projGeo = new THREE.SphereGeometry(0.25, 24, 24);
      const projMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.7,
        roughness: 0.2,
      });
      const proj = new THREE.Mesh(projGeo, projMat);
      proj.name = 'projectileMesh';
      proj.castShadow = true;
      group.add(proj);

      // Paraboloid reflective dish (in distance to illustrate antenna focus)
      const dishGroup = new THREE.Group();
      dishGroup.name = 'dishAntennaGroup';
      dishGroup.position.set(-6, 3, -6);

      // Dish mesh
      const dishPoints: THREE.Vector2[] = [];
      for (let i = 0; i <= 20; i++) {
        const u = i / 20;
        dishPoints.push(new THREE.Vector2(u * 2.0, (u * u * 2.0) * 0.5));
      }
      const dishGeo = new THREE.LatheGeometry(dishPoints, 32);
      dishGeo.rotateX(Math.PI / 2);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dishGroup.add(dish);

      // Antenna Focus receiver
      const lnbGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const lnbMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const lnb = new THREE.Mesh(lnbGeo, lnbMat);
      lnb.position.set(0, 0, 0.5); // F at 0.5
      dishGroup.add(lnb);

      group.add(dishGroup);

    } else if (topic.id === 'helix-lorentz') {
      // Cylinder guide (Transparent wireframe)
      const cylGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 32, 8, true);
      cylGeo.rotateX(Math.PI / 2);
      const cylMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.name = 'helixCylinder';
      group.add(cyl);

      // Magnetic field lines (Cyan arrows pointing along +Z)
      const bFieldGroup = new THREE.Group();
      bFieldGroup.name = 'bFieldGroup';
      for (let x = -2; x <= 2; x += 2) {
        for (let y = -2; y <= 2; y += 2) {
          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(x, y, -7),
            14,
            0x06b6d4,
            0.5,
            0.25
          );
          bFieldGroup.add(arrow);
        }
      }
      group.add(bFieldGroup);

      // Charged particle (+q)
      const chargeGeo = new THREE.SphereGeometry(0.3, 24, 24);
      const chargeMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Red for positive charge
        emissive: 0xb91c1c,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      });
      const charge = new THREE.Mesh(chargeGeo, chargeMat);
      charge.name = 'chargeMesh';
      group.add(charge);

    } else if (topic.id === 'sine-harmonic') {
      // 1. Phasor Reference Circle (Vòng tròn Fresnel)
      const circleGeo = new THREE.RingGeometry(1.78, 1.82, 64);
      const circleMat = new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(circleGeo, circleMat);
      circle.name = 'fresnelCircle';
      circle.position.set(-4, 0, 0);
      group.add(circle);

      // Phasor arrow vector A
      const phasorLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1.8, 0, 0),
      ]);
      const phasorMat = new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 3 });
      const phasorLine = new THREE.Line(phasorLineGeo, phasorMat);
      phasorLine.name = 'phasorLine';
      phasorLine.position.set(-4, 0, 0);
      group.add(phasorLine);

      // Rotating phasor tip bead
      const beadGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const beadMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.name = 'phasorBead';
      bead.position.set(-4, 0, 0);
      group.add(bead);

      // 2. Harmonic Oscillator (Con lắc lò xo dao động trên trục X)
      const massGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const massMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.6,
        roughness: 0.3,
      });
      const mass = new THREE.Mesh(massGeo, massMat);
      mass.name = 'harmonicMass';
      mass.position.set(0, -2.5, 0);
      group.add(mass);

      // Spring coil
      const springGroup = new THREE.Group();
      springGroup.name = 'springGroup';
      springGroup.position.set(-4, -2.5, 0);
      group.add(springGroup);

      // Equilibrium marker
      const eqGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16);
      const eqMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const eq = new THREE.Mesh(eqGeo, eqMat);
      eq.position.set(0, -2.5, 0);
      group.add(eq);

      // 3. Unfolding Sine Wave Ribbon (Trục thời gian t dạt về phía Z)
      const waveGeo = new THREE.BufferGeometry();
      const waveMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 3 });
      const waveLine = new THREE.Line(waveGeo, waveMat);
      waveLine.name = 'sineWaveLine';
      group.add(waveLine);

      // Projection dotted guide line
      const projGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const projMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 0.2,
        gapSize: 0.1,
      });
      const projLine = new THREE.Line(projGeo, projMat);
      projLine.name = 'projectionGuide';
      group.add(projLine);

    } else if (topic.id === 'custom-parametric') {
      // 3D Parametric curve display
      const curveGeo = new THREE.BufferGeometry();
      const curveMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 3 });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      curveLine.name = 'paramCurveLine';
      group.add(curveLine);

      // Moving particle
      const partGeo = new THREE.SphereGeometry(0.3, 24, 24);
      const partMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xbe185d,
        emissiveIntensity: 0.4,
      });
      const part = new THREE.Mesh(partGeo, partMat);
      part.name = 'paramParticle';
      group.add(part);

      // Bounding box frame
      const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8)), 0xcbd5e1);
      group.add(box);
    }
  }, [topic.id]);

  // Animation & Physics Loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const animate = (now: number) => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        simTimeRef.current += delta * simSpeed;
        setSimTime(simTimeRef.current);
      }

      const t = simTimeRef.current;
      const group = dynamicGroupRef.current;
      if (!group || !sceneRef.current || !rendererRef.current || !cameraRef.current) return;

      // Clean existing vector arrows
      const existingArrows: THREE.Object3D[] = [];
      group.traverse((child) => {
        if (child.name.startsWith('vector_')) {
          existingArrows.push(child);
        }
      });
      existingArrows.forEach((a) => group.remove(a));

      // Helper function to add 3D vector arrow
      const addVectorArrow = (
        name: string,
        origin: THREE.Vector3,
        dir: THREE.Vector3,
        length: number,
        color: number
      ) => {
        if (!showVectors || length <= 0.001) return;
        const normalizedDir = dir.clone().normalize();
        const arrow = new THREE.ArrowHelper(
          normalizedDir,
          origin,
          Math.min(Math.max(length, 0.2), 4.5),
          color,
          0.35,
          0.18
        );
        arrow.name = name;
        group.add(arrow);
      };

      // -------------------------------------------------------------
      // 1. TOPIC: CIRCLE & WHEEL ROLLING (CYCLOID)
      // -------------------------------------------------------------
      if (topic.id === 'circle-wheel') {
        const R = parameters.radius ?? 1.5;
        const omega = parameters.omega ?? 1.8;
        const pointRatio = parameters.pointRatio ?? 1.0;
        const v0 = omega * R; // Tâm vận tốc

        // Scale rim and components
        const wheelAssembly = group.getObjectByName('wheelAssembly') as THREE.Group;
        const rim = group.getObjectByName('wheelRim') as THREE.Mesh;
        const hub = group.getObjectByName('wheelHub') as THREE.Mesh;
        const spokes = group.getObjectByName('wheelSpokes') as THREE.Group;
        const marker = group.getObjectByName('rimMarker') as THREE.Mesh;
        const contactMarker = group.getObjectByName('contactMarker') as THREE.Mesh;

        if (wheelAssembly && rim && marker) {
          rim.scale.set(R / 1.5, R / 1.5, 1);
          hub.position.set(0, 0, 0);
          spokes.scale.set(R / 1.5, R / 1.5, 1);

          // Position of center of wheel
          // Continuous looping along X between -15 and +15
          const cycleDist = 2 * Math.PI * R;
          const rawX = v0 * t;
          const wrappedX = ((rawX + 12) % 24) - 12;
          const theta = wrappedX / R; // Rotation angle

          wheelAssembly.position.set(wrappedX, R, 0);
          wheelAssembly.rotation.z = -theta;

          // Marker point on rim
          const markerLocalY = -R * pointRatio;
          marker.position.set(0, markerLocalY, 0);

          // World position of marker point P
          const markerWorldPos = new THREE.Vector3();
          marker.getWorldPosition(markerWorldPos);

          // Update contact point marker (v=0)
          if (contactMarker) {
            contactMarker.position.set(wrappedX, 0.05, 0);
          }

          // Compute instantaneous velocity at marker point P
          // V_P = V_trans + V_rot = (v0, 0, 0) + (-v_rot*cos(theta), -v_rot*sin(theta))
          // v_tangential = omega * r_point
          const rPoint = R * pointRatio;
          const vx = v0 - omega * rPoint * Math.cos(-theta - Math.PI / 2);
          const vy = -omega * rPoint * Math.sin(-theta - Math.PI / 2);
          const currentV = Math.sqrt(vx * vx + vy * vy);
          const currentA = omega * omega * rPoint;

          // Add Vector arrows
          // 1. Center velocity vector (Cyan)
          addVectorArrow(
            'vector_v0',
            new THREE.Vector3(wrappedX, R, 0),
            new THREE.Vector3(1, 0, 0),
            v0 * 0.8,
            0x06b6d4 // Cyan v0
          );

          // 2. Marker instantaneous velocity vector (Green)
          addVectorArrow(
            'vector_vMarker',
            markerWorldPos,
            new THREE.Vector3(vx, vy, 0),
            currentV * 0.8,
            0x10b981 // Emerald Green
          );

          // 3. Centripetal acceleration toward center (Purple)
          const accelDir = new THREE.Vector3(wrappedX, R, 0).sub(markerWorldPos);
          addVectorArrow(
            'vector_accel',
            markerWorldPos,
            accelDir,
            1.2,
            0xa855f7 // Purple
          );

          // Update trail (Cycloid curve)
          if (showTrail) {
            if (trailPointsRef.current.length > 500) trailPointsRef.current.shift();
            // Only add if not wrapped jump
            const last = trailPointsRef.current[trailPointsRef.current.length - 1];
            if (!last || last.distanceTo(markerWorldPos) < 2.0) {
              trailPointsRef.current.push(markerWorldPos.clone());
            } else {
              trailPointsRef.current = [markerWorldPos.clone()];
            }
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          // Send Telemetry
          onTelemetryUpdate({
            time: t,
            x: markerWorldPos.x,
            y: markerWorldPos.y,
            z: markerWorldPos.z,
            velocity: currentV,
            acceleration: currentA,
            extraInfo: [
              { label: 'Vận tốc tâm xe v₀', value: `${v0.toFixed(2)} m/s` },
              { label: 'Vận tốc đỉnh bánh xe (2v₀)', value: `${(2 * v0).toFixed(2)} m/s` },
              { label: 'Vận tốc điểm tiếp xúc chân', value: `0.00 m/s (Tâm quay tức thời)` },
              { label: 'Gia tốc hướng tâm an', value: `${currentA.toFixed(2)} m/s²` },
            ],
          });
        }
      }

      // -------------------------------------------------------------
      // 2. TOPIC: CIRCLE/SPHERE & EARTH ORBIT
      // -------------------------------------------------------------
      else if (topic.id === 'circle-earth') {
        const rOrbit = parameters.orbitRadius ?? 4.0;
        const M = parameters.sunMass ?? 1.2;
        const tiltDeg = parameters.tiltAngle ?? 23.5;

        // Circular orbital velocity v = sqrt(GM/r)
        const G = 4.0; // Scaled gravitational constant
        const v = Math.sqrt((G * M) / rOrbit);
        const omega = v / rOrbit;
        const period = (2 * Math.PI) / omega;
        const currentAngle = omega * t;

        // Update Orbit Ring
        const orbitRing = group.getObjectByName('orbitRing') as THREE.Mesh;
        if (orbitRing) {
          orbitRing.scale.set(rOrbit / 4.0, rOrbit / 4.0, 1);
        }

        // Earth position in XZ plane
        const earthX = rOrbit * Math.cos(currentAngle);
        const earthZ = rOrbit * Math.sin(currentAngle);

        const earthAssembly = group.getObjectByName('earthAssembly') as THREE.Group;
        const earthMesh = group.getObjectByName('earthMesh') as THREE.Mesh;
        const moonOrbit = group.getObjectByName('moonOrbit') as THREE.Group;

        if (earthAssembly && earthMesh) {
          earthAssembly.position.set(earthX, 0, earthZ);
          // Set axial tilt: rotate Z by tiltDeg
          earthAssembly.rotation.z = (tiltDeg * Math.PI) / 180;
          // Self rotation around axis
          earthMesh.rotation.y = t * 3.0;

          // Moon orbit around Earth
          if (moonOrbit) {
            moonOrbit.rotation.y = t * 5.0;
          }

          const earthPos = new THREE.Vector3(earthX, 0, earthZ);

          // Tangential velocity direction: (-sin(angle), 0, cos(angle))
          const vDir = new THREE.Vector3(-Math.sin(currentAngle), 0, Math.cos(currentAngle));
          addVectorArrow('vector_v', earthPos, vDir, v * 1.5, 0x10b981);

          // Gravitational Centripetal force towards Sun (0,0,0)
          const fDir = new THREE.Vector3(-earthX, 0, -earthZ);
          const a_ht = (v * v) / rOrbit;
          addVectorArrow('vector_fhd', earthPos, fDir, a_ht * 2.0, 0xef4444);

          // Trail
          if (showTrail) {
            if (trailPointsRef.current.length > 300) trailPointsRef.current.shift();
            trailPointsRef.current.push(earthPos.clone());
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          onTelemetryUpdate({
            time: t,
            x: earthX,
            y: 0,
            z: earthZ,
            velocity: v,
            acceleration: a_ht,
            extraInfo: [
              { label: 'Bán kính r', value: `${rOrbit.toFixed(2)} AU` },
              { label: 'Chu kỳ quỹ đạo T', value: `${period.toFixed(2)} s` },
              { label: 'Lực hấp dẫn Fhd', value: `${(a_ht * 10).toFixed(2)} N (đóng vai trò Fht)` },
              { label: 'Độ nghiêng trục', value: `${tiltDeg.toFixed(1)}° (tạo ra 4 mùa)` },
            ],
          });
        }
      }

      // -------------------------------------------------------------
      // 3. TOPIC: ELLIPSE & KEPLER ORBIT
      // -------------------------------------------------------------
      else if (topic.id === 'ellipse-kepler') {
        const a = parameters.semiMajor ?? 4.0;
        const e = parameters.eccentricity ?? 0.55;
        const M = parameters.centralMass ?? 1.5;

        const b = a * Math.sqrt(1 - e * e);
        const c = a * e; // Distance from center to focus

        // Position Sun at Focus 1 (+c, 0, 0) and Focus 2 at (-c, 0, 0)
        const sun = group.getObjectByName('keplerSun') as THREE.Mesh;
        const f2 = group.getObjectByName('focus2Marker') as THREE.Mesh;
        const ellipseLine = group.getObjectByName('ellipseLine') as THREE.Line;
        const planet = group.getObjectByName('keplerPlanet') as THREE.Mesh;
        const sweepSector = group.getObjectByName('sweepSector') as THREE.Mesh;

        if (sun) sun.position.set(c, 0, 0);
        if (f2) f2.position.set(-c, 0, 0);

        // Update Ellipse geometry
        if (ellipseLine) {
          const pts: THREE.Vector3[] = [];
          for (let i = 0; i <= 120; i++) {
            const th = (i / 120) * Math.PI * 2;
            pts.push(new THREE.Vector3(a * Math.cos(th), 0, b * Math.sin(th)));
          }
          ellipseLine.geometry.setFromPoints(pts);
        }

        // Kepler's equation solver for eccentric anomaly E:
        // M_anomaly = n * t = (2*pi/T) * t
        // E - e*sin(E) = M_anomaly
        const GM = 12.0 * M;
        const n = Math.sqrt(GM / (a * a * a));
        const period = (2 * Math.PI) / n;
        const MeanAnomaly = (n * t) % (2 * Math.PI);

        // Newton-Raphson to find E
        let E = MeanAnomaly;
        for (let iter = 0; iter < 6; iter++) {
          E = E - (E - e * Math.sin(E) - MeanAnomaly) / (1 - e * Math.cos(E));
        }

        // Planet coordinate relative to center of ellipse
        const planetX = a * Math.cos(E);
        const planetZ = b * Math.sin(E);

        if (planet) {
          planet.position.set(planetX, 0, planetZ);

          // Vector from Sun at (c,0,0) to planet
          const rVec = new THREE.Vector3(planetX - c, 0, planetZ);
          const rDist = rVec.length();

          // Vis-viva equation: v = sqrt(GM * (2/r - 1/a))
          const currentV = Math.sqrt(Math.max(GM * (2 / rDist - 1 / a), 0.1));

          // Tangential direction: (-a*sin(E), 0, b*cos(E))
          const vDir = new THREE.Vector3(-a * Math.sin(E), 0, b * Math.cos(E)).normalize();
          addVectorArrow('vector_vKepler', new THREE.Vector3(planetX, 0, planetZ), vDir, currentV * 0.7, 0x10b981);

          // Centripetal gravitational pull to Sun
          const pullDir = new THREE.Vector3(c - planetX, 0, -planetZ).normalize();
          addVectorArrow('vector_fKepler', new THREE.Vector3(planetX, 0, planetZ), pullDir, (GM / (rDist * rDist)) * 0.4, 0xef4444);

          // Swept Area triangle mesh (Định luật 2 Kepler: Diện tích quét)
          if (sweepSector) {
            const prevE = E - 0.25;
            const prevX = a * Math.cos(prevE);
            const prevZ = b * Math.sin(prevE);

            const sectorGeo = new THREE.BufferGeometry();
            const verts = new Float32Array([
              c, 0, 0, // Sun focus
              prevX, 0, prevZ, // previous planet position
              planetX, 0, planetZ, // current planet position
            ]);
            sectorGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
            sweepSector.geometry.dispose();
            sweepSector.geometry = sectorGeo;
          }

          // Trail
          if (showTrail) {
            if (trailPointsRef.current.length > 300) trailPointsRef.current.shift();
            trailPointsRef.current.push(new THREE.Vector3(planetX, 0, planetZ));
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          const r_per = a * (1 - e);
          const r_ap = a * (1 + e);
          const v_per = Math.sqrt(GM * (2 / r_per - 1 / a));
          const v_ap = Math.sqrt(GM * (2 / r_ap - 1 / a));

          onTelemetryUpdate({
            time: t,
            x: planetX,
            y: 0,
            z: planetZ,
            velocity: currentV,
            acceleration: GM / (rDist * rDist),
            extraInfo: [
              { label: 'Khoảng cách tới Mặt Trời r', value: `${rDist.toFixed(2)} đv` },
              { label: 'Cận điểm r_per / Viễn điểm r_ap', value: `${r_per.toFixed(2)} / ${r_ap.toFixed(2)}` },
              { label: 'Vận tốc cận điểm v_max', value: `${v_per.toFixed(2)} đv/s` },
              { label: 'Vận tốc viễn điểm v_min', value: `${v_ap.toFixed(2)} đv/s` },
              { label: 'Chu kỳ quỹ đạo T', value: `${period.toFixed(2)} s` },
            ],
          });
        }
      }

      // -------------------------------------------------------------
      // 4. TOPIC: PARABOLA & PROJECTILE MOTION
      // -------------------------------------------------------------
      else if (topic.id === 'parabola-projectile') {
        const v0 = parameters.v0 ?? 14;
        const angleDeg = parameters.angle ?? 45;
        const g = parameters.gravity ?? 9.8;

        const rad = (angleDeg * Math.PI) / 180;
        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);

        const totalTime = (2 * v0y) / g;
        const range = v0x * totalTime;
        const maxHeight = (v0y * v0y) / (2 * g);

        // Update Cannon barrel tilt
        const barrel = group.getObjectByName('cannonBarrel') as THREE.Mesh;
        if (barrel) {
          barrel.rotation.z = rad - Math.PI / 2;
        }

        // Update Impact Target
        const target = group.getObjectByName('impactTarget') as THREE.Mesh;
        if (target) {
          target.position.set(range, 0.02, 0);
        }

        // Update Parabola guide line
        const paraGuide = group.getObjectByName('parabolaGuide') as THREE.Line;
        if (paraGuide) {
          const guidePts: THREE.Vector3[] = [];
          for (let step = 0; step <= 60; step++) {
            const timeStep = (step / 60) * totalTime;
            const gx = v0x * timeStep;
            const gy = Math.max(0, v0y * timeStep - 0.5 * g * timeStep * timeStep);
            guidePts.push(new THREE.Vector3(gx, gy, 0));
          }
          paraGuide.geometry.setFromPoints(guidePts);
          (paraGuide as any).computeLineDistances?.();
        }

        // Current cyclic time along projectile flight
        const cycleTime = totalTime + 1.0; // 1s pause at impact before reset
        const currentT = t % cycleTime;
        const activeT = Math.min(currentT, totalTime);

        const projX = v0x * activeT;
        const projY = Math.max(0, v0y * activeT - 0.5 * g * activeT * activeT);
        const currentVy = v0y - g * activeT;
        const currentV = Math.sqrt(v0x * v0x + currentVy * currentVy);

        const proj = group.getObjectByName('projectileMesh') as THREE.Mesh;
        if (proj) {
          proj.position.set(projX, projY, 0);

          // Vector vx (horizontal, constant length)
          addVectorArrow('vector_vx', new THREE.Vector3(projX, projY, 0), new THREE.Vector3(1, 0, 0), (v0x / 14) * 1.5, 0x0ea5e9);

          // Vector vy (vertical, changing)
          if (Math.abs(currentVy) > 0.3) {
            addVectorArrow(
              'vector_vy',
              new THREE.Vector3(projX, projY, 0),
              new THREE.Vector3(0, currentVy > 0 ? 1 : -1, 0),
              (Math.abs(currentVy) / 14) * 1.5,
              0xf59e0b
            );
          }

          // Composite velocity v (tangent)
          addVectorArrow(
            'vector_vComposite',
            new THREE.Vector3(projX, projY, 0),
            new THREE.Vector3(v0x, currentVy, 0),
            (currentV / 14) * 2.0,
            0x10b981
          );

          // Gravity acceleration g downwards
          addVectorArrow('vector_g', new THREE.Vector3(projX, projY, 0), new THREE.Vector3(0, -1, 0), 1.2, 0xef4444);

          // Trail
          if (showTrail) {
            if (activeT < 0.05) trailPointsRef.current = [];
            if (trailPointsRef.current.length > 200) trailPointsRef.current.shift();
            trailPointsRef.current.push(new THREE.Vector3(projX, projY, 0));
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          onTelemetryUpdate({
            time: activeT,
            x: projX,
            y: projY,
            z: 0,
            velocity: currentV,
            acceleration: g,
            extraInfo: [
              { label: 'Tầm bay xa L (Range)', value: `${range.toFixed(2)} m` },
              { label: 'Tầm bay cao Hmax', value: `${maxHeight.toFixed(2)} m` },
              { label: 'Vận tốc ngang vx (hằng số)', value: `${v0x.toFixed(2)} m/s` },
              { label: 'Vận tốc đứng vy(t)', value: `${currentVy.toFixed(2)} m/s` },
              { label: 'Tổng thời gian bay t_bay', value: `${totalTime.toFixed(2)} s` },
            ],
          });
        }
      }

      // -------------------------------------------------------------
      // 5. TOPIC: HELIX (CYLINDER) & LORENTZ FORCE
      // -------------------------------------------------------------
      else if (topic.id === 'helix-lorentz') {
        const v = parameters.velocity ?? 5.0;
        const pitchAngle = parameters.pitchAngle ?? 45;
        const B = parameters.bField ?? 1.5;

        const rad = (pitchAngle * Math.PI) / 180;
        const v_perp = v * Math.sin(rad);
        const v_parallel = v * Math.cos(rad);

        // R = m*v_perp / (q*B). Assume q=1, m=1
        const R = v_perp / (0.8 * B);
        const omega = (0.8 * B); // qB/m
        const period = (2 * Math.PI) / omega;
        const pitchStep = v_parallel * period; // Bước xoắn h

        // Update Cylinder scale
        const cyl = group.getObjectByName('helixCylinder') as THREE.Mesh;
        if (cyl) {
          cyl.scale.set(R / 1.5, R / 1.5, 1);
        }

        // Cyclic time between -5 and +5 on Z axis
        const zPos = ((v_parallel * 0.4 * t + 5) % 10) - 5;
        const angle = omega * t;
        const posX = R * Math.cos(angle);
        const posY = R * Math.sin(angle);

        const charge = group.getObjectByName('chargeMesh') as THREE.Mesh;
        if (charge) {
          charge.position.set(posX, posY, zPos);

          // Velocity vector v
          // vx = -v_perp*sin(angle), vy = v_perp*cos(angle), vz = v_parallel
          const vx = -v_perp * Math.sin(angle);
          const vy = v_perp * Math.cos(angle);
          const vz = v_parallel;
          addVectorArrow('vector_vHelix', new THREE.Vector3(posX, posY, zPos), new THREE.Vector3(vx, vy, vz), 1.8, 0x10b981);

          // Lorentz force F_L = q(v x B). B is along (0,0,1).
          // v x B = (vy*1 - 0, -vx*1 - 0, 0) = (vy, -vx, 0)
          // = (v_perp*cos(angle), v_perp*sin(angle), 0) pointing inward to center!
          addVectorArrow('vector_fLorentz', new THREE.Vector3(posX, posY, zPos), new THREE.Vector3(-posX, -posY, 0), 1.5, 0xef4444);

          // Trail
          if (showTrail) {
            if (trailPointsRef.current.length > 400) trailPointsRef.current.shift();
            const currentPos = new THREE.Vector3(posX, posY, zPos);
            const last = trailPointsRef.current[trailPointsRef.current.length - 1];
            if (!last || last.distanceTo(currentPos) < 1.5) {
              trailPointsRef.current.push(currentPos);
            } else {
              trailPointsRef.current = [currentPos];
            }
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          onTelemetryUpdate({
            time: t,
            x: posX,
            y: posY,
            z: zPos,
            velocity: v,
            acceleration: (v_perp * v_perp) / R,
            extraInfo: [
              { label: 'Bán kính xoắn R', value: `${R.toFixed(2)} m` },
              { label: 'Bước xoắn h (Pitch)', value: `${pitchStep.toFixed(2)} m` },
              { label: 'Vận tốc quay vuông góc v⊥', value: `${v_perp.toFixed(2)} m/s` },
              { label: 'Vận tốc tịnh tiến v∥', value: `${v_parallel.toFixed(2)} m/s` },
              { label: 'Chu kỳ cyclotron T', value: `${period.toFixed(2)} s` },
            ],
          });
        }
      }

      // -------------------------------------------------------------
      // 6. TOPIC: SINE WAVE & HARMONIC OSCILLATOR (FRESNEL)
      // -------------------------------------------------------------
      else if (topic.id === 'sine-harmonic') {
        const A = parameters.amplitude ?? 1.8;
        const omega = parameters.freq ?? 1.5;
        const phi = parameters.initialPhase ?? 0;

        const phase = omega * t + phi;
        const xVal = A * Math.cos(phase);
        const vVal = -omega * A * Math.sin(phase);
        const aVal = -omega * omega * xVal;

        // Energy: W_t = 0.5 * k * x^2; W_d = 0.5 * m * v^2; W_tot = 0.5 * k * A^2
        const k = 10;
        const m = 1;
        const W_t = 0.5 * k * xVal * xVal;
        const W_d = 0.5 * m * vVal * vVal;
        const W_tot = 0.5 * k * A * A;

        // Update Phasor Disc and Bead
        const phasorLine = group.getObjectByName('phasorLine') as THREE.Line;
        const bead = group.getObjectByName('phasorBead') as THREE.Mesh;
        const circle = group.getObjectByName('fresnelCircle') as THREE.Mesh;

        if (circle) {
          circle.scale.set(A / 1.8, A / 1.8, 1);
        }

        const phasorEndX = -4 + A * Math.cos(phase);
        const phasorEndY = A * Math.sin(phase);

        if (phasorLine) {
          const pts = [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(phasorEndX, phasorEndY, 0)];
          phasorLine.geometry.setFromPoints(pts);
        }
        if (bead) {
          bead.position.set(phasorEndX, phasorEndY, 0);
        }

        // Oscillating Mass block
        const mass = group.getObjectByName('harmonicMass') as THREE.Mesh;
        if (mass) {
          mass.position.set(xVal, -2.5, 0);

          // Velocity vector of oscillator
          addVectorArrow('vector_vHarmonic', new THREE.Vector3(xVal, -2.5, 0), new THREE.Vector3(vVal > 0 ? 1 : -1, 0, 0), (Math.abs(vVal) / (omega * A)) * 1.6, 0x10b981);

          // Restoring Force F = -kx (pointing towards 0)
          addVectorArrow('vector_fHarmonic', new THREE.Vector3(xVal, -2.5, 0), new THREE.Vector3(-xVal, 0, 0), (Math.abs(xVal) / A) * 1.6, 0xef4444);
        }

        // Spring representation: Dynamic cylinder stretched between -4 and xVal
        const springGroup = group.getObjectByName('springGroup') as THREE.Group;
        if (springGroup) {
          while (springGroup.children.length > 0) {
            springGroup.remove(springGroup.children[0]);
          }
          const springLen = Math.max(xVal - (-4), 0.2);
          const coilGeo = new THREE.CylinderGeometry(0.18, 0.18, springLen, 12);
          coilGeo.rotateZ(Math.PI / 2);
          const coilMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
          const coil = new THREE.Mesh(coilGeo, coilMat);
          coil.position.set(springLen / 2, 0, 0);
          springGroup.add(coil);
        }

        // Projection guide from rotating phasor to oscillating coordinate
        const projGuide = group.getObjectByName('projectionGuide') as THREE.Line;
        if (projGuide) {
          projGuide.geometry.setFromPoints([
            new THREE.Vector3(phasorEndX, phasorEndY, 0),
            new THREE.Vector3(xVal, -2.5, 0),
          ]);
        }

        // Unfolding Sine Wave Ribbon along Z
        const sineWaveLine = group.getObjectByName('sineWaveLine') as THREE.Line;
        if (sineWaveLine) {
          const wavePts: THREE.Vector3[] = [];
          const stepCount = 100;
          for (let i = 0; i <= stepCount; i++) {
            const zDist = (i / stepCount) * 8; // extends forward in Z
            const pastPhase = phase - (zDist / 8) * (2 * Math.PI);
            wavePts.push(new THREE.Vector3(A * Math.cos(pastPhase), -2.5, zDist));
          }
          sineWaveLine.geometry.setFromPoints(wavePts);
        }

        onTelemetryUpdate({
          time: t,
          x: xVal,
          y: 0,
          z: 0,
          velocity: Math.abs(vVal),
          acceleration: Math.abs(aVal),
          extraInfo: [
            { label: 'Li độ dao động x(t)', value: `${xVal.toFixed(2)} m` },
            { label: 'Vận tốc tức thời v(t)', value: `${vVal.toFixed(2)} m/s` },
            { label: 'Gia tốc a(t) = -ω²x', value: `${aVal.toFixed(2)} m/s²` },
            { label: 'Động năng W_đ', value: `${W_d.toFixed(2)} J` },
            { label: 'Thế năng W_t', value: `${W_t.toFixed(2)} J` },
            { label: 'Cơ năng bảo toàn W', value: `${W_tot.toFixed(2)} J (hằng số)` },
          ],
        });
      }

      // -------------------------------------------------------------
      // 7. TOPIC: CUSTOM PARAMETRIC 3D
      // -------------------------------------------------------------
      else if (topic.id === 'custom-parametric') {
        const A = parameters.scaleA ?? 2.0;
        const B = parameters.scaleB ?? 2.0;
        const k = parameters.paramSpeed ?? 1.2;

        // Parametric Lissajous 3D Curve
        // x(t) = A * sin(2*k*t)
        // y(t) = B * cos(3*k*t)
        // z(t) = 1.5 * sin(4*k*t)
        const tau = k * t;
        const px = A * Math.sin(2 * tau);
        const py = B * Math.cos(3 * tau);
        const pz = 1.5 * Math.sin(4 * tau);

        // Velocity vector (derivatives)
        const vx = 2 * k * A * Math.cos(2 * tau);
        const vy = -3 * k * B * Math.sin(3 * tau);
        const vz = 6 * k * Math.cos(4 * tau);
        const vMag = Math.sqrt(vx * vx + vy * vy + vz * vz);

        // Acceleration vector (2nd derivatives)
        const ax = -4 * k * k * A * Math.sin(2 * tau);
        const ay = -9 * k * k * B * Math.cos(3 * tau);
        const az = -24 * k * k * Math.sin(4 * tau);
        const aMag = Math.sqrt(ax * ax + ay * ay + az * az);

        const curveLine = group.getObjectByName('paramCurveLine') as THREE.Line;
        if (curveLine) {
          const pts: THREE.Vector3[] = [];
          for (let i = 0; i <= 200; i++) {
            const s = (i / 200) * 2 * Math.PI;
            pts.push(new THREE.Vector3(A * Math.sin(2 * s), B * Math.cos(3 * s), 1.5 * Math.sin(4 * s)));
          }
          curveLine.geometry.setFromPoints(pts);
        }

        const part = group.getObjectByName('paramParticle') as THREE.Mesh;
        if (part) {
          part.position.set(px, py, pz);

          // Velocity vector
          addVectorArrow('vector_vParam', new THREE.Vector3(px, py, pz), new THREE.Vector3(vx, vy, vz), 1.8, 0x10b981);

          // Acceleration / Required Force vector
          addVectorArrow('vector_aParam', new THREE.Vector3(px, py, pz), new THREE.Vector3(ax, ay, az), 1.8, 0xef4444);

          if (showTrail) {
            if (trailPointsRef.current.length > 300) trailPointsRef.current.shift();
            trailPointsRef.current.push(new THREE.Vector3(px, py, pz));
            if (trailLineRef.current) {
              trailLineRef.current.geometry.setFromPoints(trailPointsRef.current);
            }
          }

          onTelemetryUpdate({
            time: t,
            x: px,
            y: py,
            z: pz,
            velocity: vMag,
            acceleration: aMag,
            extraInfo: [
              { label: 'Tọa độ r(t)', value: `(${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)})` },
              { label: 'Vận tốc tiếp tuyến v', value: `${vMag.toFixed(2)} đv/s` },
              { label: 'Gia tốc tổng hợp a', value: `${aMag.toFixed(2)} đv/s²` },
              { label: 'Lực quán tính F = m·a', value: `${(aMag * 1.5).toFixed(2)} N` },
            ],
          });
        }
      }

      // Render Scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [topic.id, parameters, isPlaying, simSpeed, showVectors, showTrail, onTelemetryUpdate]);

  // Pointer event handlers for intuitive 3D camera controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    // Right-click or middle-click or Shift+drag: Pan camera
    if (e.buttons === 2 || e.buttons === 4 || e.shiftKey) {
      const panSpeed = 0.015;
      cameraTarget.current.x -= deltaX * panSpeed;
      cameraTarget.current.y += deltaY * panSpeed;
    } else {
      // Left click: Orbit camera
      const rotateSpeed = 0.008;
      cameraSpherical.current.theta -= deltaX * rotateSpeed;
      cameraSpherical.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSpherical.current.phi - deltaY * rotateSpeed)
      );
    }
    updateCameraTransform();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.002;
    cameraSpherical.current.radius = Math.max(
      3,
      Math.min(35, cameraSpherical.current.radius * (1 + e.deltaY * zoomSpeed))
    );
    updateCameraTransform();
  };

  return (
    <div
      ref={containerRef}
      id="simulation-canvas-container"
      className="relative w-full h-full min-h-[460px] bg-slate-900 overflow-hidden select-none rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between"
    >
      {/* Three.js Canvas Element */}
      <canvas
        ref={canvasRef}
        id="three-webgl-canvas"
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top HUD: Topic Banner & Camera View Presets */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md text-white pointer-events-auto flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-100">
            {topic.title.split('→')[0]}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs font-medium text-emerald-400">
            {topic.gradeLevel}
          </span>
        </div>

        {/* Camera Views & Fullscreen/Reset */}
        <div className="flex items-center space-x-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 pointer-events-auto shadow-md">
          <button
            id="btn-cam-3d"
            type="button"
            onClick={() => setCameraPreset('3d')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              cameraMode === '3d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            3D Góc nhìn
          </button>
          <button
            id="btn-cam-front"
            type="button"
            onClick={() => setCameraPreset('front')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              cameraMode === 'front'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Mặt trước 2D
          </button>
          <button
            id="btn-cam-top"
            type="button"
            onClick={() => setCameraPreset('top')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              cameraMode === 'top'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Nhìn từ trên (Top)
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            id="btn-cam-reset"
            type="button"
            onClick={handleResetCamera}
            title="Đặt lại góc nhìn camera"
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Legend Overlays (Color Codes for Vectors) */}
      <div className="relative z-10 px-4 pointer-events-none hidden sm:flex flex-col gap-1.5">
        {showVectors && (
          <div className="self-start bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/70 text-xs text-slate-200 flex flex-col gap-1 shadow-sm">
            <span className="font-semibold text-slate-400 mb-0.5">Vector Chuyển Động:</span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-1 bg-emerald-500 rounded" />
              <span>Véc-tơ Vận tốc tiếp tuyến (v)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-1 bg-rose-500 rounded" />
              <span>Véc-tơ Gia tốc / Lực hướng tâm (a, F)</span>
            </div>
            {topic.id === 'circle-wheel' && (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-1 bg-cyan-400 rounded" />
                <span>Vận tốc tịnh tiến tâm bánh xe (v₀)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom HUD: Playback Controls & Display Toggles */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent pointer-events-none">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg">
          <button
            id="btn-sim-play-pause"
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm active:scale-95"
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Tiếp tục mô phỏng'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            id="btn-sim-reset"
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
            title="Khởi động lại thời gian"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Speed Selector */}
          <div className="flex items-center space-x-1">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                  simSpeed === spd
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-400 ml-2">
            t = {simTime.toFixed(2)}s
          </span>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg text-xs">
          <button
            id="toggle-vectors"
            type="button"
            onClick={onToggleVectors}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
              showVectors
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Vector</span>
          </button>

          <button
            id="toggle-trail"
            type="button"
            onClick={onToggleTrail}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
              showTrail
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vết quỹ đạo</span>
          </button>

          <button
            id="toggle-grid"
            type="button"
            onClick={onToggleGrid}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
              showGrid
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lưới Oxyz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
