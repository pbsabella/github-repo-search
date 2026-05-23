import { defineComponent, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'

const vuetify = createVuetify()

// Stubs for Vuetify components that require a VApp layout injection context.
// Use these when mounting a component in Vitest (jsdom) that contains VAppBar,
// VNavigationDrawer, or other layout-aware Vuetify components.
export const layoutStubs = {
  VAppBar: {
    template: '<header><slot name="prepend"/><slot/><slot name="append"/></header>',
  },
  VAppBarTitle: { template: '<span><slot/></span>' },
  VIcon: { template: '<i/>' },
  VChip: defineComponent({
    inheritAttrs: false,
    props: ['color', 'size', 'variant', 'prependIcon'],
    template: '<span v-bind="$attrs" :data-color="color"><slot/></span>',
  }),
}

type MountOptions = Parameters<typeof mount>[1]

export function mountWithPlugins(component: Component, options: MountOptions = {}) {
  setActivePinia(createPinia())

  const g = options?.global ?? {}

  return mount(component, {
    ...options,
    global: {
      ...g,
      plugins: [
        vuetify,
        ...(g.plugins ?? []),
      ],
      stubs: {
        ...layoutStubs,
        ...g.stubs,
      },
    },
  })
}
