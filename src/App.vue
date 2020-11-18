<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>
      <label for="msg">
        sender:
      </label>
      <input id="msg" type="text" v-model="message"/>
      <button type="button" @click="sendMessage">send</button>
    </div>
    <div>
      response: {{response}}
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
  name: 'App',
  data: () => ({
    message: '',
    response: ''
  }),
  mounted() {
    this.listenMessage()
  },
  methods: {
    listenMessage() {
      navigator.serviceWorker.addEventListener('message', evt => {
        this.response = evt.data
      })
    },
    sendMessage() {
      let message = this.message
      message = message.replace('吗', '').replace('?', '!').replace('？', '！')
      axios.post('/message', { title: 'ai chat', content: message })
    }
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
