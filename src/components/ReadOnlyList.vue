<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100">
      <h2 class="text-lg font-bold text-gray-800">{{ title }}</h2>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
            <th v-for="col in columns" :key="col.key" class="py-4 px-6">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="item in items" :key="item.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
            <td v-for="col in columns" :key="col.key" class="py-4 px-6">
              <!-- Status type with badge -->
              <span v-if="col.type === 'status'" :class="getStatusClass(item[col.key])" class="py-1 px-3 rounded-full text-xs font-bold inline-block min-w-[60px] text-center">
                {{ item[col.key] || '-' }}
              </span>
              <!-- Default text -->
              <span v-else :class="{ 'font-medium text-gray-800': col.key === columns[0].key }">
                {{ item[col.key] || '-' }}
              </span>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="columns.length" class="py-8 text-center text-gray-400">
              暫無資料
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReadOnlyList',
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true
    }
  },
  methods: {
    getStatusClass(status) {
      const statusMap = {
        '正常': 'bg-green-100 text-green-700',
        '異常': 'bg-red-100 text-red-700',
        '已完成': 'bg-green-100 text-green-700',
        '進行中': 'bg-blue-100 text-blue-700',
        '接洽中': 'bg-yellow-100 text-yellow-700',
        '已接洽': 'bg-blue-100 text-blue-700',
        '待處理': 'bg-orange-100 text-orange-700'
      };
      return statusMap[status] || 'bg-gray-100 text-gray-600';
    }
  }
}
</script>
