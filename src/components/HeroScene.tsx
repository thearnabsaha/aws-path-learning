"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

type Palette = {
  bg: number;
  fog: number;
  node: number;
  nodeCore: number;
  line: number;
  particle: number;
  accent: number;
};

function palette(theme: "light" | "dark"): Palette {
  if (theme === "dark") {
    return {
      bg: 0x12100e,
      fog: 0x12100e,
      node: 0xd2b48c,
      nodeCore: 0xf0e6d8,
      line: 0x8a7360,
      particle: 0xc4a882,
      accent: 0xe0c6a2,
    };
  }
  return {
    bg: 0xf4ebe0,
    fog: 0xf4ebe0,
    node: 0x7a4f32,
    nodeCore: 0x9a6340,
    line: 0xc4a882,
    particle: 0xa67c52,
    accent: 0x6b432b,
  };
}

/**
 * Animated Three.js cloud-network backdrop for the landing hero.
 * Respects prefers-reduced-motion (static frame only).
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const p = palette(theme);
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(p.fog, 0.045);
    scene.background = new THREE.Color(p.bg);

    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    // Soft lights
    scene.add(new THREE.AmbientLight(0xffffff, theme === "dark" ? 0.55 : 0.75));
    const key = new THREE.DirectionalLight(p.accent, theme === "dark" ? 1.1 : 0.85);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(p.node, 0.9, 20);
    rim.position.set(-3, -1, 4);
    scene.add(rim);

    // Network nodes in a soft ellipsoid
    const NODE_COUNT = 28;
    const nodeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: p.node,
      emissive: p.node,
      emissiveIntensity: theme === "dark" ? 0.45 : 0.22,
      metalness: 0.35,
      roughness: 0.35,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: p.nodeCore,
      emissive: p.nodeCore,
      emissiveIntensity: theme === "dark" ? 0.7 : 0.35,
      metalness: 0.2,
      roughness: 0.25,
    });

    const nodes: THREE.Mesh[] = [];
    const positions: THREE.Vector3[] = [];
    const phases: number[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 2.2 + Math.random() * 1.6;
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.35;
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.75;
      const z = r * Math.cos(phi) * 0.9;
      const pos = new THREE.Vector3(x, y, z);
      positions.push(pos);
      phases.push(Math.random() * Math.PI * 2);

      const mesh = new THREE.Mesh(
        nodeGeo,
        i % 5 === 0 ? coreMat : nodeMat
      );
      mesh.position.copy(pos);
      const s = 0.7 + Math.random() * 1.1;
      mesh.scale.setScalar(s);
      root.add(mesh);
      nodes.push(mesh);
    }

    // Center “A” mark sphere
    const center = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 1),
      new THREE.MeshStandardMaterial({
        color: p.accent,
        emissive: p.node,
        emissiveIntensity: theme === "dark" ? 0.55 : 0.28,
        metalness: 0.45,
        roughness: 0.28,
        wireframe: false,
      })
    );
    root.add(center);
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshBasicMaterial({
        color: p.line,
        wireframe: true,
        transparent: true,
        opacity: theme === "dark" ? 0.35 : 0.28,
      })
    );
    root.add(wire);

    // Edges between nearby nodes
    const linePositions: number[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < 1.85) {
          linePositions.push(
            positions[i].x,
            positions[i].y,
            positions[i].z,
            positions[j].x,
            positions[j].y,
            positions[j].z
          );
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: p.line,
        transparent: true,
        opacity: theme === "dark" ? 0.28 : 0.35,
      })
    );
    root.add(lines);

    // Floating particles
    const PART = 180;
    const pPos = new Float32Array(PART * 3);
    for (let i = 0; i < PART; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: p.particle,
        size: theme === "dark" ? 0.035 : 0.04,
        transparent: true,
        opacity: theme === "dark" ? 0.55 : 0.45,
        sizeAttenuation: true,
      })
    );
    scene.add(particles);

    // Pointer parallax
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    mount.addEventListener("pointermove", onPointer);

    let frame = 0;
    let raf = 0;
    const clock = new THREE.Clock();

    const onResize = () => {
      const nw = mount.clientWidth || 1;
      const nh = mount.clientHeight || 1;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const animate = () => {
      frame += 1;
      const t = clock.getElapsedTime();

      if (!reduce) {
        root.rotation.y = t * 0.08 + pointer.x * 0.15;
        root.rotation.x = Math.sin(t * 0.12) * 0.08 + pointer.y * 0.08;
        center.rotation.x = t * 0.25;
        center.rotation.y = t * 0.35;
        wire.rotation.x = -t * 0.18;
        wire.rotation.y = t * 0.22;
        wire.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04);

        nodes.forEach((mesh, i) => {
          const base = positions[i];
          const ph = phases[i];
          mesh.position.x = base.x + Math.sin(t * 0.7 + ph) * 0.08;
          mesh.position.y = base.y + Math.cos(t * 0.9 + ph) * 0.1;
          mesh.position.z = base.z + Math.sin(t * 0.5 + ph) * 0.06;
        });

        particles.rotation.y = t * 0.02;
        camera.position.x = pointer.x * 0.35;
        camera.position.y = 0.4 + pointer.y * 0.2;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(animate);
    };

    animate();
    if (reduce) renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointermove", onPointer);
      nodeGeo.dispose();
      nodeMat.dispose();
      coreMat.dispose();
      lineGeo.dispose();
      (lines.material as THREE.Material).dispose();
      pGeo.dispose();
      (particles.material as THREE.Material).dispose();
      center.geometry.dispose();
      (center.material as THREE.Material).dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      void frame;
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="hero-scene"
      aria-hidden="true"
    />
  );
}
