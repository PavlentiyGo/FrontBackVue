<template>
  <div class="profile-page">
    <h1> Мой Профиль</h1>
    <div class="profile-content">
      <p>Добро пожаловать в ваш профиль!</p>
      <p>Здесь вы можете управлять настройками аккаунта и просматривать историю палитр.</p>
      <router-link to="/" class="back-to-home">← На главную</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.profile-content {
  text-align: center;
}

.back-to-home {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-to-home:hover {
  background-color: #5a6268;
}
</style>