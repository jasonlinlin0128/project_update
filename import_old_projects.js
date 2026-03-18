// 匯入正確的舊專案資料
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// 從舊系統提取的正確專案資料
const correctProjects = [
    { name: "資安Teams Bot建置", startTime: "2025-05-30", dueDate: "2025-06-04", priority: "高", progress: 100, status: "已完成" },
    { name: "會議記錄逐字稿及重點整理工具", startTime: "2025-04-30", dueDate: "2025-05-26", priority: "高", progress: 100, status: "已完成" },
    { name: "加工部日報表數位化", startTime: "2025-09-11", dueDate: "2025-10-31", priority: "中", progress: 100, status: "已完成" },
    { name: "智慧製造-機台稼動率", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-生產報工", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-生產排程", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-物料管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-電子SOP", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-設備管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-品質管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-能源管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-人員管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-供應商管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" },
    { name: "智慧製造-客戶管理", startTime: "2025-07-20", dueDate: "2025-10-31", priority: "高", progress: 100, status: "已完成" }
];

async function importCorrectProjects() {
    console.log('🚀 開始匯入正確的專案資料...\n');

    let successCount = 0;
    let failCount = 0;

    for (const project of correctProjects) {
        try {
            const projectData = {
                name: project.name,
                startTime: project.startTime,
                dueDate: project.dueDate,
                priority: project.priority,
                progress: project.progress,
                status: project.status,
                proposalUnit: '技術部',
                proposalContact: '系統管理員',
                department: '技術部',
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
            console.log(`✅ 已匯入: ${project.name}`);
            successCount++;
        } catch (error) {
            console.error(`❌ 匯入失敗: ${project.name}`, error.message);
            failCount++;
        }
    }

    console.log('\n📊 匯入完成！');
    console.log(`   ✅ 成功: ${successCount} 筆`);
    console.log(`   ❌ 失敗: ${failCount} 筆`);
    console.log(`   📝 總計: ${correctProjects.length} 筆\n`);
}

importCorrectProjects()
    .then(() => {
        console.log('🎉 正確專案匯入完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 匯入過程發生錯誤:', error);
        process.exit(1);
    });
