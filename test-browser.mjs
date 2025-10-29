// 瀏覽器自動化測試腳本
import http from 'http';

console.log('🧪 開始自動化測試應用程序...\n');
console.log('═══════════════════════════════════════════\n');

// 測試單個頁面
function testPage(path, name) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:8080${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200;
        const icon = success ? '✅' : '❌';

        console.log(`${icon} ${name}`);
        console.log(`   路徑: ${path}`);
        console.log(`   狀態: HTTP ${res.statusCode}`);

        if (success) {
          // 檢查關鍵內容
          const hasVue = data.includes('vue') || data.includes('Vue');
          const hasTitle = data.includes('專案管理系統');
          const hasVite = data.includes('vite');
          const hasRouter = data.includes('router');

          console.log(`   內容檢查:`);
          console.log(`     • Vue 應用: ${hasVue ? '✅' : '❌'}`);
          console.log(`     • Vite 開發: ${hasVite ? '✅' : '❌'}`);
          console.log(`     • 頁面標題: ${hasTitle ? '✅' : '❌'}`);
          console.log(`     • 路由配置: ${hasRouter ? '✅' : '❌'}`);

          // 統計數據大小
          const sizeKB = (data.length / 1024).toFixed(2);
          console.log(`   頁面大小: ${sizeKB} KB`);
        }

        console.log('');
        resolve(success);
      });
    }).on('error', (err) => {
      console.log(`❌ ${name}`);
      console.log(`   錯誤: ${err.message}\n`);
      resolve(false);
    });
  });
}

async function runTests() {
  const tests = [
    { path: '/', name: '首頁 (HomeView)' },
    { path: '/projects', name: 'AI 專案管理 (ProjectsView)' },
    { path: '/tasks', name: '例行任務儀表板 (TasksView) ✨' },
    { path: '/sharing', name: '分享會管理 (SharingView) ✨' },
    { path: '/events', name: '活動參與管理 (EventsView) ✨' },
    { path: '/contacts', name: '企業接洽管理 (ContactsView) ✨' },
    { path: '/diagnostics', name: 'Firebase 診斷頁面' },
  ];

  console.log('📊 測試所有儀表板頁面:\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testPage(test.path, test.name);
    if (result) passed++;
    else failed++;
  }

  console.log('═══════════════════════════════════════════\n');
  console.log('📈 測試結果統計:\n');
  console.log(`   ✅ 通過: ${passed} 個頁面`);
  console.log(`   ❌ 失敗: ${failed} 個頁面`);
  console.log(`   📊 成功率: ${((passed / tests.length) * 100).toFixed(1)}%`);

  console.log('\n═══════════════════════════════════════════\n');
  console.log('🌐 開發伺服器訪問方式:\n');
  console.log('   • http://127.0.0.1:8080/');
  console.log('   • http://localhost:8080/');

  console.log('\n📱 可用的儀表板頁面:\n');
  tests.forEach(test => {
    console.log(`   • ${test.name}: http://127.0.0.1:8080${test.path}`);
  });

  console.log('\n✨ 測試完成！');
  console.log('═══════════════════════════════════════════\n');
}

runTests().catch(console.error);
