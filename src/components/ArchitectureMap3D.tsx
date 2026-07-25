"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ARCH_EDGES, ARCH_NODES } from "@/lib/architecture";
import { useProgress } from "@/context/ProgressContext";
import { useTheme } from "@/context/ThemeContext";
import { isMobileViewport, waitForSize } from "@/lib/webgl";

const GROUP_HEX: Record<string, number> = {
  edge: 0x3f6fad,
  compute: 0x9a6340,
  data: 0x2f7a58,
  net: 0x4a7ab5,
  ops: 0xb0813a,
  identity: 0xb2453a,
};

function makePlateTexture(
  label: string,
  on: boolean,
  theme: "light" | "dark"
): THREE.CanvasTexture {
  const w = 256;
  const h = 96;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const bg = on
    ? theme === "dark"
      ? "rgba(210,180,140,0.28)"
      : "rgba(122,79,50,0.16)"
    : theme === "dark"
      ? "rgba(36,31,26,0.92)"
      : "rgba(255,252,247,0.95)";
  const border = on
    ? theme === "dark"
      ? "rgba(210,180,140,0.65)"
      : "rgba(122,79,50,0.45)"
    : theme === "dark"
      ? "rgba(243,232,216,0.12)"
      : "rgba(74,52,38,0.14)";
  const fg = on
    ? theme === "dark"
      ? "#f6efe6"
      : "#241910"
    : theme === "dark"
      ? "rgba(246,239,230,0.4)"
      : "rgba(36,25,16,0.4)";

  ctx.clearRect(0, 0, w, h);
  roundRect(ctx, 8, 8, w - 16, h - 16, 18);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.font = `700 ${on ? 34 : 30}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 3D growing architecture map — nodes unlock as lessons complete.
 */
export function ArchitectureMap3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { completed, completedCount, total } = useProgress();
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);

  const unlocked = useMemo(() => {
    const set = new Set<string>();
    for (const n of ARCH_NODES) {
      if (n.unlocksWith === "cloud-fundamentals") {
        if (completed["cloud-fundamentals"] || completedCount > 0) set.add(n.id);
      } else if (completed[n.unlocksWith]) {
        set.add(n.id);
      }
    }
    set.add("users");
    return set;
  }, [completed, completedCount]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let ro: ResizeObserver | null = null;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = isMobileViewport();

    (async () => {
      const { w, h } = await waitForSize(mount, 8, 3000);
      if (disposed) return;

      try {
        const c = document.createElement("canvas");
        const gl =
          c.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
          c.getContext("webgl", { failIfMajorPerformanceCaveat: false });
        if (!gl) {
          setFailed(true);
          return;
        }
      } catch {
        setFailed(true);
        return;
      }

      const isDark = theme === "dark";
      const bg = isDark ? 0x1b1714 : 0xfffcf7;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(bg);
      scene.fog = new THREE.Fog(bg, 8, 22);

      const camera = new THREE.PerspectiveCamera(42, w / Math.max(h, 1), 0.1, 80);
      camera.position.set(0, mobile ? 5.8 : 5.2, mobile ? 9.5 : 8.2);
      camera.lookAt(0, 0, 0);

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !mobile,
          alpha: false,
          powerPreference: mobile ? "low-power" : "high-performance",
          failIfMajorPerformanceCaveat: false,
        });
      } catch {
        setFailed(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
      renderer.domElement.style.cssText =
        "width:100%;height:100%;display:block;touch-action:none;";
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.65 : 0.85));
      const key = new THREE.DirectionalLight(0xffffff, isDark ? 0.9 : 0.7);
      key.position.set(4, 10, 6);
      scene.add(key);

      const root = new THREE.Group();
      root.rotation.x = -0.55;
      scene.add(root);

      // Map 2D layout (0–600, 0–400) → 3D plane
      const to3 = (x: number, y: number) =>
        new THREE.Vector3((x - 300) / 70, 0, (y - 200) / 70);

      // VPC floor
      const vpcOn = unlocked.has("vpc");
      const floorGeo = new THREE.PlaneGeometry(6.2, 4.4);
      const floorMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x2a241e : 0xe8d8c4,
        transparent: true,
        opacity: vpcOn ? 0.35 : 0.12,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.85,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(to3(190, 220).x, -0.02, to3(190, 220).z);
      root.add(floor);

      const edges: THREE.Line[] = [];
      const nodeMeshes: { mesh: THREE.Mesh; baseY: number; on: boolean }[] = [];
      const textures: THREE.Texture[] = [];

      // Edges
      for (const e of ARCH_EDGES) {
        const a = ARCH_NODES.find((n) => n.id === e.from);
        const b = ARCH_NODES.find((n) => n.id === e.to);
        if (!a || !b) continue;
        const on =
          unlocked.has(e.from) &&
          unlocked.has(e.to) &&
          !!completed[e.unlocksWith];
        const pa = to3(a.x, a.y);
        const pb = to3(b.x, b.y);
        const mid = pa.clone().lerp(pb, 0.5);
        mid.y = 0.35;
        const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
        const pts = curve.getPoints(mobile ? 12 : 20);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: on ? (isDark ? 0xd2b48c : 0x7a4f32) : isDark ? 0x3a322a : 0xd4c4b0,
          transparent: true,
          opacity: on ? 0.85 : 0.25,
        });
        const line = new THREE.Line(geo, mat);
        root.add(line);
        edges.push(line);
      }

      // Nodes as labeled plates
      for (const n of ARCH_NODES) {
        const on = unlocked.has(n.id);
        const pos = to3(n.x, n.y);
        const tex = makePlateTexture(n.label, on, theme);
        textures.push(tex);
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.55,
          metalness: 0.15,
          emissive: new THREE.Color(GROUP_HEX[n.group] || 0x7a4f32),
          emissiveIntensity: on ? (isDark ? 0.22 : 0.12) : 0.02,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.5), mat);
        mesh.position.set(pos.x, on ? 0.28 : 0.12, pos.z);
        mesh.rotation.x = -0.35;
        // face camera-ish
        root.add(mesh);
        nodeMeshes.push({ mesh, baseY: mesh.position.y, on });

        // small pillar under unlocked nodes
        if (on) {
          const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.06, mesh.position.y, 8),
            new THREE.MeshStandardMaterial({
              color: GROUP_HEX[n.group] || 0x7a4f32,
              transparent: true,
              opacity: 0.55,
            })
          );
          pillar.position.set(pos.x, mesh.position.y / 2, pos.z);
          root.add(pillar);
        }
      }

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
      const baseCam = camera.position.clone();

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
      requestAnimationFrame(onResize);

      const animate = () => {
        if (disposed || !renderer) return;
        const t = clock.getElapsedTime();
        if (!reduce) {
          root.rotation.y = pointer.x * 0.25 + Math.sin(t * 0.15) * 0.06;
          root.rotation.x = -0.55 + pointer.y * 0.08;
          nodeMeshes.forEach((n, i) => {
            if (n.on) {
              n.mesh.position.y =
                n.baseY + Math.sin(t * 1.4 + i * 0.4) * 0.04;
            }
          });
          camera.position.x = baseCam.x + pointer.x * 0.4;
          camera.position.y = baseCam.y + pointer.y * 0.25;
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

      (mount as HTMLElement & { __archDispose?: () => void }).__archDispose =
        () => {
          cancelAnimationFrame(raf);
          ro?.disconnect();
          mount.removeEventListener("pointermove", onPointer);
          mount.removeEventListener("pointerdown", onPointer);
          textures.forEach((t) => t.dispose());
          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
              obj.geometry?.dispose();
              const m = obj.material;
              if (Array.isArray(m)) m.forEach((x) => x.dispose());
              else m?.dispose();
            }
          });
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
      (mount as HTMLElement & { __archDispose?: () => void }).__archDispose?.();
    };
    // unlocked is derived from completed — re-run when progress/theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unlocked is stable via completedCount + completed
  }, [theme, completed, completedCount]);

  return (
    <section className="arch-map arch-map-3d" aria-label="Architecture so far">
      <div className="arch-map-head">
        <h2>Architecture so far</h2>
        <p>
          Drag lightly to peek — services unlock as you complete lessons (
          {completedCount}/{total}).
        </p>
      </div>
      <div className="arch-3d-stage">
        {failed ? (
          <div className="arch-3d-fallback" role="img" aria-label="Architecture diagram unavailable">
            <p>3D view unavailable on this device. Keep learning — progress still unlocks the map when WebGL is available.</p>
          </div>
        ) : (
          <div ref={mountRef} className="arch-3d-canvas" aria-hidden="true" />
        )}
      </div>
      <ul className="arch-legend">
        <li>
          <span className="arch-dot on" /> Unlocked
        </li>
        <li>
          <span className="arch-dot" /> Locked
        </li>
      </ul>
    </section>
  );
}
