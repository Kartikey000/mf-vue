<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/users">
        Go to User List
      </router-link>
      <router-link to="/add-user"> |
        Add New User
      </router-link>
    </nav>
    <router-view />
  </div>
</template>


<script>
export default {
  name: 'App',
  async created() {
    await this.$store.dispatch('fetchUsers');
  },

};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
