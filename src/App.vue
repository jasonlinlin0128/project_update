<template>
  <div>
    <h1>公司專案動態儀表板</h1>
    <ProjectTable/>
  </div>
</template>

<script>
import ProjectTable from './components/ProjectTable.vue'

export default {
  name: 'App',
  components:{
     ProjectTable 
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
