---
name: new-record
description: 用自然語言新增或更新任意 Firebase collection 的資料記錄，支援所有 collection
user_invocable: true
---

# 新增 / 更新資料記錄 Skill

這是 `update-project` 的泛化版，支援所有 Firebase collection。

## 支援的 Collections

| Collection | 主要欄位 |
|------------|---------|
| `projects` | name, status, progress, priority, projectOwner, dueDate, description |
| `routines` | title, frequency, assignee, status |
| `forums` | name, date, role, location, description |
| `events` | name, date, location, description, participants |
| `coordination` | name, contact, status, description, nextAction |
| `meetings` | title, date, location, attendees, summary, actionItems |

---

## 執行流程

### 步驟 1：確認使用者意圖

用 AskUserQuestion 詢問：
> 「你要新增還是更新資料？屬於哪個類別？（專案 / 例行公事 / 論壇 / 活動 / 接洽 / 會議）」

### 步驟 2a：如果是**更新**現有記錄

執行對應的列表指令：

```bash
# 專案
node scripts/firebase-utils.mjs list-projects

# 其他 collection（用通用指令）
node scripts/firebase-utils.mjs list-collection <collectionName>
```

顯示清單讓使用者選擇，然後詢問要更新哪些欄位。

### 步驟 2b：如果是**新增**新記錄

詢問必要欄位（根據 collection 類型只問關鍵欄位，其他用預設值）：

- **專案**：名稱、狀態、負責人、預計完成日
- **例行公事**：名稱、頻率、負責人
- **論壇/活動**：名稱、日期、地點
- **接洽**：對象名稱、聯絡人、目前狀態
- **會議**：名稱、日期、地點、出席者

### 步驟 3：顯示變更摘要並確認

清楚列出：
- 目標 collection 和記錄
- 每個要寫入的欄位和值
- 用 AskUserQuestion 請使用者確認

### 步驟 4：執行寫入

```bash
# 新增
node scripts/firebase-utils.mjs add-collection <collectionName> '<json>'

# 更新
node scripts/firebase-utils.mjs update-collection <collectionName> <docId> '<json>'
```

回報結果。

---

## 注意事項

- `updatedAt` / `createdAt` 由 firebase-utils.mjs 自動設定，不需使用者輸入
- 若使用者描述的內容不確定對應哪個欄位，直接問清楚再寫入，不要猜測
- 若 firebase-utils.mjs 目前沒有對應的指令，先顯示要寫入的 JSON，讓使用者可以手動操作
