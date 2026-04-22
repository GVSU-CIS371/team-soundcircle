// main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.ts' 
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1DB954', // Spotify Green
          secondary: '#191414', // Spotify Black/Dark
          accent: '#FFFFFF',
          background: '#3c3d3c',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(router) 
app.use(vuetify)
app.mount('#app')
