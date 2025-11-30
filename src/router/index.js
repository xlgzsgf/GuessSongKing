import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GuessSong from '../views/GuessSong.vue'
import ArtistSelect from '../views/ArtistSelect.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/artist-select',
    name: 'ArtistSelect',
    component: ArtistSelect
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

