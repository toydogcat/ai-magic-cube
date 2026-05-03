import type { Point3D, Point2D, Cubelet } from './types';
import { rotateX, rotateY, rotateZ } from './cube';

export function renderCube(
  ctx: CanvasRenderingContext2D,
  cubelets: Cubelet[],
  thetaX: number,
  thetaY: number,
  animatingAxis: 'X' | 'Y' | 'Z' | null,
  affectedCubelets: Cubelet[],
  currentAngle: number,
  focalLength: number,
  distance: number,
  width: number,
  height: number
) {
  // 1. Clear the canvas with a luxurious gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.5);
  bgGrad.addColorStop(0, '#1c1e24');
  bgGrad.addColorStop(1, '#0d0e12');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Lighting direction vector (normalized)
  const lDir = { x: 0.363, y: 0.363, z: 0.852 };

  // All visible faces in the scene
  const allVisibleFaces: {
    projected: Point2D[];
    color: string;
    centerZ: number;
    dot: number;
    isSticker: boolean;
  }[] = [];

  for (const c of cubelets) {
    const isAffected = affectedCubelets.includes(c);

    for (const f of c.faces) {
      // Each face generates two items: the black shell, and the raised sticker.
      const scales = [1.0];
      const offsets = [0];
      const colors = ['#131418']; // Pure dark black plastic color
      const stickerFlags = [false];

      // Add the sticker if it's an exterior face
      if (f.color !== '#282828') {
        scales.push(0.88);
        offsets.push(0.035); // 凸起 offset
        colors.push(f.color);
        stickerFlags.push(true);
      }

      for (let s = 0; s < scales.length; s++) {
        const scale = scales[s];
        const offset = offsets[s];
        const color = colors[s];
        const isSticker = stickerFlags[s];

        const faceVerts: Point2D[] = [];
        let sumZ = 0;
        const worldVerts: Point3D[] = [];

        // Compute rotated normal of this face to offset correctly
        let n: Point3D = { ...f.normal };
        if (isAffected && animatingAxis) {
          if (animatingAxis === 'X') n = rotateX(n, currentAngle);
          else if (animatingAxis === 'Y') n = rotateY(n, currentAngle);
          else if (animatingAxis === 'Z') n = rotateZ(n, currentAngle);
        }

        for (const vLocal of f.localVertices) {
          let v: Point3D = { ...vLocal };
          let cPos: Point3D = { ...c.pos };

          // 1. Scale and apply outward normal offset
          v.x = v.x * scale + n.x * offset;
          v.y = v.y * scale + n.y * offset;
          v.z = v.z * scale + n.z * offset;

          // 2. Animating layer rotation
          if (isAffected && animatingAxis) {
            if (animatingAxis === 'X') {
              v = rotateX(v, currentAngle);
              cPos = rotateX(cPos, currentAngle);
            } else if (animatingAxis === 'Y') {
              v = rotateY(v, currentAngle);
              cPos = rotateY(cPos, currentAngle);
            } else if (animatingAxis === 'Z') {
              v = rotateZ(v, currentAngle);
              cPos = rotateZ(cPos, currentAngle);
            }
          }

          // 3. Combine to absolute 3D position
          let p: Point3D = {
            x: cPos.x + v.x,
            y: cPos.y + v.y,
            z: cPos.z + v.z,
          };

          // 4. Apply global camera rotation (Y then X)
          p = rotateY(p, thetaY);
          p = rotateX(p, thetaX);

          worldVerts.push(p);
          sumZ += p.z;

          // Project
          const u = (p.x * focalLength) / (p.z + distance);
          const v_proj = (p.y * focalLength) / (p.z + distance);
          faceVerts.push({
            x: width / 2 + u,
            y: height / 2 - v_proj,
          });
        }

        // Compute winding order
        const sv0 = faceVerts[0];
        const sv1 = faceVerts[1];
        const sv2 = faceVerts[2];
        const winding = (sv1.x - sv0.x) * (sv2.y - sv1.y) - (sv1.y - sv0.y) * (sv2.x - sv1.x);

        // Back-face culling
        if (winding < 0) {
          const v0 = worldVerts[0];
          const v1 = worldVerts[1];
          const v2 = worldVerts[2];

          const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
          const edge2 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };

          const nx = edge1.y * edge2.z - edge1.z * edge2.y;
          const ny = edge1.z * edge2.x - edge1.x * edge2.z;
          const nz = edge1.x * edge2.y - edge1.y * edge2.x;

          const mag = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          const normal = { x: nx / mag, y: ny / mag, z: nz / mag };

          const dot = normal.x * lDir.x + normal.y * lDir.y + normal.z * lDir.z;

          allVisibleFaces.push({
            projected: faceVerts,
            color,
            centerZ: sumZ / 4,
            dot,
            isSticker,
          });
        }
      }
    }
  }

  // --------------------------------------------------------
  // Part 3: Z-Sorting of all faces descending (Far to Near)
  // --------------------------------------------------------
  allVisibleFaces.sort((a, b) => b.centerZ - a.centerZ);

  // 4. Draw all visible faces
  for (const f of allVisibleFaces) {
    ctx.beginPath();
    ctx.lineJoin = 'round'; // Premium curved corners effect
    ctx.moveTo(f.projected[0].x, f.projected[0].y);
    for (let i = 1; i < f.projected.length; i++) {
      ctx.lineTo(f.projected[i].x, f.projected[i].y);
    }
    ctx.closePath();

    // 1. Draw base color
    ctx.fillStyle = f.color;
    ctx.fill();

    // 2. High quality shading and highlights
    const intensity = Math.max(0.1, Math.min(1.0, 0.45 + 0.55 * f.dot));

    if (f.isSticker) {
      if (intensity > 0.6) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(intensity - 0.6) * 0.42})`;
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${(0.6 - intensity) * 0.72})`;
        ctx.fill();
      }

      // Add sticker fine border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Dark border lines for shell edges
      ctx.strokeStyle = '#222225';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
