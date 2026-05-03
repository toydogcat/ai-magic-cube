1. 調整渲染順序與邏輯 (renderer.ts)要做出「凸起」感，我們需要將每個小方塊的「黑色塑膠殼」和「彩色貼紙」分開處理，並讓貼紙稍微「浮」在殼的表面。修改重點：黑色底殼 (The Plastic Shell): 繪製完整的小方塊，但顏色設為深黑，並稍微縮小一點點（例如 $0.98$），創造出方塊間的縫隙（Gaps）。  凸起貼紙 (The Raised Sticker): 在繪製外部彩色面時，將其頂點沿著法線方向往外推 $0.02 \sim 0.05$ 單位。  
// renderer.ts 修改邏輯建議

for (const c of cubelets) {
  // ... 之前的旋轉邏輯 ...

  for (const f of c.faces) {
    // 1. 先畫黑色塑膠殼 (每個面都畫，不分內外)
    // 這裡我們把每個頂點維持 1.0 的縮放，但顏色強制深黑
    renderFace(ctx, f, c, 1.0, 0, '#111111', false); 

    // 2. 如果是外部面，再疊加一層彩色貼紙
    if (f.color !== '#282828') {
      // 縮放 0.85 ~ 0.9 創造出黑邊
      // offset 設為 0.03 讓它「凸」出來
      renderFace(ctx, f, c, 0.88, 0.03, f.color, true);
    }
  }
}

/**
 * 封裝一個渲染面的函數，支援縮放與位移
 */
function renderFace(ctx, face, cubelet, scale, offset, color, isSticker) {
  const projectedVerts = face.localVertices.map(v => {
    // 1. 縮放 (Sticker Size)
    let tempV = { x: v.x * scale, y: v.y * scale, z: v.z * scale };
    
    // 2. 凸起位移 (Along the normal)
    // 假設 face.normal 已經預定義好 (例如 {x:0, y:1, z:0})
    tempV.x += face.normal.x * offset;
    tempV.y += face.normal.y * offset;
    tempV.z += face.normal.z * offset;

    // 3. 旋轉與投影邏輯 (套用你原本的 thetaX, thetaY 等)
    // ...
    return projectedPoint;
  });

  // 4. 繪製並加上圓角感
  ctx.lineJoin = 'round';
  ctx.lineWidth = isSticker ? 2 : 1; 
  // ... 填充 color ...
}

2. 模擬圓角 (Visual Trick)
在 Canvas 2D 中很難真的算 3D 圓角。但我們可以透過以下方式模擬：

Shadow/Glow: 給貼紙加上一個微弱的內陰影。  

Gradient: 不要用純色填充彩色貼紙，使用徑向漸層 (Radial Gradient) 讓貼紙中心稍微亮一點，邊緣暗一點，這樣視覺上會有「弧度」的錯覺。

3. 修改 cube.ts 的 Face 定義
確保你的 Face 資料結構中有正確的 normal 向量。當你的層旋轉時，這個法向量也必須跟著旋轉，這樣「凸起」的方向才會正確。

// cube.ts 的旋轉邏輯
// 當層轉動 90 度時，除了更新頂點，也要更新法向量
f.normal = rotateY(f.normal, targetAngle); // 舉例

為什麼這會有效？立體層次感: 因為彩色貼紙的 $z$ 軸投影會比黑色底殼稍微靠近相機一點點（因為 offset），Z-sorting 會處理好遮擋，讓它看起來真的像貼在上面。  黑邊效果: scale: 0.88 會露出底下的黑色底殼，形成你圖中那種漂亮的溝槽。


