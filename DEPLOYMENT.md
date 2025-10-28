# 部署指南 (Deployment Guide)

## 目錄
- [部署前檢查清單](#部署前檢查清單)
- [環境變數配置](#環境變數配置)
- [建置生產版本](#建置生產版本)
- [部署到 Vercel](#部署到-vercel)
- [部署到 Netlify](#部署到-netlify)
- [部署到 Firebase Hosting](#部署到-firebase-hosting)
- [部署後驗證](#部署後驗證)
- [常見問題](#常見問題)

---

## 部署前檢查清單

在部署前，請確認以下項目：

- [ ] 所有測試通過 (`npm run test`)
- [ ] 生產建置成功 (`npm run build`)
- [ ] `.env.local` 已配置且不會被提交到版本控制
- [ ] Firebase 配置正確
- [ ] 已建立 `.env.example` 作為環境變數範本
- [ ] 已更新 `package.json` 版本號
- [ ] 已檢查所有儀表板功能正常運作

---

## 環境變數配置

### 1. 本地開發環境

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入您的 Firebase 配置：

```env
VITE_FIREBASE_API_KEY=你的_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=你的專案.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://你的專案-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=你的專案ID
VITE_FIREBASE_STORAGE_BUCKET=你的專案.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=你的SENDER_ID
VITE_FIREBASE_APP_ID=你的APP_ID
```

### 2. 生產環境配置

**重要：** 請勿將 `.env.local` 提交到 Git！

生產環境的環境變數應該在部署平台的設定中配置（見下方各平台說明）。

---

## 建置生產版本

### 本地建置測試

```bash
# 安裝依賴
npm install

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 建置輸出說明

建置完成後，所有文件將輸出到 `dist/` 目錄：

```
dist/
├── index.html           # 入口 HTML 文件
├── assets/             # 靜態資源（JS、CSS）
│   ├── *.js           # JavaScript 文件
│   ├── *.css          # CSS 文件
│   └── *.map          # Source maps（可選）
└── ...
```

**建置統計：**
- 總大小：~530 KB（壓縮前）
- Gzip 後：~140 KB
- 建置時間：~3-4 秒

---

## 部署到 Vercel

### 方法 1：使用 Vercel CLI（推薦）

1. **安裝 Vercel CLI**

```bash
npm install -g vercel
```

2. **登入 Vercel**

```bash
vercel login
```

3. **部署**

```bash
# 初次部署（會詢問專案配置）
vercel

# 部署到生產環境
vercel --prod
```

4. **配置環境變數**

```bash
# 使用 CLI 設定環境變數
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_DATABASE_URL
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

### 方法 2：使用 Vercel Dashboard

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 匯入您的 Git 儲存庫
4. 配置專案設定：
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. 設定環境變數：
   - 進入 Project Settings → Environment Variables
   - 添加所有 `VITE_FIREBASE_*` 變數
   - 選擇 Production、Preview 和 Development 環境

6. 點擊 "Deploy"

### Vercel 配置文件（可選）

創建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 部署到 Netlify

### 方法 1：使用 Netlify CLI

1. **安裝 Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **登入 Netlify**

```bash
netlify login
```

3. **初始化專案**

```bash
netlify init
```

4. **部署**

```bash
# 部署到生產環境
netlify deploy --prod
```

### 方法 2：使用 Netlify Dashboard

1. 前往 [Netlify](https://app.netlify.com/)
2. 點擊 "Add new site" → "Import an existing project"
3. 連接您的 Git 儲存庫
4. 配置建置設定：
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (留空)

5. 設定環境變數：
   - Site settings → Environment variables
   - 添加所有 `VITE_FIREBASE_*` 變數

6. 點擊 "Deploy site"

### Netlify 配置文件

創建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 部署到 Firebase Hosting

### 1. 安裝 Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. 登入 Firebase

```bash
firebase login
```

### 3. 初始化 Firebase Hosting

```bash
firebase init hosting
```

選擇以下選項：
- **Public directory:** `dist`
- **Configure as single-page app:** `Yes`
- **Set up automatic builds:** `No`（或根據需求選擇）
- **Overwrite index.html:** `No`

### 4. 建置專案

```bash
npm run build
```

### 5. 部署

```bash
# 預覽部署
firebase hosting:channel:deploy preview

# 部署到生產環境
firebase deploy --only hosting
```

### Firebase 配置文件

確認 `firebase.json` 配置：

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 部署後驗證

部署完成後，請執行以下檢查：

### 1. 功能測試

- [ ] 首頁正常載入
- [ ] AI 專案管理儀表板顯示正確
- [ ] 例行任務儀表板功能正常
- [ ] 分享會儀表板功能正常
- [ ] 活動參與儀表板功能正常
- [ ] 企業接洽儀表板功能正常
- [ ] Firebase 連接正常
- [ ] CRUD 操作正常運作

### 2. 效能檢查

訪問 [PageSpeed Insights](https://pagespeed.web.dev/) 檢查效能：

- [ ] Performance Score > 90
- [ ] Accessibility Score > 90
- [ ] Best Practices Score > 90
- [ ] SEO Score > 90

### 3. 跨瀏覽器測試

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] 行動裝置瀏覽器

### 4. 主題測試

- [ ] 淺色主題正常
- [ ] 深色主題正常
- [ ] 所有顏色主題正常切換

---

## 常見問題

### Q1: 部署後環境變數無效？

**解答：** 確認以下事項：
1. 環境變數名稱必須以 `VITE_` 開頭
2. 在部署平台設定中正確配置環境變數
3. 重新建置並部署（環境變數變更需要重新建置）

### Q2: 部署後頁面 404？

**解答：** 配置 SPA 路由重定向：
- **Vercel:** 使用 `vercel.json` 配置 routes
- **Netlify:** 使用 `netlify.toml` 配置 redirects
- **Firebase:** 使用 `firebase.json` 配置 rewrites

### Q3: Firebase 連接失敗？

**解答：**
1. 檢查 Firebase Realtime Database 規則
2. 確認環境變數配置正確
3. 查看瀏覽器控制台錯誤訊息
4. 前往 `/diagnostics` 頁面檢查連線狀態

### Q4: 建置失敗？

**解答：**
1. 清除 node_modules 和快取：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. 檢查 Node.js 版本（建議 18.x 或更高）
3. 查看建置日誌中的具體錯誤

### Q5: 深色模式不工作？

**解答：** 檢查 Tailwind CSS 配置：
- 確認 `tailwind.config.js` 中 `darkMode: 'class'`
- 清除瀏覽器 localStorage 並重新整理

---

## 效能優化建議

### 1. 啟用 CDN

所有主要部署平台都提供 CDN：
- Vercel：自動啟用
- Netlify：自動啟用
- Firebase：透過 Firebase Hosting CDN

### 2. 啟用壓縮

確保伺服器啟用 Gzip/Brotli 壓縮（大多數平台預設啟用）。

### 3. 快取策略

配置適當的 Cache-Control 標頭（見各平台配置文件）。

### 4. 圖片優化

- 使用 WebP 格式
- 實作延遲載入
- 使用適當的圖片尺寸

---

## 安全性檢查

### 部署前

- [ ] `.env.local` 已加入 `.gitignore`
- [ ] 沒有硬編碼的 API 金鑰
- [ ] Firebase 安全規則已設定
- [ ] 所有依賴套件已更新

### Firebase 安全規則範例

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "projects": {
      ".indexOn": ["id", "status"]
    },
    "routineTasks": {
      ".indexOn": ["category"]
    }
  }
}
```

---

## 監控和維護

### 建議使用的監控工具

1. **Vercel Analytics**（Vercel 部署）
2. **Netlify Analytics**（Netlify 部署）
3. **Firebase Performance Monitoring**
4. **Google Analytics**
5. **Sentry**（錯誤追蹤）

### 定期維護

- 每月更新依賴套件
- 監控效能指標
- 檢查安全性漏洞
- 備份 Firebase 數據

---

## 聯絡支援

如有部署問題，請參考：
- [Vite 文檔](https://vitejs.dev/guide/static-deploy.html)
- [Vercel 文檔](https://vercel.com/docs)
- [Netlify 文檔](https://docs.netlify.com/)
- [Firebase 文檔](https://firebase.google.com/docs/hosting)

---

**最後更新：** 2025-10-28
**版本：** 1.0.0
