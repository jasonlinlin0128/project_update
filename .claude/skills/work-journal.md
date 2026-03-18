---
name: work-journal
description: 引導使用者記錄今日工作日誌，輸出 Obsidian 相容的 markdown 檔案
user_invocable: true
---

# 工作日誌 Skill

## 設定

日誌儲存路徑（可修改）：
```
C:\Users\user\Desktop\Obsidian\WorkJournal\
```

檔名格式：`YYYY-MM-DD.md`（例：`2026-03-18.md`）

---

## 執行流程

### 步驟 1：確認今天日期

```bash
date /t
```

### 步驟 2：逐一詢問各類別

用 AskUserQuestion 依序詢問以下問題（若使用者說「無」或「沒有」則跳過該區塊）：

1. **今日主要工作摘要**
   > 「今天主要做了什麼？（一句話概述）」

2. **論壇 / 出差**
   > 「今天有去論壇或出差嗎？（活動名稱、地點、內容、心得）」

3. **廠商 / 解決方案來訪**
   > 「今天有廠商或解決方案商來訪嗎？（廠商名稱、討論內容、後續行動）」

4. **AI Agent / 協作開發**
   > 「今天有進行 AI Agent 或協作開發嗎？（專案名稱、做了什麼、遇到什麼問題）」

5. **需求訪談**
   > 「今天有進行需求訪談嗎？（訪談對象、痛點、初步結論）」

6. **其他事項**
   > 「還有其他值得記錄的事情嗎？」

7. **明日計劃**
   > 「明天預計做什麼？」

### 步驟 3：產生 markdown 並存檔

依照收集到的資料，生成以下格式的 markdown，**跳過使用者說「無」的區塊**：

```markdown
---
date: {{YYYY-MM-DD}}
type: work-journal
tags: [日誌]
---

# 工作日誌 {{YYYY-MM-DD}}

## 今日摘要
{{摘要}}

{{#if 論壇出差}}
## 論壇 / 出差
{{內容}}
{{/if}}

{{#if 廠商來訪}}
## 廠商 / 解決方案來訪
- **廠商：** {{名稱}}
- **討論內容：** {{內容}}
- **後續行動：** {{行動}}
{{/if}}

{{#if AI開發}}
## AI Agent / 協作開發
- **專案：** {{名稱}}
- **進展：** {{進展}}
- **問題：** {{問題}}
{{/if}}

{{#if 需求訪談}}
## 需求訪談
- **對象：** {{對象}}
- **痛點：** {{痛點}}
- **初步結論：** {{結論}}
{{/if}}

{{#if 其他}}
## 其他事項
{{內容}}
{{/if}}

## 明日計劃
{{計劃}}
```

### 步驟 4：存到本機

用 Bash 工具將 markdown 內容寫入：
```
C:\Users\user\Desktop\Obsidian\WorkJournal\YYYY-MM-DD.md
```

若資料夾不存在，先建立：
```bash
mkdir "C:\Users\user\Desktop\Obsidian\WorkJournal" 2>nul
```

存檔後回報：「✓ 已儲存至 C:\Users\user\Desktop\Obsidian\WorkJournal\YYYY-MM-DD.md」

---

## Obsidian 設定備忘

當你準備好設定 Obsidian 時：
1. 開啟 Obsidian → Open folder as vault
2. 選擇 `C:\Users\user\Desktop\Obsidian\`
3. 日誌就會全部出現，frontmatter 的 `date` / `tags` 可直接用 Dataview plugin 做彙整
4. 安裝推薦 plugins：Templater（套用模板）、Dataview（查詢日誌）
5. Templater 設定 template folder 為 `Templates`

---

## 注意事項

- 每天只會產生一個檔案，若當天已有日誌，詢問使用者是否要**覆蓋**或**附加**
- 若使用者想先快速記錄、之後補充，直接存一份不完整的也沒關係
