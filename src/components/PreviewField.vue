<template>
  <div :class="fullWidth ? 'col-span-2' : ''">
    <div class="bg-gray-50 rounded-lg p-3">
      <p class="text-xs text-gray-500 mb-1">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </p>
      <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ value || '-' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PreviewField',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  }
}
</script>
