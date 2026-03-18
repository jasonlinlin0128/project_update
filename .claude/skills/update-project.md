---
name: update-project
description: 從 Firebase 讀取專案列表，讓用戶用自然語言描述更新內容，確認後寫入 Firestore
user_invocable: true
---

# 更新專案進度 Skill

當用戶想要更新專案進度時，按照以下流程操作：

## 步驟 1：取得目前專案清單

執行以下命令取得所有專案：

```bash
node scripts/firebase-utils.mjs list-projects
```

將結果整理為易讀的清單，顯示每個專案的：
- 名稱
- 目前狀態
- 目前進度 (%)
- 負責人
- 到期日

## 步驟 2：確認用戶要更新的內容

用 AskUserQuestion 詢問用戶要更新哪個專案、更新什麼欄位。

用戶可以用自然語言描述，例如：
- 「AI客服進度改到70%，狀態改開發中」
- 「把OCR的備註加上『已完成API串接』」
- 「新增一個專案叫做資料分析平台」

## 步驟 3：解析用戶意圖

根據用戶描述，對應到以下可更新欄位：
- `name` - 專案名稱
- `status` - 狀態（可用值：需求確認中 / 開發中 / 內測中 / 已上線 / 已終止 / 規劃中 / 進行中 / 已完成）
- `progress` - 進度 0-100
- `priority` - 優先級（高 / 中 / 低）
- `projectOwner` - 負責人
- `description` - 備註/描述
- `startTime` - 開始日期 (YYYY-MM-DD)
- `dueDate` - 到期日 (YYYY-MM-DD)
- `requestingUnit` - 提案單位
- `department` - 負責部門
- `goals` - 專案目標
- `painPoints` - 痛點
- `kpi` - KPI

## 步驟 4：顯示變更摘要並確認

在執行前，清楚顯示：
- 目標專案名稱與 ID
- 每個要變更的欄位：舊值 → 新值
- 用 AskUserQuestion 請用戶確認

## 步驟 5：執行更新

用戶確認後，執行對應命令：

**更新現有專案：**
```bash
node scripts/firebase-utils.mjs update-project <docId> '<json>'
```

**新增專案：**
```bash
node scripts/firebase-utils.mjs add-project '<json>'
```

確認命令成功後，回報更新結果。

## 注意事項

- JSON 字串中的值如果包含中文，需要正確編碼
- `updatedAt` 會自動設定為當前時間，不需要手動指定
- 如果用戶提到的專案名稱不在清單中，詢問是否要新增
- 支援一次更新多個專案，依序處理
