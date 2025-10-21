<template>
  <div class="flex justify-center items-center" :class="containerClass">
    <i class="fas fa-spinner fa-spin" :class="iconClass"></i>
    <span v-if="text" class="ml-3" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'blue'
  }
})

const iconClass = computed(() => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    gray: 'text-gray-500'
  }

  return [sizeClasses[props.size], colorClasses[props.color]]
})

const textClass = computed(() => {
  return props.size === 'small' ? 'text-sm' : 'text-base'
})

const containerClass = computed(() => {
  return props.size === 'large' ? 'py-12' : 'py-6'
})
</script>
