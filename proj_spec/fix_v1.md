# 魔術方塊渲染優化方案

## 問題分析與診斷

當前渲染之所以會顯得「空洞」或「怪怪的」，主要原因在於 `renderCube` 邏輯中，將內部面（Internal Faces，即 `#282828`）直接跳過不繪製。
在真實的魔術方塊中，當你轉動某一層時，你會看到小方塊的側面（黑色塑膠部分）。目前代碼裡，這些黑色面被 `if (f.color === '#282828') continue;` 給過濾掉了，導致在旋轉過程中，方塊看起來像是一堆「沒有厚度的薄片」在飛舞。

---

## 優化與修正提案

要讓它看起來像真實的魔術方塊，建議調整 `renderer.ts` 的核心邏輯如下：

### 1. 調整 `renderCube` 的核心邏輯

不要跳過黑色面，而是將它們視為「黑色塑膠體」的一部分參與渲染。這樣在旋轉時，方塊的「厚度」才會正確出現。

#### 【關鍵修改】

不再跳過 `#282828` 面，而是將其當作黑色塑膠邊緣繪製出來。
貼紙縮放邏輯：只有外層貼紙才進行縮放（如 `0.92`），黑色塑膠部分（底色）應該維持 `1.0` 大小。

```typescript
// renderer.ts Part 1 循環修正參考
for (const c of cubelets) {
  const isAffected = affectedCubelets.includes(c);

  for (const f of c.faces) {
    const faceVerts: Point2D[] = [];
    let sumZ = 0;
    const worldVerts: Point3D[] = [];

    for (const vLocal of f.localVertices) {
      let v: Point3D = { ...vLocal };
      let cPos: Point3D = { ...c.pos };

      // 貼紙縮放邏輯：只有外層貼紙才縮放 0.92，黑色塑膠部分（底底色）應該維持 1.0
      const isSticker = f.color !== '#282828';
      const scale = isSticker ? 0.92 : 1.0; 
      
      v.x *= scale;
      v.y *= scale;
      v.z *= scale;

      // 旋轉矩陣計算
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

      let p: Point3D = { x: cPos.x + v.x, y: cPos.y + v.y, z: cPos.z + v.z };
      p = rotateY(p, thetaY);
      p = rotateX(p, thetaX);

      worldVerts.push(p);
      sumZ += p.z;

      const u = (p.x * focalLength) / (p.z + distance);
      const v_proj = (p.y * focalLength) / (p.z + distance);
      faceVerts.push({ x: width / 2 + u, y: height / 2 - v_proj });
    }

    // 當 winding < 0 (可見面) 時傳入繪製隊列
    if (winding < 0) {
      allVisibleFaces.push({
        projected: faceVerts,
        color: f.color === '#282828' ? '#111111' : f.color,
        centerZ: sumZ / 4,
        dot,
        isSticker: f.color !== '#282828',
      });
    }
  }
}
```

---

### 2. 優化繪製細節 (Premium Feel)

在最後繪製 `allVisibleFaces` 的循環中，為了增加真實感，我們可以為「黑色塑膠」和「彩色貼紙」加上不同的光澤：
- **黑色底座**：給予細微的描邊，模擬方塊間的縫隙（結構線）。
- **彩色貼紙**：加上圓角感（利用 `lineJoin = "round"` 模擬）。

```typescript
// renderer.ts 最後的繪製循環
for (const f of allVisibleFaces) {
  ctx.beginPath();
  ctx.lineJoin = "round"; // 讓轉角平滑一點
  ctx.moveTo(f.projected[0].x, f.projected[0].y);
  for (let i = 1; i < f.projected.length; i++) {
    ctx.lineTo(f.projected[i].x, f.projected[i].y);
  }
  ctx.closePath();

  // 基礎填色
  ctx.fillStyle = f.color;
  ctx.fill();

  // 增加光影效果
  ctx.fillStyle = `rgba(255,255,255,${f.dot * 0.15})`; // 亮面
  ctx.fill();

  if (f.isSticker) {
    // 貼紙：加一個極細的黑邊，讓貼紙更有立體感
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // 黑色塑膠：加一個深灰色邊框，模擬結構線
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
```

---

## 預期優化效果

- **結構完整性**：轉動時，會看到側面具有厚度的黑色塑膠體，解決了原本「薄片飄浮」的視覺問題。
- **視覺對比**：縮小後的彩色貼紙配合外側黑色塑膠，呈現最經典的魔術方塊視覺特徵（黑色間隙）。
- **光影感**：透視投影、高質量光源反射與細微描邊大幅提升方塊的高級感。
