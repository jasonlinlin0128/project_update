import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";

// 從舊系統完整提取的資料（根據用戶反饋補充）
const legacyData = {
    // 分享會/論壇 (根據用戶反饋：缺少2025-06-04 ChatGPT教學)
    forums: [
        {
            name: 'AI應用工作坊(加工部、管理部)',
            date: '2025-09-25',
            role: '主辦',
            speaker: '內部',
            link: ''
        },
        {
            name: '每月AI分享會-2025台灣富士軟片資訊品牌日心得分享',
            date: '2025-08-26',
            role: '主辦',
            speaker: '內部分享',
            link: ''
        },
        {
            name: 'ChatGPT教學',
            date: '2025-06-04',  // 用戶指出的正確日期
            role: '主辦',
            speaker: '內部講師',
            link: ''
        },
        {
            name: '中小企業AI論壇',
            date: '2024-03-15',
            role: '參與者',
            speaker: '多位講者',
            link: ''
        }
    ],

    // 活動參與 (Events - 用戶指出還缺很多活動，保留已知的)
    events: [
        {
            name: 'Computex 2025',
            date: '2025-05-21',
            location: '南港展覽館',
            organizer: '外部活動',
            notes: '全球指標性的資通訊產業大展，今年 AI 硬體與邊緣運算為最大亮點。主要學習與收穫：NVIDIA 與 AMD 最新的 AI 晶片效能比較。工業電腦 (IPC) 結合邊緣 AI 的解決方案。'
        },
        {
            name: '2025 台灣 AI 年會',
            date: '2025-05-24',
            location: '台北國際會議中心',
            organizer: '外部活動',
            notes: ''
        },
        {
            name: 'AI年會',
            date: '2024-05-20',
            location: '台北國際會議中心',
            organizer: '台灣AI協會'
        },
        {
            name: 'Computex',
            date: '2024-06-04',
            location: '南港展覽館',
            organizer: 'TAITRA'
        }
    ],

    // 接洽企業 (Coordination - 用戶指出缺少SEA，且超數科技有重複)
    coordination: [
        {
            name: 'SEA - Business Development Representative Google Cloud Platform & Google Workspace',
            contact: 'SEA Team',
            date: '',
            status: '已接洽',
            notes: 'Google Cloud Platform & Google Workspace 業務開發'
        },
        {
            name: '超數科技HyperData',
            contact: '張鈞程',
            date: '2025-07-07',
            status: '已接洽',
            notes: '了解公司目前AI規劃應用與挑戰。'
        },
        // 移除重複的"超數科技"，只保留"超數科技HyperData"
        {
            name: '零次方',
            contact: '林書凡',
            date: '2025-07-24',
            status: '已接洽',
            notes: 'Porter的朋友-分享 AI 導入各種甲方經驗。'
        },
        {
            name: '台灣富士軟片',
            contact: '劉育杉',
            date: '2025-07-25',
            status: '已接洽',
            notes: '分享台灣富士在RPA、無紙化與高效文件管理、ESG永續發展方案、文件簽核與ISO文管Solution。'
        },
        {
            name: 'Dynabook',
            contact: '業務經理',
            status: '接洽中',
            date: '',
            notes: ''
        }
    ],

    // 例行公事 (保留)
    routines: [
        { title: '掃地', frequency: '每日', assignee: '行政人員', status: '正常' },
        { title: '泡茶', frequency: '每日', assignee: '行政人員', status: '正常' },
        { title: '倒垃圾', frequency: '每週二、五', assignee: '清潔人員', status: '正常' }
    ]
};

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

// 移除重複的"超數科技"條目
async function removeDuplicateCoordination() {
    try {
        const q = query(collection(db, 'coordination'), where('name', '==', '超數科技'));
        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
            console.log('🗑️  移除重複項目: 超數科技');
        }
    } catch (error) {
        console.error('移除重複項目時發生錯誤:', error);
    }
}

export async function migrateLegacyData() {
    console.log('🔄 開始遷移舊系統資料（修正版）...');
    console.log('📝 修正：ChatGPT教學日期、新增SEA、移除重複的超數科技');

    let addedCount = 0;
    let skippedCount = 0;

    try {
        // 先移除重複的"超數科技"
        await removeDuplicateCoordination();

        // 處理分享會/論壇
        console.log('\n💬 遷移分享會/論壇資料...');
        for (const item of legacyData.forums) {
            const added = await addIfNotExists('forums', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        // 處理活動參與
        console.log('\n🎉 遷移活動參與資料...');
        for (const item of legacyData.events) {
            const added = await addIfNotExists('events', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        // 處理接洽企業
        console.log('\n🤝 遷移接洽企業資料...');
        for (const item of legacyData.coordination) {
            const added = await addIfNotExists('coordination', item, 'name');
            added ? addedCount++ : skippedCount++;
        }

        // 處理例行公事
        console.log('\n📋 檢查例行公事...');
        for (const item of legacyData.routines) {
            const added = await addIfNotExists('routines', item, 'title');
            added ? addedCount++ : skippedCount++;
        }

        console.log(`\n✅ 舊資料遷移完成！`);
        console.log(`   新增: ${addedCount} 筆`);
        console.log(`   跳過(已存在): ${skippedCount} 筆`);
        console.log('\n📊 遷移資料摘要:');
        console.log(`   - 分享會/論壇: ${legacyData.forums.length} 筆 (含修正日期的ChatGPT教學)`);
        console.log(`   - 活動參與: ${legacyData.events.length} 筆`);
        console.log(`   - 接洽企業: ${legacyData.coordination.length} 筆 (新增SEA，移除重複超數科技)`);
        console.log(`   - 例行公事: ${legacyData.routines.length} 筆`);
    } catch (error) {
        console.error('❌ 資料遷移錯誤:', error);
    }
}
