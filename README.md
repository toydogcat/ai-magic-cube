# 3D Magic Cube Simulator 🧩

使用 HTML5 Canvas 2D API 渲染的全 3D 魔術方塊體驗，基於 Vanilla TypeScript 開發。

👉 **[立即體驗線上版](https://toydogcat.github.io/ai-magic-cube/)**

---

## 🌟 核心特色 (Features)

- **高效 3D 渲染**：純 Canvas 2D API 實現，不依賴 WebGL，提供極致流暢的渲染性能。
- **多元模式選擇**：支援 2x2x2、3x3x3 及 4x4x4 魔術方塊模式。
- **PWA 支援**：支援離線使用，可安裝至桌面或手機主畫面，猶如原生 App 的體驗。
- **完整解法教學**：內建主流 CFOP、降階法等主流還原解法教學與核心口訣。

---

## 📱 PWA 安裝說明 (Progressive Web App)

本專案支援 PWA (漸進式網頁應用程式)，您可以將本魔術方塊模擬器安裝到手機或電腦中，像原生 App 一樣離線玩方塊！

### 💻 桌面端安裝 (Chrome / Edge 等 Chromium 瀏覽器)
1. 使用 Chrome 或 Edge 瀏覽器打開 [線上體驗網址](https://toydogcat.github.io/ai-magic-cube/)。
2. 在網址列右側會看見一個 **「安裝應用程式」圖示**（或點擊瀏覽器右上角的 `...` 選單 -> `安裝 3D Magic Cube`）。
3. 點擊安裝後，專案便會以獨立視窗開啟，並自動在桌面建立捷徑。

### 📱 手機端安裝

#### iOS (Safari)
1. 使用 Safari 瀏覽器打開網址。
2. 點擊畫面底部的 **「分享」圖示**。
3. 往下捲動並選擇 **「加入主畫面」 (Add to Home Screen)**。
4. 點擊右上角的「新增」即可完成安裝。

#### Android (Chrome)
1. 使用 Chrome 瀏覽器打開網址。
2. 點擊網址列右側的 `...` 選單。
3. 點擊 **「安裝應用程式」**。
4. 點擊確認安裝，即可將捷徑新增至主畫面。

---

## 🛠️ 開發與建置 (Development)

### 1. 安裝依賴
```bash
npm install
# 若在 CI/CD 中發生 Vite 8 與 PWA 的 peer 依賴衝突，請執行 npm ci --legacy-peer-deps
```

### 2. 開啟本地開發環境
```bash
npm run dev
```

### 3. 打包與建置生產版本
```bash
npm run build
```

