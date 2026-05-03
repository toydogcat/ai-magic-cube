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

  // Collect all visible faces
  const visibleFaces: {
    projected: Point2D[];
    color: string;
    centerZ: number;
    normalZ: number;
    dot: number;
  }[] = [];

  // Lighting direction vector (normalized)
  const lDir = { x: 0.363, y: 0.363, z: 0.852 }; // normalized (1, 1, 2.3)

  for (const c of cubelets) {
    const isAffected = affectedCubelets.includes(c);

    for (const f of c.faces) {
      // 1. Transform each local vertex and pos
      const projectedVertices: Point2D[] = [];
      let sumX = 0, sumY = 0, sumZ = 0;

      // Temporary arrays for world coordinates of this face's vertices
      const worldVerts: Point3D[] = [];

      for (const vLocal of f.localVertices) {
        let v: Point3D = { ...vLocal };
        let cPos: Point3D = { ...c.pos };

        // Apply animating layer rotation
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

        // Add positions to get absolute 3D position
        let p: Point3D = {
          x: cPos.x + v.x,
          y: cPos.y + v.y,
          z: cPos.z + v.z,
        };

        // Apply global camera rotation (Rotate Y then Rotate X)
        p = rotateY(p, thetaY);
        p = rotateX(p, thetaX);

        worldVerts.push(p);

        sumX += p.x;
        sumY += p.y;
        sumZ += p.z;

        // Apply perspective projection
        // Canvas coordinate system: X goes right, Y goes down.
        // World coordinates: X right, Y up. So map Y to height/2 - projectedY.
        const u = (p.x * focalLength) / (p.z + distance);
        const v_proj = (p.y * focalLength) / (p.z + distance);

        projectedVertices.push({
          x: width / 2 + u,
          y: height / 2 - v_proj,
        });
      }

      // 2. Normal vector for lighting and back-face culling
      // Compute 3D cross product of world vertices
      const v0 = worldVerts[0];
      const v1 = worldVerts[1];
      const v2 = worldVerts[2];

      const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
      const edge2 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };

      // Face normal
      const nx = edge1.y * edge2.z - edge1.z * edge2.y;
      const ny = edge1.z * edge2.x - edge1.x * edge2.z;
      const nz = edge1.x * edge2.y - edge1.y * edge2.x;

      const mag = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const normal = { x: nx / mag, y: ny / mag, z: nz / mag };

      // Compute winding order cross product in screen space (as extra back-face culling)
      const sv0 = projectedVertices[0];
      const sv1 = projectedVertices[1];
      const sv2 = projectedVertices[2];
      const winding = (sv1.x - sv0.x) * (sv2.y - sv1.y) - (sv1.y - sv0.y) * (sv2.x - sv1.x);

      // Invert normal test to filter correctly based on camera
      // normal.z > 0 indicates it's facing towards the camera (Z increases outward)
      if (normal.z > -0.05 && winding < 0) {
        const centerZ = sumZ / 4;
        const dot = normal.x * lDir.x + normal.y * lDir.y + normal.z * lDir.z;

        visibleFaces.push({
          projected: projectedVertices,
          color: f.color,
          centerZ,
          normalZ: normal.z,
          dot,
        });
      }
    }
  }

  // 3. Z-Sorting (Far to Near: centerZ descending)
  visibleFaces.sort((a, b) => b.centerZ - a.centerZ);

  // 4. Drawing each visible face
  for (const f of visibleFaces) {
    ctx.beginPath();
    ctx.moveTo(f.projected[0].x, f.projected[0].y);
    for (let i = 1; i < f.projected.length; i++) {
      ctx.lineTo(f.projected[i].x, f.projected[i].y);
    }
    ctx.closePath();

    // Fill face with base color
    ctx.fillStyle = f.color;
    ctx.fill();

    // Shading intensity: 0.3 to 1.0 (with 0.6 being neutral)
    const intensity = Math.max(0.1, Math.min(1.0, 0.5 + 0.5 * f.dot));

    if (intensity > 0.6) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(intensity - 0.6) * 0.4})`;
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${(0.6 - intensity) * 0.85})`;
      ctx.fill();
    }

    // Give the sticker a subtle neon-like/luxurious border
    ctx.strokeStyle = '#121214';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Add a gloss effect / inner sticker border for a highly polished Rubik's cube aesthetic
    if (f.color !== '#282828') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
