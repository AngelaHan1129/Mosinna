import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/UserUpload.vue'
import Report from '@/views/UserReport.vue'
import History from '@/views/UserHistory.vue'
import Notifi from '@/views/BackNotification.vue'
import RiskHistory from '@/views/RiskHistory.vue'
import Maintenance from '@/views/Maintenance.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '上傳影片',
    component: Home
  },
  {
    path: '/UserReport',
    name: '結果分析',
    component: Report
  },
  {
    path: '/UserHistory',
    name: '歷史紀錄',
    component: History
  },
  {
    path: '/Notification',
    name: '檢舉通報',
    component: Notifi
  },
  {
    path: '/RiskHistory',
    name: '風險檢測記錄',
    component: RiskHistory
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes:
    import.meta.env.VITE_IS_MAINTAIN === 'true'
      ? [
          {
            path: '/:pathMatch(.*)*',
            component: Maintenance
          }
        ]
      : routes
})

export default router
