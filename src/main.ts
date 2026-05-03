import './style.css';
import { createRubiksCube, rotateX, rotateY, rotateZ } from './cube';
import { renderCube } from './renderer';
import type { Point3D, Cubelet } from './types';

// State management
let currentSize: 2 | 3 = 3;
let cubelets = createRubiksCube(currentSize);

// Language / Translation system
type Lang = 'zh' | 'en';
let currentLang: Lang = 'zh';

const i18n = {
  zh: {
    appTitle: '3D 魔術方塊模擬器',
    appDesc: '使用 HTML5 Canvas 2D API 渲染的全 3D 魔術方塊體驗',
    welcomeTitle: '歡迎來到 3D 魔術方塊模擬器',
    welcomeDesc: '請選擇您想挑戰的模式：',
    btnMode2: '2x2x2 魔術方塊模式',
    btnMode3: '3x3x3 魔術方塊模式',
    btnBackHome: '返回模式選擇',
    btnGuide: '解法密技教學',
    btnLanguage: 'English',
    layerMoves: '層轉動控制',
    instructions: '操作指引',
    rotateView: '旋轉視角：點擊並在畫布上拖曳滑鼠。',
    rotateLayers: '旋轉方塊層：點擊按鈕或使用按鍵。',
    keyboardControls: '鍵盤快速鍵：直接按下',
    holdShift: '。按住 Shift 鍵可進行逆時針旋轉。',
    scrambleBtn: '隨機打亂',
    resetBtn: '恢復已還原',
    guideTitle: '魔術方塊解法密技教學',
    guideDesc: '這裡提供 2x2x2 與 3x3x3 的主流還原步驟與核心口訣：',
    guideMode2Title: '2x2x2 解法 (底層架橋法 Layer-by-Layer)',
    mode2Step1Title: '步驟 1: 底層架橋 (First Layer)',
    mode2Step1Desc: '選定一個顏色作為底面（通常是白色），將四個對應角塊對齊側面顏色並拼在同一層。利用基本公式 R U R\' U\' 可調整角塊方向。',
    mode2Step2Title: '步驟 2: 頂面定向 (OLL)',
    mode2Step2Desc: '將底面朝下觀察頂面，使用 R U R\' U R U2 R\' 小魚公式將頂面顏色全部翻轉一致。',
    mode2Step3Title: '步驟 3: 頂面排列 (PLL)',
    mode2Step3Desc: '觀察頂層側面顏色，若有相鄰對稱色則對準左側，套用 R U2 R\' U\' R U2 L\' U R\' U\' L 解決最後角塊對齊。',
    guideMode3Title: '3x3x3 解法 (主流 CFOP 還原法)',
    step1Title: '步驟 1: 底面十字 (Cross)',
    step1Desc: '在底面（通常是白色）拼出一個正確對齊側面顏色的十字。這是整個還原的基礎。',
    step2Title: '步驟 2: 前兩層 (F2L)',
    step2Desc: '將底層的四個角塊與第二層的四個邊塊成對放入對應位置，同時完成兩層。',
    step3Title: '步驟 3: 頂面定向 (OLL)',
    step3Desc: '將頂層（通常是黃色）朝上的面全部翻轉為相同顏色，總共有 57 種情況。',
    step4Title: '步驟 4: 頂面排列 (PLL)',
    step4Desc: '調整頂層邊塊與角塊的相對位置，完成最後還原。總共有 21 種情況。',
    backToGame: '回到遊戲',
    totalViews: '總訪問量',
    totalVisitors: '訪客數',
  },
  en: {
    appTitle: 'Vanilla 3D Magic Cube',
    appDesc: 'Experience fully 3D Rubik\'s cube rendered via HTML5 Canvas 2D API',
    welcomeTitle: 'Welcome to 3D Magic Cube Simulator',
    welcomeDesc: 'Please select a mode to play:',
    btnMode2: '2x2x2 Cube Mode',
    btnMode3: '3x3x3 Cube Mode',
    btnBackHome: 'Back to Mode Selection',
    btnGuide: 'Solution Guide',
    btnLanguage: '繁體中文',
    layerMoves: 'LAYER MOVES',
    instructions: 'INSTRUCTIONS',
    rotateView: 'Rotate View: Click & Drag with your mouse on the canvas.',
    rotateLayers: 'Rotate Layers: Use buttons or keyboard shortcuts.',
    keyboardControls: 'Keyboard Controls: Press keys directly: ',
    holdShift: '. Hold Shift for counter-clockwise.',
    scrambleBtn: 'Scramble Cube',
    resetBtn: 'Reset To Solved',
    guideTitle: 'Magic Cube Solution Guide',
    guideDesc: 'Here are the key steps for both 2x2x2 and 3x3x3 cubes:',
    guideMode2Title: '2x2x2 Solving (Layer-by-Layer Method)',
    mode2Step1Title: 'Step 1: First Layer',
    mode2Step1Desc: 'Select a base color (usually white) and solve the four base corners with their adjacent colors. Use the Sexy Move R U R\' U\' to orient pieces.',
    mode2Step2Title: 'Step 2: OLL (Orient Last Layer)',
    mode2Step2Desc: 'With base down, observe the top layer and use the Sune formula R U R\' U R U2 R\' to orient the top color.',
    mode2Step3Title: 'Step 3: PLL (Permute Last Layer)',
    mode2Step3Desc: 'Observe the adjacent side colors. If you see a pair, move them to the left and apply R U2 R\' U\' R U2 L\' U R\' U\' L to complete the cube.',
    guideMode3Title: '3x3x3 Solving (Popular CFOP Method)',
    step1Title: 'Step 1: The Cross',
    step1Desc: 'Solve a cross on the bottom layer (usually white), aligning the edge pieces with the center colors of the other sides.',
    step2Title: 'Step 2: F2L (First 2 Layers)',
    step2Desc: 'Solve the first two layers simultaneously by pairing corner and edge pieces and inserting them into their correct slots.',
    step3Title: 'Step 3: OLL (Orient Last Layer)',
    step3Desc: 'Orient the pieces on the last layer (usually yellow) so that all faces point in the same direction. There are 57 cases.',
    step4Title: 'Step 4: PLL (Permute Last Layer)',
    step4Desc: 'Swap the pieces on the last layer so they are in their final solved positions. There are 21 cases.',
    backToGame: 'Back to Game',
    totalViews: 'Total Views',
    totalVisitors: 'Total Visitors',
  },
};

function updateTranslations() {
  const t = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n') as keyof typeof t;
    if (t[k]) {
      el.textContent = t[k];
    }
  });
}

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

// Layer filtering condition function
function getCondition(axis: 'X' | 'Y' | 'Z', positive: boolean) {
  return (p: Point3D) => {
    const val = axis === 'X' ? p.x : axis === 'Y' ? p.y : p.z;
    if (currentSize === 2) {
      return positive ? val > 0 : val < 0;
    } else {
      return positive ? val > 0.5 : val < -0.5;
    }
  };
}

// Scramble the cube
function scrambleCube() {
  const axes: ('X' | 'Y' | 'Z')[] = ['X', 'Y', 'Z'];
  const layers = currentSize === 2 ? [-0.5, 0.5] : [-1, 1];
  const angles = [Math.PI / 2, -Math.PI / 2];

  for (let i = 0; i < 15; i++) {
    const ax = axes[Math.floor(Math.random() * axes.length)];
    const val = layers[Math.floor(Math.random() * layers.length)];
    const ang = angles[Math.floor(Math.random() * angles.length)];

    let cond: (p: Point3D) => boolean;
    if (currentSize === 2) {
      if (ax === 'X') cond = (p) => (val > 0 ? p.x > 0 : p.x < 0);
      else if (ax === 'Y') cond = (p) => (val > 0 ? p.y > 0 : p.y < 0);
      else cond = (p) => (val > 0 ? p.z > 0 : p.z < 0);
    } else {
      if (ax === 'X') cond = (p) => (val > 0 ? p.x > 0.5 : p.x < -0.5);
      else if (ax === 'Y') cond = (p) => (val > 0 ? p.y > 0.5 : p.y < -0.5);
      else cond = (p) => (val > 0 ? p.z > 0.5 : p.z < -0.5);
    }

    addMove(ax, cond, ang);
  }
}

// Reset cube back to initial solved state
function resetCube() {
  moveQueue.length = 0;
  currentMove = null;
  currentAngle = 0;
  affectedCubelets = [];
  cubelets = createRubiksCube(currentSize);
}

// Screen / Page Section management
function showPage(pageId: 'page-welcome' | 'page-game' | 'page-guide') {
  document.querySelectorAll('.page-content').forEach((el) => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });

  const current = document.getElementById(pageId);
  if (current) {
    current.classList.remove('hidden');
    current.classList.add('active');
  }

  const btnHome = document.getElementById('btn-back-home');
  if (pageId === 'page-welcome') {
    btnHome?.classList.add('hidden');
  } else {
    btnHome?.classList.remove('hidden');
  }
}

// Mode Selection Initialization
function startCubeGame(size: 2 | 3) {
  currentSize = size;
  resetCube();
  showPage('page-game');
  setTimeout(() => {
    resizeCanvas();
  }, 0);
}

// Navigation / Header Event Listeners
document.getElementById('btn-lang')?.addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  updateTranslations();
});

document.getElementById('btn-back-home')?.addEventListener('click', () => {
  showPage('page-welcome');
});

document.getElementById('btn-toggle-guide')?.addEventListener('click', () => {
  showPage('page-guide');
});

document.getElementById('btn-back-to-game')?.addEventListener('click', () => {
  showPage('page-game');
  setTimeout(() => {
    resizeCanvas();
  }, 0);
});

document.getElementById('btn-mode-2x2')?.addEventListener('click', () => {
  startCubeGame(2);
});

document.getElementById('btn-mode-3x3')?.addEventListener('click', () => {
  startCubeGame(3);
});

// Canvas Init
const canvas = document.getElementById('cube-canvas') as HTMLCanvasElement;
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  // Mouse dragging to rotate view
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      thetaY -= deltaX * 0.005;
      thetaX -= deltaY * 0.005;

      thetaX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, thetaX));

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const shift = e.shiftKey;
    const dir = shift ? -Math.PI / 2 : Math.PI / 2;

    switch (k) {
      case 'u': addMove('Y', getCondition('Y', true), dir); break;
      case 'd': addMove('Y', getCondition('Y', false), -dir); break;
      case 'l': addMove('X', getCondition('X', false), -dir); break;
      case 'r': addMove('X', getCondition('X', true), dir); break;
      case 'f': addMove('Z', getCondition('Z', true), dir); break;
      case 'b': addMove('Z', getCondition('Z', false), -dir); break;
    }
  });

  // Layer move mappings
  const moveMappings: Record<string, () => void> = {
    'btn-u': () => addMove('Y', getCondition('Y', true), Math.PI / 2),
    'btn-u-prime': () => addMove('Y', getCondition('Y', true), -Math.PI / 2),
    'btn-d': () => addMove('Y', getCondition('Y', false), -Math.PI / 2),
    'btn-d-prime': () => addMove('Y', getCondition('Y', false), Math.PI / 2),
    'btn-l': () => addMove('X', getCondition('X', false), -Math.PI / 2),
    'btn-l-prime': () => addMove('X', getCondition('X', false), Math.PI / 2),
    'btn-r': () => addMove('X', getCondition('X', true), Math.PI / 2),
    'btn-r-prime': () => addMove('X', getCondition('X', true), -Math.PI / 2),
    'btn-f': () => addMove('Z', getCondition('Z', true), Math.PI / 2),
    'btn-f-prime': () => addMove('Z', getCondition('Z', true), -Math.PI / 2),
    'btn-b': () => addMove('Z', getCondition('Z', false), -Math.PI / 2),
    'btn-b-prime': () => addMove('Z', getCondition('Z', false), Math.PI / 2),
  };

  for (const btnId in moveMappings) {
    const elem = document.getElementById(btnId);
    if (elem) elem.addEventListener('click', moveMappings[btnId]);
  }

  document.getElementById('btn-scramble')?.addEventListener('click', scrambleCube);
  document.getElementById('btn-reset')?.addEventListener('click', resetCube);
}

// Canvas dynamic resize handling
function resizeCanvas() {
  if (canvas && canvas.parentElement) {
    const cw = canvas.parentElement.clientWidth;
    const ch = canvas.parentElement.clientHeight;
    // Real width and height fallback to 600x500 to guarantee it always renders perfectly.
    canvas.width = cw || 600;
    canvas.height = ch || 500;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initial page show and translation update
showPage('page-welcome');
updateTranslations();

// Render Loop
function mainLoop() {
  if (!canvas || !ctx) return;

  const gamePage = document.getElementById('page-game');
  if (!gamePage || !gamePage.classList.contains('active')) {
    requestAnimationFrame(mainLoop);
    return;
  }

  // If no move is currently animating, pop the next move from the queue
  if (!currentMove && moveQueue.length > 0) {
    currentMove = moveQueue.shift()!;
    currentAngle = 0;
    affectedCubelets = cubelets.filter((c) => currentMove!.condition(c.pos));
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
    canvas.height,
    currentSize
  );

  requestAnimationFrame(mainLoop);
}

// Start rendering loop
mainLoop();
