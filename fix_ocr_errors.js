// 修正 OCR 錯誤
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

async function fixOCRErrors() {
    console.log('🔧 修正 OCR 錯誤...\n');

    const querySnapshot = await getDocs(collection(db, 'projects'));
    let fixedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const updates = {};

        // 修正：胡挺理 → 胡協理
        if (data.department && data.department.includes('胡挺理')) {
            updates.department = data.department.replace('胡挺理', '胡協理');
            console.log(`📝 修正部門: ${data.name}`);
        }
        if (data.proposalContact && data.proposalContact.includes('胡挺理')) {
            updates.proposalContact = data.proposalContact.replace('胡挺理', '胡協理');
        }

        // 修正：壓鑄機爐座型 → 壓鑄機觸控型
        if (data.name === '壓鑄機爐座型工業電腦') {
            updates.name = '壓鑄機觸控型工業電腦';
            console.log(`📝 修正專案名稱: ${data.name} → 壓鑄機觸控型工業電腦`);
        }

        // 如果有需要更新的欄位
        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'projects', docSnapshot.id), updates);
            fixedCount++;
        }
    }

    console.log(`\n✅ 已修正 ${fixedCount} 筆資料的 OCR 錯誤\n`);
}

fixOCRErrors()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 錯誤:', error);
        process.exit(1);
    });
