"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const PointField = dynamic(() => import("@/components/PointField"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-black" aria-hidden />
  ),
});

function useDrag(zoomRef?: React.RefObject<number>) {
  const posRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    activeRef.current = true;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: posRef.current.x,
      oy: posRef.current.y,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeRef.current) return;
    const s = startRef.current;
    const z = zoomRef?.current ?? 1;
    const next = {
      x: s.ox + (e.clientX - s.x) / z,
      y: s.oy + (e.clientY - s.y) / z,
    };
    posRef.current = next;
    setPos(next);
  }, [zoomRef]);

  const onPointerUp = useCallback(() => {
    activeRef.current = false;
    setDragging(false);
  }, []);

  return {
    pos,
    dragging,
    bind: { onPointerDown, onPointerMove, onPointerUp },
  };
}

function useResize() {
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const activeRef = useRef(false);
  const startRef = useRef({ x: 0, base: 1 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    activeRef.current = true;
    startRef.current = { x: e.clientX, base: scaleRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const next = Math.max(0.2, Math.min(5, startRef.current.base * Math.pow(2, dx / 200)));
    scaleRef.current = next;
    setScale(next);
  }, []);

  const onPointerUp = useCallback(() => {
    activeRef.current = false;
  }, []);

  return { scale, bind: { onPointerDown, onPointerMove, onPointerUp } };
}

export default function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const intensity = e.ctrlKey ? 0.01 : 0.002;
      setZoom((prev) => {
        const next = prev * Math.pow(2, -e.deltaY * intensity);
        return Math.max(0.25, Math.min(4, next));
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const bg = useDrag(zoomRef);
  const title = useDrag(zoomRef);
  const titleSize = useResize();
  const sub = useDrag(zoomRef);
  const subSize = useResize();

  return (
    <div
      ref={containerRef}
      className="relative h-dvh min-h-[100svh] w-full overflow-hidden bg-black"
    >
      {/* 3D particle background — drag to reposition */}
      <div
        className={`absolute inset-0 z-0 touch-none ${
          bg.dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        {...bg.bind}
      >
        <PointField offset={bg.pos} zoom={zoom} />
      </div>

      {/* Text overlay — scaled by global zoom from viewport center */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
      >
        {/* "magnolia" — drag to move, handle to resize */}
        <div
          className="pointer-events-auto absolute top-[6vh] left-[5vw] cursor-move touch-none select-none md:top-[7vh] md:left-[4vw]"
          style={{
            transform: `translate(${title.pos.x}px, ${title.pos.y}px) scale(${titleSize.scale})`,
            transformOrigin: "top left",
          }}
          {...title.bind}
        >
          <h1 className="relative inline-block text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[0.92] tracking-tight text-white">
            magnolia
            <span
              className="absolute -right-1 -bottom-1 flex h-4 w-4 cursor-se-resize items-center justify-center rounded-tl opacity-40 transition-opacity hover:opacity-90"
              {...titleSize.bind}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white/60">
                <path d="M12 0v12H0z" />
              </svg>
            </span>
          </h1>
        </div>

        {/* "creative" — drag to move, handle to resize */}
        <div
          className="pointer-events-auto absolute top-1/2 right-[4vw] cursor-move touch-none select-none md:right-[6vw]"
          style={{
            transform: `translate(${sub.pos.x}px, calc(-50% + ${sub.pos.y}px)) scale(${subSize.scale})`,
            transformOrigin: "top right",
          }}
          {...sub.bind}
        >
          <span className="relative inline-block text-[clamp(1.8rem,5vw,5rem)] font-light italic tracking-[0.04em] text-white">
            creative
            <span
              className="absolute -right-1 -bottom-1 flex h-4 w-4 cursor-se-resize items-center justify-center rounded-tl opacity-40 transition-opacity hover:opacity-90"
              {...subSize.bind}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white/40">
                <path d="M12 0v12H0z" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
