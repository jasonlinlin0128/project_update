import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// 您的真實資料定義
const realRoutines = [
    { title: '掃地', frequency: '每日', assignee: '行政人員', status: '正常' },
    { title: '泡茶', frequency: '每日', assignee: '行政人員', status: '正常' },
    { title: '倒垃圾', frequency: '每週二、五', assignee: '清潔人員', status: '正常' }
];

const realForums = [
    { name: '中小企業AI論壇', date: '2024-03-15', role: '參與者', speaker: '多位講者', link: '' }
];

const realEvents = [
    { name: 'AI年會', date: '2024-05-20', location: '台北國際會議中心', organizer: '台灣AI協會' },
    { name: 'Computex', date: '2024-06-04', location: '南港展覽館', organizer: 'TAITRA' }
];

const realCoordination = [
    { name: 'Dynabook', contact: '業務經理', status: '接洽中' },
    { name: '超數科技', contact: '技術總監', status: '接洽中' }
];

// 智能新增：檢查資料是否已存在，避免重複
async function addIfNotExists(collectionName, data, uniqueField) {
    const q = query(collection(db, collectionName), where(uniqueField, '==', data[uniqueField]));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        await addDoc(collection(db, collectionName), data);
        console.log(`✅ 新增 ${collectionName}: ${data[uniqueField]}`);
        return true;
    } else {
        console.log(`ℹ️  已存在 ${collectionName}: ${data[uniqueField]}，跳過`);
        return false;
    }
}

export async function seedRealData() {
    console.log('🌱 開始智能資料補充（保留現有資料）...');

    let addedCount = 0;
    let skippedCount = 0;

    try {
        // 處理例行公事
        console.log('\n📋 檢查例行公事...');
        for (const item of realRoutines) {
            const added = await addIfNotExists('routines', item, 'title');
            added ? addedCount++ : skippedCount++;
        }

        // 處理論壇
        console.log('\n💬 檢查論壇/分享會...');
        for (const item of realForums) {
            const added = await addIfNotExists('forums', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        // 處理活動
        console.log('\n🎉 檢查活動參與...');
        for (const item of realEvents) {
            const added = await addIfNotExists('events', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        // 處理活動接洽
        console.log('\n🤝 檢查活動接洽...');
        for (const item of realCoordination) {
            const added = await addIfNotExists('coordination', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        console.log(`\n✅ 資料補充完成！新增: ${addedCount} 筆，跳過(已存在): ${skippedCount} 筆`);
    } catch (error) {
        console.error('❌ 資料補充錯誤:', error);
    }
}
