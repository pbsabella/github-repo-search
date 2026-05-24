import './assets/main.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { vuetifyOptions } from '@/plugins/vuetify'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify(vuetifyOptions)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
