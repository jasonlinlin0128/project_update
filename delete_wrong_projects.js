// 刪除錯誤匯入的專案
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";

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

// 錯誤匯入的專案名稱列表
const wrongProjectNames = [
    "自動化排產系統", "供應商管理平台", "智慧倉儲系統", "客戶關係管理系統",
    "生產數據分析平台", "品質檢驗系統", "設備維護管理", "人力資源系統",
    "財務報表自動化", "訂單追蹤系統", "產品配方管理", "成本分析工具",
    "電子簽核系統", "知識庫平台"
];

async function deleteWrongProjects() {
    console.log('🗑️  開始刪除錯誤匯入的專案...\n');

    const querySnapshot = await getDocs(collection(db, 'projects'));
    let deletedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (wrongProjectNames.includes(data.name)) {
            await deleteDoc(doc(db, 'projects', docSnapshot.id));
            console.log(`🗑️  已刪除: ${data.name}`);
            deletedCount++;
        }
    }

    console.log(`\n✅ 已刪除 ${deletedCount} 筆錯誤資料\n`);
}

deleteWrongProjects()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('錯誤:', error);
        process.exit(1);
    });
