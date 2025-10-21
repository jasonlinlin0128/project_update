import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectTable from '@/components/ProjectTable.vue'

// Mock Firebase
vi.mock('@/firebase', () => ({
  db: {},
  realtimeDb: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] }))
}))

describe('ProjectTable.vue', () => {
  beforeEach(() => {
    // 为每个测试创建新的 Pinia 实例
    setActivePinia(createPinia())
  })

  it('renders table headers correctly', () => {
    const wrapper = mount(ProjectTable)

    // 检查表头是否正确渲染
    const headers = wrapper.findAll('th')
    expect(headers.length).toBe(7) // 应该有 7 个表头

    // 验证表头内容
    expect(headers[0].text()).toBe('專案名稱')
    expect(headers[1].text()).toBe('負責部門')
  })

  it('renders table element', () => {
    const wrapper = mount(ProjectTable)

    // 检查是否渲染了 table 元素
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('has correct data structure', () => {
    const wrapper = mount(ProjectTable)

    // 检查组件数据结构
    expect(wrapper.vm.projects).toBeInstanceOf(Array)
    expect(wrapper.vm.projects.length).toBe(0) // 初始为空
  })
})
