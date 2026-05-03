import './style.css';
import { createRubiksCube, rotateX, rotateY, rotateZ } from './cube';
import { renderCube } from './renderer';
import type { Point3D, Cubelet } from './types';

// State management
let cubelets = createRubiksCube();

// View parameters
let thetaX = 0.45; // camera angle X
let thetaY = -0.55; // camera angle Y
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

const focalLength = 500;
const distance = 4.5;

// Animation / Queue system for Moves
interface Move {
  axis: 'X' | 'Y' | 'Z';
  condition: (p: Point3D) => boolean;
  angle: number;
}

const moveQueue: Move[] = [];
let currentMove: Move | null = null;
let currentAngle = 0;
let affectedCubelets: Cubelet[] = [];

// Base movement speeds (rads per frame)
const standardSpeed = 0.12;
const fastSpeed = 0.3;

// Add a move to the queue
function addMove(axis: 'X' | 'Y' | 'Z', condition: (p: Point3D) => boolean, angle: number) {
  moveQueue.push({ axis, condition, angle });
}

// Scramble the cube
function scrambleCube() {
  const axes: ('X' | 'Y' | 'Z')[] = ['X', 'Y', 'Z'];
  const layers = [-0.5, 0.5];
  const angles = [Math.PI / 2, -Math.PI / 2];

  for (let i = 0; i < 15; i++) {
    const ax = axes[Math.floor(Math.random() * axes.length)];
    const val = layers[Math.floor(Math.random() * layers.length)];
    const ang = angles[Math.floor(Math.random() * angles.length)];

    let cond: (p: Point3D) => boolean;
    if (ax === 'X') cond = (p) => Math.abs(p.x - val) < 0.1;
    else if (ax === 'Y') cond = (p) => Math.abs(p.y - val) < 0.1;
    else cond = (p) => Math.abs(p.z - val) < 0.1;

    addMove(ax, cond, ang);
  }
}

// Reset cube back to initial solved state
function resetCube() {
  moveQueue.length = 0;
  currentMove = null;
  currentAngle = 0;
  affectedCubelets = [];
  cubelets = createRubiksCube();
}

// Initialize components
const canvas = document.getElementById('cube-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!canvas || !ctx) {
  throw new Error('Canvas or Context 2D not found!');
}

// Mouse dragging to rotate the view
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    // Direct movement mapped to angles
    thetaY -= deltaX * 0.005;
    thetaX -= deltaY * 0.005;

    // Clamp camera angle X to prevent flipping upside down
    thetaX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, thetaX));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// Shift + Click Interaction: Quick layer turn on hover / drag
canvas.addEventListener('click', (e) => {
  if (e.shiftKey) {
    // Arbitrary rotation example when Shift+Click is used: random layer move
    // Or let's trigger the 'U' layer turn by default for simplicity!
    addMove('Y', (p) => p.y > 0, Math.PI / 2);
  }
});

// Key bindings: press U, D, L, R, F, B
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  const shift = e.shiftKey;
  const dir = shift ? -Math.PI / 2 : Math.PI / 2;

  switch (k) {
    case 'u': addMove('Y', (p) => p.y > 0, dir); break;
    case 'd': addMove('Y', (p) => p.y < 0, -dir); break;
    case 'l': addMove('X', (p) => p.x < 0, -dir); break;
    case 'r': addMove('X', (p) => p.x > 0, dir); break;
    case 'f': addMove('Z', (p) => p.z > 0, dir); break;
    case 'b': addMove('Z', (p) => p.z < 0, -dir); break;
  }
});

// Attach button click events from HTML
const moveMappings: Record<string, () => void> = {
  'btn-u': () => addMove('Y', (p) => p.y > 0, Math.PI / 2),
  'btn-u-prime': () => addMove('Y', (p) => p.y > 0, -Math.PI / 2),
  'btn-d': () => addMove('Y', (p) => p.y < 0, -Math.PI / 2),
  'btn-d-prime': () => addMove('Y', (p) => p.y < 0, Math.PI / 2),
  'btn-l': () => addMove('X', (p) => p.x < 0, -Math.PI / 2),
  'btn-l-prime': () => addMove('X', (p) => p.x < 0, Math.PI / 2),
  'btn-r': () => addMove('X', (p) => p.x > 0, Math.PI / 2),
  'btn-r-prime': () => addMove('X', (p) => p.x > 0, -Math.PI / 2),
  'btn-f': () => addMove('Z', (p) => p.z > 0, Math.PI / 2),
  'btn-f-prime': () => addMove('Z', (p) => p.z > 0, -Math.PI / 2),
  'btn-b': () => addMove('Z', (p) => p.z < 0, -Math.PI / 2),
  'btn-b-prime': () => addMove('Z', (p) => p.z < 0, Math.PI / 2),
};

for (const btnId in moveMappings) {
  const elem = document.getElementById(btnId);
  if (elem) elem.addEventListener('click', moveMappings[btnId]);
}

document.getElementById('btn-scramble')?.addEventListener('click', scrambleCube);
document.getElementById('btn-reset')?.addEventListener('click', resetCube);

// Canvas dynamic resize handling
function resizeCanvas() {
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Render Loop
function mainLoop() {
  // If no move is currently animating, pop the next move from the queue
  if (!currentMove && moveQueue.length > 0) {
    currentMove = moveQueue.shift()!;
    currentAngle = 0;
    affectedCubelets = cubelets.filter(c => currentMove!.condition(c.pos));
  }

  // Animating moves
  if (currentMove) {
    const isScrambling = moveQueue.length > 2;
    const speed = isScrambling ? fastSpeed : standardSpeed;
    const targetAngle = currentMove.angle;

    if (targetAngle > 0) {
      currentAngle += speed;
      if (currentAngle >= targetAngle) {
        currentAngle = targetAngle;
      }
    } else {
      currentAngle -= speed;
      if (currentAngle <= targetAngle) {
        currentAngle = targetAngle;
      }
    }

    // Move complete: apply the transformation permanently to cubelet centers & local offsets
    if (currentAngle === targetAngle) {
      for (const c of affectedCubelets) {
        // Rotate center position
        if (currentMove.axis === 'X') c.pos = rotateX(c.pos, targetAngle);
        else if (currentMove.axis === 'Y') c.pos = rotateY(c.pos, targetAngle);
        else if (currentMove.axis === 'Z') c.pos = rotateZ(c.pos, targetAngle);

        // Rotate face offsets and normals
        for (const f of c.faces) {
          f.localVertices = f.localVertices.map((p) => {
            if (currentMove!.axis === 'X') return rotateX(p, targetAngle);
            if (currentMove!.axis === 'Y') return rotateY(p, targetAngle);
            return rotateZ(p, targetAngle);
          });

          if (currentMove!.axis === 'X') f.normal = rotateX(f.normal, targetAngle);
          else if (currentMove!.axis === 'Y') f.normal = rotateY(f.normal, targetAngle);
          else f.normal = rotateZ(f.normal, targetAngle);
        }
      }

      currentMove = null;
      affectedCubelets = [];
      currentAngle = 0;
    }
  }

  // Call the robust perspective renderer
  renderCube(
    ctx!,
    cubelets,
    thetaX,
    thetaY,
    currentMove ? currentMove.axis : null,
    affectedCubelets,
    currentAngle,
    focalLength,
    distance,
    canvas.width,
    canvas.height
  );

  requestAnimationFrame(mainLoop);
}

// Start rendering loop
mainLoop();
