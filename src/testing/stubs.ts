// Stubs for Vuetify components that require a VApp layout injection context.
// Use these when mounting a component in Vitest (jsdom) that contains VAppBar,
// VNavigationDrawer, or other layout-aware Vuetify components.
import { defineComponent } from 'vue'

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
