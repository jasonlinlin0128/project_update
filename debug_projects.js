// 調試腳本 - 列出所有專案資料
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function listAllProjects() {
    console.log('🔍 查詢 Firestore 中的所有專案...\n');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));

        console.log(`📊 總共找到 ${querySnapshot.docs.length} 筆資料\n`);
        console.log('='.repeat(80));

        querySnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n【專案 #${index + 1}】`);
            console.log(`ID: ${doc.id}`);
            console.log(`欄位清單:`);

            // 列出所有欄位
            Object.keys(data).sort().forEach(key => {
                const value = data[key];
                const displayValue = typeof value === 'string' && value.length > 50
                    ? value.substring(0, 50) + '...'
                    : value;
                console.log(`  - ${key}: ${JSON.stringify(displayValue)}`);
            });

            console.log('-'.repeat(80));
        });

    } catch (error) {
        console.error('❌ 查詢失敗:', error);
        throw error;
    }
}

listAllProjects()
    .then(() => {
        console.log('\n✅ 查詢完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 發生錯誤:', error);
        process.exit(1);
    });
