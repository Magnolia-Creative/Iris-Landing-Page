"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SAMPLE_LIMIT = 420_000;

function sampleImage(
  img: HTMLImageElement,
): { positions: Float32Array; colors: Float32Array; count: number } {
  const canvas = document.createElement("canvas");
  const sampleW = Math.min(img.naturalWidth, 2000);
  const sampleH = Math.round(sampleW * (img.naturalHeight / img.naturalWidth));
  canvas.width = sampleW;
  canvas.height = sampleH;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

  const aspect = sampleW / sampleH;
  const scaleX = 10 * aspect;
  const scaleY = 10;

  const pts: number[] = [];
  const cols: number[] = [];

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      if (brightness < 0.02) continue;

      const prob = brightness * brightness;
      if (Math.random() > prob * 0.85) continue;

      const px = (x / sampleW - 0.5) * scaleX;
      const py = (0.5 - y / sampleH) * scaleY;
      const pz = (Math.random() - 0.5) * 0.15;

      pts.push(px, py, pz);
      cols.push(r, g, b);

      if (pts.length / 3 >= SAMPLE_LIMIT) break;
    }
    if (pts.length / 3 >= SAMPLE_LIMIT) break;
  }

  return {
    positions: new Float32Array(pts),
    colors: new Float32Array(cols),
    count: pts.length / 3,
  };
}

function Points({
  positions,
  colors,
  count,
}: {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const basePositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    basePositions.current = new Float32Array(positions);
  }, [positions]);

  useFrame(({ clock }) => {
    const geom = ref.current?.geometry;
    const base = basePositions.current;
    if (!geom || !base) return;
    const pos = geom.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = base[i3];
      const by = base[i3 + 1];

      const heightFactor = Math.max(0, (by + 3) / 8);
      const strength = 0.012 + heightFactor * 0.04;

      const wx =
        Math.sin(t * 0.4 + by * 0.6 + bx * 0.15) * strength +
        Math.sin(t * 0.25 + bx * 0.3) * strength * 0.5;
      const wy =
        Math.cos(t * 0.35 + bx * 0.4) * strength * 0.4;
      const wz =
        Math.sin(t * 0.3 + by * 0.2 + bx * 0.1) * strength * 0.3;

      pos[i3] = bx + wx;
      pos[i3 + 1] = by + wy;
      pos[i3 + 2] = base[i3 + 2] + wz;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.014}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </points>
  );
}

function FitCamera({ zoom }: { zoom: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / size.height;
      camera.position.y = 1.8;
      let baseZ: number;
      if (aspect > 1.6) {
        baseZ = 7;
      } else if (aspect > 1) {
        baseZ = 8.5;
      } else {
        baseZ = 12;
      }
      camera.position.z = baseZ / zoom;
      camera.updateProjectionMatrix();
    }
  }, [camera, size, zoom]);
  return null;
}

function OffsetGroup({
  offset,
  children,
}: {
  offset: { x: number; y: number };
  children: React.ReactNode;
}) {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const aspect = size.width / size.height;

  let baseZ: number;
  if (aspect > 1.6) baseZ = 7;
  else if (aspect > 1) baseZ = 8.5;
  else baseZ = 12;

  const vFov = (cam.fov * Math.PI) / 180;
  const worldH = 2 * Math.tan(vFov / 2) * baseZ;
  const worldW = worldH * aspect;
  const wx = (offset.x / size.width) * worldW;
  const wy = -(offset.y / size.height) * worldH;

  return <group position={[wx, wy, 0]}>{children}</group>;
}

function Scene({ offset, zoom }: { offset: { x: number; y: number }; zoom: number }) {
  const [data, setData] = useState<{
    positions: Float32Array;
    colors: Float32Array;
    count: number;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/source.png";
    img.onload = () => {
      setData(sampleImage(img));
    };
  }, []);

  if (!data) return null;

  return (
    <>
      <FitCamera zoom={zoom} />
      <OffsetGroup offset={offset}>
        <Points
          positions={data.positions}
          colors={data.colors}
          count={data.count}
        />
      </OffsetGroup>
    </>
  );
}

export default function PointField({
  offset = { x: 0, y: 0 },
  zoom = 1,
}: {
  offset?: { x: number; y: number };
  zoom?: number;
}) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 1.8, 8], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000");
      }}
    >
      <Scene offset={offset} zoom={zoom} />
    </Canvas>
  );
}
