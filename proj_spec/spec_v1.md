# 專案規格書：Vanilla 3D 2x2x2 魔術方塊

## 1. 技術棧 (Tech Stack)

- **環境**: Vite + TypeScript (Vanilla)
- **部署**: GitHub Pages
- **渲染引擎**: HTML5 Canvas 2D API (不使用 WebGL / Three.js)
- **數學基礎**: 3D 旋轉矩陣、透視投影 ($u = x/z, v = y/z$)

---

## 2. 核心物理模型 (Physics & Data Model)

- **座標系**: 原點 $(0, 0, 0)$ 位於方塊中心。
- **組成單位**: 8 個 `Cubelet` 物件。
- **小方塊屬性**:
  - `pos`: `{x, y, z}`: 當前的邏輯座標（範圍為 `-0.5` 或 `0.5`）。
  - `faces`: 包含 6 個面，每個面定義 4 個頂點相對於 `pos` 的偏移，以及該面的顏色。
- **顏色配置**: 前 (紅)、後 (橘)、上 (白)、下 (黃)、左 (綠)、右 (藍)。

---

## 3. 渲染管線 (Rendering Pipeline)

- **世界旋轉**: 將所有 `Cubelet` 的頂點乘上全局旋轉矩陣 $R_{\text{global}}$（受 View Mode 控制）。
- **局部旋轉**: 若正在進行「轉層」，則選中的 4 個 `Cubelet` 需額外乘上局部旋轉矩陣 $R_{\text{local}}$。
- **透視投影**: 套用 $u = \frac{x \cdot f}{z + d}, v = \frac{y \cdot f}{z + d}$
  - **$f$ (Focal Length)**: 建議 `400-600`
  - **$d$ (Distance)**: 建議 `4-5`，避免 $z$ 靠近 `0`
- **背面剔除 (Back-face Culling)**: 計算面法向量與視線向量 $(0, 0, -1)$ 的點積，僅繪製大於 `0` 的面。
- **深度排序 (Z-Sorting)**: 在畫入 Canvas 前，根據所有面中心點的 $z$ 值從大到小排序（由遠及近）。

---

## 4. 操作邏輯 (Interaction Design)

| 模式 | 觸發條件 | 行為說明 |
| :--- | :--- | :--- |
| **View Mode** | 平時狀態 (無 `Shift`) | 滑鼠按住拖拽時，更新全局旋轉角度 $\theta_x, \theta_y$。 |
| **Rotate Mode** | 按住 `Shift` | 點擊並短距離拖拽：<br>1. 根據點擊點判定選中的 `Cubelet` 與 `Face`<br>2. 根據滑鼠拖拽方向（與螢幕投影向量比對），判定旋轉軸心<br>3. 完成旋轉後，更新 `Cubelet` 的邏輯座標座標值 |

---

## 5. 核心代碼實作重點 (Vibe Coding Prompt)

### A. 旋轉矩陣函數

```javascript
function rotateX(p, angle) {
  return {
    x: p.x,
    y: p.y * Math.cos(angle) - p.z * Math.sin(angle),
    z: p.y * Math.sin(angle) + p.z * Math.cos(angle)
  };
}
// 同理實作 rotateY, rotateZ
```

### B. 渲染循環 (Main Loop)

```javascript
function draw() {
  ctx.clearRect(0, 0, width, height);
  // 1. 收集所有面
  // 2. 應用旋轉與投影
  // 3. Z-Sort
  // 4. ctx.fill() & ctx.stroke()
  requestAnimationFrame(draw);
}
```

---

## 6. 階段性開發目標 (Milestones)

- **Phase 1**: 在畫面上繪製出 8 個線框小方塊，並能用滑鼠轉動視角。
- **Phase 2**: 實作面填色與 Z-sorting，讓方塊看起來像實體。
- **Phase 3**: 加入 `Shift + Click` 邏輯，偵測被點選的層並進行 90 度轉動。
- **Phase 4**: 加入轉動動畫與「已完成」判定。
