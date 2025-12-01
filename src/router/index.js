import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GuessSong from '../views/GuessSong.vue'
import LibrarySelect from '../views/LibrarySelect.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/library-select',
    name: 'LibrarySelect',
    component: LibrarySelect
  },
  {
    path: '/guess-song',
    name: 'GuessSong',
    component: GuessSong
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


