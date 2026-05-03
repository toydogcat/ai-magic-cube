import type { Point3D, Face, Cubelet } from './types';

// Helper to round to 4 decimal places to prevent float drift
export function roundTo(val: number): number {
  return Math.round(val * 10000) / 10000;
}

// 3D rotation functions
export function rotateX(p: Point3D, angle: number): Point3D {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: roundTo(p.x),
    y: roundTo(p.y * c - p.z * s),
    z: roundTo(p.y * s + p.z * c),
  };
}

export function rotateY(p: Point3D, angle: number): Point3D {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: roundTo(p.x * c + p.z * s),
    y: roundTo(p.y),
    z: roundTo(-p.x * s + p.z * c),
  };
}

export function rotateZ(p: Point3D, angle: number): Point3D {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: roundTo(p.x * c - p.y * s),
    y: roundTo(p.x * s + p.y * c),
    z: roundTo(p.z),
  };
}

// Check which face of the cube it is and assign color based on its position in the rubik's cube
export function createRubiksCube(): Cubelet[] {
  const positions: Point3D[] = [];
  for (const x of [-0.5, 0.5]) {
    for (const y of [-0.5, 0.5]) {
      for (const z of [-0.5, 0.5]) {
        positions.push({ x, y, z });
      }
    }
  }

  // Winding order for faces viewed from the outside
  const faceDefs = [
    {
      name: 'U',
      normal: { x: 0, y: 1, z: 0 },
      color: '#ffffff', // White
      localOffsets: [
        { x: -0.5, y: 0.5, z: 0.5 },
        { x: 0.5, y: 0.5, z: 0.5 },
        { x: 0.5, y: 0.5, z: -0.5 },
        { x: -0.5, y: 0.5, z: -0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.y > 0,
    },
    {
      name: 'D',
      normal: { x: 0, y: -1, z: 0 },
      color: '#ffeb3b', // Yellow
      localOffsets: [
        { x: -0.5, y: -0.5, z: -0.5 },
        { x: 0.5, y: -0.5, z: -0.5 },
        { x: 0.5, y: -0.5, z: 0.5 },
        { x: -0.5, y: -0.5, z: 0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.y < 0,
    },
    {
      name: 'F',
      normal: { x: 0, y: 0, z: 1 },
      color: '#f44336', // Red
      localOffsets: [
        { x: -0.5, y: 0.5, z: 0.5 },
        { x: -0.5, y: -0.5, z: 0.5 },
        { x: 0.5, y: -0.5, z: 0.5 },
        { x: 0.5, y: 0.5, z: 0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.z > 0,
    },
    {
      name: 'B',
      normal: { x: 0, y: 0, z: -1 },
      color: '#ff9800', // Orange
      localOffsets: [
        { x: 0.5, y: 0.5, z: -0.5 },
        { x: 0.5, y: -0.5, z: -0.5 },
        { x: -0.5, y: -0.5, z: -0.5 },
        { x: -0.5, y: 0.5, z: -0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.z < 0,
    },
    {
      name: 'L',
      normal: { x: -1, y: 0, z: 0 },
      color: '#4caf50', // Green
      localOffsets: [
        { x: -0.5, y: 0.5, z: -0.5 },
        { x: -0.5, y: -0.5, z: -0.5 },
        { x: -0.5, y: -0.5, z: 0.5 },
        { x: -0.5, y: 0.5, z: 0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.x < 0,
    },
    {
      name: 'R',
      normal: { x: 1, y: 0, z: 0 },
      color: '#2196f3', // Blue
      localOffsets: [
        { x: 0.5, y: 0.5, z: 0.5 },
        { x: 0.5, y: -0.5, z: 0.5 },
        { x: 0.5, y: -0.5, z: -0.5 },
        { x: 0.5, y: 0.5, z: -0.5 },
      ],
      checkExterior: (pos: Point3D) => pos.x > 0,
    },
  ];

  const cubelets: Cubelet[] = positions.map((pos) => {
    const faces: Face[] = faceDefs.map((def) => {
      // If it's an exterior face, it gets its designated sticker color.
      // Otherwise, it's inside the cube, so we paint it dark gray/black.
      const isExterior = def.checkExterior(pos);
      const color = isExterior ? def.color : '#282828';

      return {
        localVertices: def.localOffsets.map((p) => ({ ...p })),
        worldVertices: [],
        projectedVertices: [],
        color,
        normal: { ...def.normal },
        centerZ: 0,
      };
    });

    return { pos, faces };
  });

  return cubelets;
}
