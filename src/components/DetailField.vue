<template>
  <div class="space-y-2">
    <label class="text-xs text-gray-500 font-medium">{{ label }}</label>
    <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ value }}</p>
  </div>
</template>

<script>
export default {
  name: 'DetailField',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>
