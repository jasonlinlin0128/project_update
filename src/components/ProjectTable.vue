<template>
  <table>
    <thead>
      <tr>
        <th>專案名稱</th>
        <th>負責部門</th>
        <th>開始時間</th>
        <th>截止日期</th>
        <th>優先級</th>
        <th>進度</th>
        <th>狀態</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in projects" :key="p.id">
        <td>{{ p.name }}</td>
        <td>{{ p.department }}</td>
        <td>{{ p.startTime }}</td>
        <td>{{ p.dueDate }}</td>
        <td>{{ p.priority }}</td>
        <td>
          <div style="min-width:60px">
            <div :style="{width: p.progress + '%', background:'#34d399',height:'8px'}"></div>
          </div>{{ p.progress }}%
        </td>
        <td>{{ p.status }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import { db } from '../firebase'
import { collection, getDocs } from "firebase/firestore";
export default {
  data(){ return { projects:[] }},
  async mounted(){
    const querySnapshot = await getDocs(collection(db, "projects"));
    this.projects = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }
}
</script>
