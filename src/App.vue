<template>
  <div id="app">
    <header class="app-header">
      <h1>Генератор цветовых палитр</h1>
      <p>Создавайте, управляйте и анализируйте цветовые схемы</p>
    </header>
    <nav class="main-nav">
      <router-link to="/" class="nav-link">Главная</router-link>
      <router-link to="/profile" class="nav-link">Профиль</router-link>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
    <footer class="app-footer">
    </footer>
  </div>
</template>
<script>
export default {
  name: 'App'
}
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #007bff;
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.app-header p {
  opacity: 0.9;
  font-size: 1.1rem;
}


.main-nav {
  background-color: #34495e;
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #2c3e50;
}

.nav-link.router-link-active {
  background-color: #42b883;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>