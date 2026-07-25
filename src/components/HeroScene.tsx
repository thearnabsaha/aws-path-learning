"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import { isMobileViewport, waitForSize } from "@/lib/webgl";

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
 * Mobile-safe: waits for layout size, lower poly, CSS fallback on WebGL fail.
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let ro: ResizeObserver | null = null;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = isMobileViewport();

    (async () => {
      // iOS often reports 0×0 until layout settles
      const { w, h } = await waitForSize(mount, 8, 3000);
      if (disposed) return;

      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
      try {
        const testCanvas = document.createElement("canvas");
        gl =
          testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
          testCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
          testCanvas.getContext("experimental-webgl" as "webgl");
      } catch {
        gl = null;
      }
      if (!gl) {
        setFailed(true);
        return;
      }

      const p = palette(theme);
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(p.fog, mobile ? 0.06 : 0.045);
      scene.background = new THREE.Color(p.bg);

      const camera = new THREE.PerspectiveCamera(48, w / Math.max(h, 1), 0.1, 100);
      camera.position.set(0, 0.35, mobile ? 8.2 : 7.2);

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !mobile,
          alpha: false,
          powerPreference: mobile ? "low-power" : "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        });
      } catch {
        setFailed(true);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      renderer.domElement.style.cssText =
        "width:100%;height:100%;display:block;touch-action:none;";
      // Clear previous canvases (Strict Mode remount)
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      mount.appendChild(renderer.domElement);

      const root = new THREE.Group();
      scene.add(root);

      scene.add(new THREE.AmbientLight(0xffffff, theme === "dark" ? 0.55 : 0.75));
      const key = new THREE.DirectionalLight(p.accent, theme === "dark" ? 1.1 : 0.85);
      key.position.set(4, 6, 5);
      scene.add(key);
      const rim = new THREE.PointLight(p.node, 0.9, 20);
      rim.position.set(-3, -1, 4);
      scene.add(rim);

      const NODE_COUNT = mobile ? 16 : 28;
      const segs = mobile ? 10 : 16;
      const nodeGeo = new THREE.SphereGeometry(0.09, segs, segs);
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

        const mesh = new THREE.Mesh(nodeGeo, i % 5 === 0 ? coreMat : nodeMat);
        mesh.position.copy(pos);
        mesh.scale.setScalar(0.7 + Math.random() * 1.1);
        root.add(mesh);
        nodes.push(mesh);
      }

      const center = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, mobile ? 0 : 1),
        new THREE.MeshStandardMaterial({
          color: p.accent,
          emissive: p.node,
          emissiveIntensity: theme === "dark" ? 0.55 : 0.28,
          metalness: 0.45,
          roughness: 0.28,
        })
      );
      root.add(center);

      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.55, mobile ? 0 : 1),
        new THREE.MeshBasicMaterial({
          color: p.line,
          wireframe: true,
          transparent: true,
          opacity: theme === "dark" ? 0.35 : 0.28,
        })
      );
      root.add(wire);

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

      const PART = mobile ? 70 : 180;
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
          size: mobile ? 0.05 : theme === "dark" ? 0.035 : 0.04,
          transparent: true,
          opacity: theme === "dark" ? 0.55 : 0.45,
          sizeAttenuation: true,
        })
      );
      scene.add(particles);

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      mount.addEventListener("pointermove", onPointer, { passive: true });
      mount.addEventListener("pointerdown", onPointer, { passive: true });

      const clock = new THREE.Clock();

      const onResize = () => {
        if (!renderer) return;
        const nw = Math.max(mount.clientWidth, 1);
        const nh = Math.max(mount.clientHeight, 1);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
      };
      ro = new ResizeObserver(onResize);
      ro.observe(mount);
      // Force one more size after fonts/layout
      requestAnimationFrame(onResize);

      const animate = () => {
        if (disposed || !renderer) return;
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
          camera.position.y = 0.35 + pointer.y * 0.2;
          camera.lookAt(0, 0, 0);
        }

        try {
          renderer.render(scene, camera);
        } catch {
          setFailed(true);
          return;
        }
        if (!reduce) raf = requestAnimationFrame(animate);
      };

      animate();
      if (reduce) renderer.render(scene, camera);

      // store disposables on mount for cleanup
      (mount as HTMLElement & { __dispose?: () => void }).__dispose = () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
        mount.removeEventListener("pointermove", onPointer);
        mount.removeEventListener("pointerdown", onPointer);
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
        renderer?.dispose();
        renderer?.forceContextLoss?.();
        if (renderer?.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      const d = (mount as HTMLElement & { __dispose?: () => void }).__dispose;
      d?.();
    };
  }, [theme]);

  if (failed) {
    return <div className="hero-scene hero-scene-fallback" aria-hidden="true" />;
  }

  return (
    <div
      ref={mountRef}
      className="hero-scene"
      aria-hidden="true"
    />
  );
}
