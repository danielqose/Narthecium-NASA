import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL = `${import.meta.env.BASE_URL}models/body.glb`;

const FOCUS = {
  brain: new THREE.Vector3(0, 1.52, 0.02),
  eyes: new THREE.Vector3(0, 1.48, 0.08),
  heart: new THREE.Vector3(0.05, 1.18, 0.06),
  lungs: new THREE.Vector3(0, 1.22, 0.05),
  bone: new THREE.Vector3(0, 0.9, 0),
  immune: new THREE.Vector3(0.14, 1.28, 0.04),
};

const TINT = {
  brain: '#269BFF',
  eyes: '#46D6A0',
  heart: '#FF646E',
  lungs: '#55D5FF',
  bone: '#E8F6FF',
  immune: '#F4C542',
};

function BodyModel({ layer, selected, dragging }) {
  const { scene } = useGLTF(MODEL);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const group = useRef(null);
  const marker = useRef(null);

  useLayoutEffect(() => {
    clone.traverse((obj) => {
      if (!obj.isMesh || obj.userData.ready) return;
      obj.userData.ready = true;
      obj.material = new THREE.MeshStandardMaterial({
        color: '#d7f3ff',
        emissive: '#1a6ea8',
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.34,
        roughness: 0.25,
        metalness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const edges = new THREE.EdgesGeometry(obj.geometry, 26);
      obj.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: '#E8F6FF',
        transparent: true,
        opacity: 0.72,
      })));
      const src = obj.geometry.attributes.position;
      const count = Math.min(1600, src.count);
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const v = Math.floor(Math.random() * src.count);
        arr[i * 3] = src.getX(v);
        arr[i * 3 + 1] = src.getY(v);
        arr[i * 3 + 2] = src.getZ(v);
      }
      const points = new THREE.BufferGeometry();
      points.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      obj.add(new THREE.Points(points, new THREE.PointsMaterial({
        color: '#E8F6FF',
        size: 0.012,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        sizeAttenuation: true,
      })));
    });
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 1.7 / (size.y || 1);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  }, [clone]);

  useLayoutEffect(() => {
    const tint = new THREE.Color(TINT[selected] || '#55D5FF');
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material?.emissive) return;
      obj.material.emissive.copy(tint);
      obj.material.opacity = layer === 'organs' ? 0.18 : 0.36;
      obj.material.wireframe = layer === 'full';
    });
  }, [clone, layer, selected]);

  useFrame(({ clock }) => {
    if (group.current && !dragging.current) group.current.rotation.y = clock.elapsedTime * 0.12;
    const spot = FOCUS[selected] || FOCUS.heart;
    if (marker.current) {
      marker.current.position.copy(spot);
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.08;
      marker.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <primitive object={clone} />
      <mesh ref={marker}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={TINT[selected] || '#55D5FF'} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.46, 0.5, 72]} />
        <meshBasicMaterial color="#55D5FF" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Rig({ selected, dragging }) {
  const controls = useRef(null);
  useFrame(() => {
    if (!controls.current) return;
    const base = new THREE.Vector3(0, 0.85, 0);
    const spot = FOCUS[selected] || base;
    controls.current.target.lerp(base.clone().lerp(spot, 0.22), 0.05);
    controls.current.update();
  });
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={1.15}
      maxDistance={4.2}
      target={[0, 0.9, 0]}
      onStart={() => { dragging.current = true; }}
      onEnd={() => { dragging.current = false; }}
    />
  );
}

useGLTF.preload(MODEL);

export function HoloStage({ layer, selected }) {
  const dragging = useRef(false);
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0.2, 0.95, 3.15], fov: 28 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.6]}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 2]} intensity={1.4} color="#E8F6FF" />
      <pointLight position={[-1.2, 1.4, 1]} intensity={8} color="#269BFF" />
      <Suspense fallback={null}>
        <BodyModel layer={layer} selected={selected} dragging={dragging} />
      </Suspense>
      <Rig selected={selected} dragging={dragging} />
    </Canvas>
  );
}
