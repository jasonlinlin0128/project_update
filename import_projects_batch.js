// 專案資料批次匯入腳本
// 執行方式: node import_projects_batch.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase 配置 (從你的 firebase.js 複製)
const firebaseConfig = {
    apiKey: "AIzaSyDf_wjPMij1GqBBCnt4RwgaZ5kjPZF-M20",
    authDomain: "project-update-e1ae8.firebaseapp.com",
    projectId: "project-update-e1ae8",
    storageBucket: "project-update-e1ae8.firebasestorage.app",
    messagingSenderId: "363488498137",
    appId: "1:363488498137:web:fc325ec33fb2f97cb66db4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 12 個專案資料
const projects = [
    {
        name: "會議記錄逐字稿及重點整理工具",
        proposerUnit: "薪桉/技術部",
        department: "技術部",
        owner: "薪桉",
        startTime: "2025-04-30",
        dueDate: "2025-05-26",
        status: "已完成",
        progress: 100,
        importance: "提升會議效率，自動產出逐字稿與重點整理",
        goals: "開發會議記錄自動化工具"
    },
    {
        name: "Teams Bot建置",
        proposerUnit: "佳賢/自主",
        department: "自主開發",
        owner: "佳賢",
        startTime: "2025-05-30",
        dueDate: "2025-06-04",
        status: "已完成",
        progress: 100,
        importance: "建置 Teams 自動化機器人",
        goals: "Teams Bot 上線運作"
    },
    {
        name: "電控找料小幫手",
        proposerUnit: "電控部",
        department: "電控部",
        owner: "",
        startTime: "",
        dueDate: "",
        status: "已終止",
        progress: 0,
        importance: "協助電控部快速查找料件",
        goals: "開發找料輔助工具"
    },
    {
        name: "物管備料數位化",
        proposerUnit: "王偉全/生管",
        department: "生管",
        owner: "王偉全",
        startTime: "2025-08-19",
        dueDate: "2025-09-19",
        status: "已終止",
        progress: 0,
        importance: "物管備料流程數位轉型",
        goals: "數位化備料管理流程"
    },
    {
        name: "壓鑄機SCADA整合系統",
        proposerUnit: "胡協理/電控",
        department: "電控部",
        owner: "胡協理",
        startTime: "2025-08-25",
        dueDate: "",
        status: "開發中",
        progress: 50,
        importance: "整合壓鑄機監控系統",
        goals: "建立 SCADA 整合平台"
    },
    {
        name: "檢驗SOP呈現優化",
        proposerUnit: "薛瑞文/品保",
        department: "品保部",
        owner: "薛瑞文",
        startTime: "2025-09-03",
        dueDate: "",
        status: "開發中",
        progress: 30,
        importance: "優化檢驗 SOP 呈現方式",
        goals: "提升 SOP 易讀性與可操作性"
    },
    {
        name: "加工部日報表數位化",
        proposerUnit: "林昆弘/加工",
        department: "加工部",
        owner: "林昆弘",
        startTime: "2025-09-11",
        dueDate: "2025-09-30",
        status: "已完成",
        progress: 100,
        importance: "加工部日報表數位轉型",
        goals: "開發完成並通過 User 測試",
        currentSituation: "開發完成：2025/09/25，User測試及調整：2025/09/25~2025/09/30"
    },
    {
        name: "MasterCAM外掛程式開發",
        proposerUnit: "林昆弘/加工",
        department: "加工部",
        owner: "林昆弘",
        startTime: "2025-09-11",
        dueDate: "",
        status: "開發中",
        progress: 40,
        importance: "開發 MasterCAM 專用外掛",
        goals: "擴展 MasterCAM 功能"
    },
    {
        name: "NFC工廠夜間巡檢",
        proposerUnit: "淑惠姊/管理部",
        department: "管理部",
        owner: "淑惠姊",
        startTime: "2025-06-09",
        dueDate: "2025-07-29",
        status: "測試中",
        progress: 90,
        importance: "建立 NFC 夜間巡檢系統",
        goals: "開發完成，待廠長驗收",
        currentSituation: "測試人：邱廠長/生產(未測試)"
    },
    {
        name: "SimHope專案協作平台",
        proposerUnit: "明燕/軍品業務",
        department: "軍品業務",
        owner: "明燕",
        startTime: "",
        dueDate: "",
        status: "測試中",
        progress: 95,
        importance: "專案協作平台開發",
        goals: "開發完成，待 User 驗收"
    },
    {
        name: "檔案時間編輯小工具",
        proposerUnit: "家汝/技術部、光志/管理部",
        department: "技術部",
        owner: "家汝",
        startTime: "2025-11-18",
        dueDate: "2025-11-19",
        status: "已完成",
        progress: 100,
        importance: "快速編輯檔案時間戳記",
        goals: "開發檔案時間編輯工具"
    },
    {
        name: "社交工程網站建立",
        proposerUnit: "光志/管理部",
        department: "管理部",
        owner: "光志",
        startTime: "2025-11-19",
        dueDate: "2025-11-19",
        status: "已完成",
        progress: 100,
        importance: "建立社交工程測試網站",
        goals: "完成社交工程測試網站",
        currentSituation: "備註：因為發佈的時候設定成開發環境，故測試失敗，下個月會再做另一種"
    }
];

async function importProjects() {
    console.log('開始匯入專案資料...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const project of projects) {
        try {
            const docRef = await addDoc(collection(db, "projects"), {
                ...project,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ 已匯入: ${project.name} (ID: ${docRef.id})`);
            successCount++;
        } catch (error) {
            console.error(`❌ 匯入失敗: ${project.name}`, error.message);
            errorCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`匯入完成！成功: ${successCount}，失敗: ${errorCount}`);
    console.log(`========================================`);

    process.exit(0);
}

importProjects();
