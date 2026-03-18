// Firebase 資料遷移腳本
// 將舊專案的中文欄位轉換為英文欄位

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";

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

// 欄位映射表
const fieldMapping = {
    '名稱': 'name',
    '始': 'startTime',
    '終': 'dueDate',
    '進度': 'progress',
    '優先級': 'priority',
    '狀態': 'status',
    '部門': 'department',
    '負責人': 'owner',
    '描述': 'description',
    '提案單位': 'proposalUnit',
    '聯絡人': 'proposalContact',
    '專案原因': 'projectReason',
    '現況': 'currentSituation',
    '困難點': 'difficulties',
    '跨單位議題': 'crossUnitIssues',
    '嘗試過的方案': 'attemptedSolutions',
    '專案目標': 'projectGoals',
    '期望功能': 'expectedFeatures',
    '目標使用者': 'targetUsers',
    '預期效益': 'expectedBenefits',
    '預估時程': 'estimatedTimeline',
    '成功指標': 'successMetrics',
    '所需資源': 'requiredResources',
    '風險評估': 'riskAssessment'
};

async function migrateProjects() {
    console.log('🚀 開始遷移專案資料...');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        let migratedCount = 0;
        let skippedCount = 0;

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            const updates = {};
            const fieldsToDelete = {};
            let hasChineseFields = false;

            // 檢查並轉換中文欄位
            for (const [chineseField, englishField] of Object.entries(fieldMapping)) {
                if (data[chineseField] !== undefined) {
                    hasChineseFields = true;
                    // 只有當英文欄位不存在或為空時才複製
                    if (!data[englishField]) {
                        updates[englishField] = data[chineseField];
                    }
                    // 標記要刪除的中文欄位
                    fieldsToDelete[chineseField] = deleteField();
                }
            }

            // 如果發現中文欄位，執行更新
            if (hasChineseFields) {
                const allUpdates = { ...updates, ...fieldsToDelete };
                await updateDoc(doc(db, 'projects', docSnapshot.id), allUpdates);
                console.log(`✅ 已遷移專案: ${data['名稱'] || data.name || docSnapshot.id}`);
                migratedCount++;
            } else {
                console.log(`⏭️  跳過（已是英文欄位）: ${data.name || docSnapshot.id}`);
                skippedCount++;
            }
        }

        console.log('\n📊 遷移完成！');
        console.log(`   ✅ 已遷移: ${migratedCount} 筆`);
        console.log(`   ⏭️  已跳過: ${skippedCount} 筆`);
        console.log(`   📝 總計: ${querySnapshot.docs.length} 筆\n`);

    } catch (error) {
        console.error('❌ 遷移失敗:', error);
        throw error;
    }
}

// 執行遷移
migrateProjects()
    .then(() => {
        console.log('🎉 所有資料遷移成功！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 遷移過程發生錯誤:', error);
        process.exit(1);
    });
