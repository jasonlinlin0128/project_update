<template>
  <div class="relative inline-block">
    <button 
      @click="share" 
      class="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
      :title="buttonTitle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>

    <!-- Success Toast -->
    <div v-if="showToast" class="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs whitespace-nowrap z-50 animate-fade-in">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShareButton',
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showToast: false,
      toastMessage: ''
    }
  },
  computed: {
    buttonTitle() {
      return '分享';
    },
    shareUrl() {
      return this.url || window.location.href;
    }
  },
  methods: {
    async share() {
      const shareData = {
        title: this.title || '專案動態儀表板',
        text: this.text || '查看專案進度',
        url: this.shareUrl
      };

      // Check if Web Share API is available (mostly mobile)
      if (navigator.share && this.isMobile()) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      } else {
        // Fallback: copy to clipboard
        await this.copyToClipboard(this.shareUrl);
      }
    },
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToastMessage('連結已複製！');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.showToastMessage('連結已複製！');
        } catch (execErr) {
          console.error('Copy failed:', execErr);
          this.showToastMessage('複製失敗');
        }
        document.body.removeChild(textArea);
      }
    },
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
