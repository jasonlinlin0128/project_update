<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          管理員登入
        </h2>
      </div>
      
      <div class="mt-8 space-y-6">
        <!-- Google Login Button -->
        <button @click="loginWithGoogle" :disabled="isLoading" class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5 mr-2">
          <span v-if="isLoading">登入中...</span>
          <span v-else>使用 Google 帳號登入</span>
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">或使用 Email 登入</span>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="login">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required v-model="email" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required v-model="password" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password">
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" v-model="rememberMe" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              記住我（下次不用重新登入）
            </label>
          </div>

          <div>
            <button type="submit" :disabled="isLoading" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <span v-if="isLoading">登入中...</span>
              <span v-else>登入</span>
            </button>
          </div>
          
          <div v-if="error" class="text-red-500 text-center text-sm">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      isLoading: false,
      error: '',
      rememberMe: true // 預設勾選記住我
    }
  },
  methods: {
    async login() {
      this.isLoading = true;
      this.error = '';
      try {
        // 根據 rememberMe 設定持久化方式
        const persistence = this.rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push(this.$route.query.redirect || '/routines');
      } catch (err) {
        console.error(err);
        this.error = '登入失敗，請檢查 Email 和密碼。';
      } finally {
        this.isLoading = false;
      }
    },
    async loginWithGoogle() {
      this.isLoading = true;
      this.error = '';
      const provider = new GoogleAuthProvider();
      try {
        // 根據 rememberMe 設定持久化方式
        const persistence = this.rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        
        await signInWithPopup(auth, provider);
        this.$router.push(this.$route.query.redirect || '/routines');
      } catch (err) {
        console.error(err);
        this.error = 'Google 登入失敗: ' + err.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

