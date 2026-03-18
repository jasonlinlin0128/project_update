// 從截圖提取的正確專案資料
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBlOglfZtVNC3wkH8FzxPRWpZjbioOisKA",
    authDomain: "project-update-ab874.firebaseapp.com",
    projectId: "project-update-ab874",
    storageBucket: "project-update-ab874.firebasestorage.app",
    messagingSenderId: "149051930119",
    appId: "1:149051930119:web:fa2be596b9c047fdb4dca2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 要刪除的錯誤專案（保留前3個正確的）
const wrongProjects = [
    "智慧製造-機台稼動率", "智慧製造-生產報工", "智慧製造-生產排程",
    "智慧製造-物料管理", "智慧製造-電子SOP", "智慧製造-設備管理",
    "智慧製造-品質管理", "智慧製造-能源管理", "智慧製造-人員管理",
    "智慧製造-供應商管理", "智慧製造-客戶管理"
];

// 從截圖中提取的正確專案資料
const correctProjects = [
    { name: "壓鑄機射料曲線系統", department: "廠2部門(胡挺理)", startTime: "2025-08-25", dueDate: "2026-01-31", priority: "中", progress: 5, status: "進行中" },
    { name: "壓鑄機SCADA整合系統", department: "廠2部門(胡挺理)", startTime: "2025-08-25", dueDate: "2025-12-31", priority: "中", progress: 10, status: "進行中" },
    { name: "MasterCAM外掛程式開發", department: "加工部 (林昆弘)", startTime: "2025-08-11", dueDate: "2025-09-25", priority: "中", progress: 50, status: "進行中" },
    { name: "NFC工廠設備巡檢", department: "管理部 (蕭雲峰)", startTime: "2025-06-09", dueDate: "2025-08-01", priority: "高", progress: 80, status: "進行中" },
    { name: "Dynabook-APS排程管理方案", department: "誠企室(林若懿)", startTime: "2025-07-29", dueDate: "unknown", priority: "中", progress: 10, status: "進行中" },
    { name: "壓鑄機爐座型工業電腦", department: "廠2部門(胡挺理)", startTime: "unknown", dueDate: "unknown", priority: "中", progress: 0, status: "規劃中" },
    { name: "Google AgentSpace(Simhope KM+EIP開發)", department: "誠企室 (Porter)", startTime: "unknown", dueDate: "unknown", priority: "低", progress: 0, status: "規劃中" },
    { name: "檢驗流程SOP呈現優化", department: "品保部 (薛瑞文)", startTime: "2025-09-03", dueDate: "unknown", priority: "低", progress: 5, status: "進行中" },
    { name: "發票識別申報覆核", department: "管理部 (蕭雲峰)", startTime: "2025-09-25", dueDate: "2025-12-31", priority: "中", progress: 0, status: "規劃中" },
    { name: "檔案建立修改日期自訂工具", department: "技術部", startTime: "2025-11-18", dueDate: "2025-11-18", priority: "中", progress: 100, status: "已完成" },
    { name: "資安Teams Bot建置", department: "資安小隊", startTime: "2025-05-30", dueDate: "2025-06-04", priority: "高", progress: 100, status: "已完成" }
];

async function fixProjects() {
    console.log('🔧 開始修正專案資料...\n');

    // 1. 刪除錯誤資料
    console.log('🗑️  刪除錯誤專案...');
    const querySnapshot = await getDocs(collection(db, 'projects'));
    let deletedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (wrongProjects.includes(data.name)) {
            await deleteDoc(doc(db, 'projects', docSnapshot.id));
            console.log(`   🗑️  已刪除: ${data.name}`);
            deletedCount++;
        }
    }
    console.log(`✅ 已刪除 ${deletedCount} 筆錯誤資料\n`);

    // 2. 匯入正確資料
    console.log('📥 匯入正確專案...');
    let successCount = 0;

    for (const project of correctProjects) {
        try {
            const projectData = {
                name: project.name,
                department: project.department,
                startTime: project.startTime,
                dueDate: project.dueDate,
                priority: project.priority,
                progress: project.progress,
                status: project.status,
                proposalUnit: project.department.split('(')[0].trim() || '技術部',
                proposalContact: project.department.includes('(')
                    ? project.department.match(/\(([^)]+)\)/)?.[1] || '系統管理員'
                    : '系統管理員',
                owner: '待指派',
                projectReason: '從舊系統遷移的歷史專案',
                currentSituation: '',
                difficulties: '',
                crossUnitIssues: '',
                attemptedSolutions: '',
                projectGoals: '',
                expectedFeatures: '',
                targetUsers: '',
                expectedBenefits: '',
                estimatedTimeline: '',
                successMetrics: '',
                requiredResources: '',
                riskAssessment: '',
                description: `從舊系統遷移的專案：${project.name}`,
                relatedUnits: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'projects'), projectData);
            console.log(`   ✅ 已匯入: ${project.name}`);
            successCount++;
        } catch (error) {
            console.error(`   ❌ 匯入失敗: ${project.name}`, error.message);
        }
    }

    console.log(`\n✅ 已匯入 ${successCount} 筆正確資料`);
    console.log(`\n🎉 修正完成！總共 ${successCount + 3} 筆歷史專案（含原有的3筆正確資料）\n`);
}

fixProjects()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 錯誤:', error);
        process.exit(1);
    });
