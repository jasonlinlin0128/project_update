<template>
  <div class="home min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-accent-purple text-white py-20 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-white opacity-10 transform -skew-y-6 scale-150"></div>
      <div class="relative z-10 max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
          Project Update Center
        </h1>
        <p class="text-xl md:text-2xl opacity-90 mb-10 font-light">
          Track progress, coordinate teams, and stay organized.
        </p>
        <router-link to="/admin" class="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-transform duration-300">
          Go to Dashboard
        </router-link>
      </div>
    </div>

    <!-- Navigation Cards -->
    <div class="container mx-auto px-4 py-16 -mt-10 relative z-20">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <!-- Project Card -->
        <div class="card p-8 text-center hover:border-primary-400 group cursor-pointer">
          <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-800">Projects</h3>
          <p class="text-gray-600 mb-6">View and manage ongoing project updates and statuses.</p>
        </div>

        <!-- Routine Card -->
        <div class="card p-8 text-center hover:border-secondary-400 group cursor-pointer">
          <div class="w-16 h-16 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-500 group-hover:text-white transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-800">Routines</h3>
          <p class="text-gray-600 mb-6">Check daily and weekly routine tasks and schedules.</p>
        </div>

        <!-- Forum Card -->
        <div class="card p-8 text-center hover:border-accent-purple group cursor-pointer">
          <div class="w-16 h-16 bg-purple-100 text-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-purple group-hover:text-white transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-800">Forums</h3>
          <p class="text-gray-600 mb-6">Discuss ideas and share updates with the team.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>
