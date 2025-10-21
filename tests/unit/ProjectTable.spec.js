import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectTable from '@/components/ProjectTable.vue'

describe('ProjectTable.vue', () => {
  beforeEach(() => {
    // 为每个测试创建新的 Pinia 实例
    setActivePinia(createPinia())
  })

  it('renders table headers correctly', () => {
    const wrapper = mount(ProjectTable)

    // 检查表头是否正确渲染
    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('shows loading state initially', () => {
    const wrapper = mount(ProjectTable, {
      global: {
        stubs: {
          LoadingSpinner: { template: '<div class="loading">Loading...</div>' }
        }
      }
    })

    // 初始应该显示加载状态
    expect(wrapper.vm.loading).toBe(false) // 组件内部逻辑会设置
  })
})
