/** Safe WebGL / layout helpers for mobile Safari & low-power GPUs */

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    (window.matchMedia("(pointer: coarse)").matches &&
      window.innerWidth < 1024)
  );
}

/** Wait until an element has non-zero layout size (critical on iOS). */
export function waitForSize(
  el: HTMLElement,
  min = 2,
  timeoutMs = 2500
): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = el.clientWidth || rect.width;
      const h = el.clientHeight || rect.height;
      return { w: Math.floor(w), h: Math.floor(h) };
    };

    const first = measure();
    if (first.w >= min && first.h >= min) {
      resolve(first);
      return;
    }

    let done = false;
    const finish = (size: { w: number; h: number }) => {
      if (done) return;
      done = true;
      ro.disconnect();
      clearTimeout(tid);
      resolve({
        w: Math.max(size.w, min) || window.innerWidth || 320,
        h: Math.max(size.h, min) || 360,
      });
    };

    const ro = new ResizeObserver(() => {
      const s = measure();
      if (s.w >= min && s.h >= min) finish(s);
    });
    ro.observe(el);

    const tid = window.setTimeout(() => {
      const s = measure();
      finish({
        w: s.w || window.innerWidth || 320,
        h: s.h || 360,
      });
    }, timeoutMs);

    requestAnimationFrame(() => {
      const s = measure();
      if (s.w >= min && s.h >= min) finish(s);
    });
  });
}
