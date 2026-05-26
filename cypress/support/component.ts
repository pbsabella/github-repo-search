import './commands'
import './component.css'
import '../../src/assets/main.css'
import '@testing-library/cypress/add-commands'
import { mount } from 'cypress/vue'
import { defineComponent, h } from 'vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { VApp } from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { vuetifyOptions } from '@/plugins/vuetify'
import 'vuetify/styles'
import { routes } from '@/router'

const vuetify = createVuetify({
  ...vuetifyOptions,
  components,
  directives,
  defaults: {
    VDialog: { transition: false },
  },
})

Cypress.Commands.add('mount', (component, options = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)

  // `router` is a custom extension not in MountingOptions types
  const opts = options as typeof options & { router?: Router }

  opts.global = opts.global || {}
  opts.global.plugins = [vuetify, pinia, ...(opts.global.plugins || [])]

  if (!opts.router) {
    opts.router = createRouter({
      routes,
      history: createMemoryHistory(),
    })
  }

  opts.global.plugins.push({
    install(app: App) {
      app.use(opts.router!)
    },
  })

  const wrapped = defineComponent({
    render() {
      return h(VApp, null, { default: () => h(component, { ...this.$attrs }, this.$slots) })
    },
  })

  return mount(wrapped, options)
})
