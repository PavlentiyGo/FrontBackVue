import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ProfilePage from '../views/ProfilePage.vue' // Импортируем новый компонент

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/profile', // Новый маршрут
    name: 'Profile', // Имя маршрута
    component: ProfilePage // Компонент для отображения
  },
  // Можно добавить другие маршруты здесь
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router