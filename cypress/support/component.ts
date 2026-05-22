import './commands'
import { mount } from 'cypress/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../../src/router'

Cypress.Commands.add('mount', (component, options = {}) => {
  setActivePinia(createPinia())

  options.global = options.global || {}
  options.global.plugins = options.global.plugins || []

  if (!options.router) {
    options.router = createRouter({
      routes,
      history: createMemoryHistory(),
    })
  }

  options.global.plugins.push({
    install(app) {
      app.use(options.router)
    },
  })

  return mount(component, options)
})
