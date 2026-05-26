import { h, defineComponent } from 'vue'
import type { IconSet } from 'vuetify'
import { aliases } from 'vuetify/iconsets/mdi-svg'
import {
  mdiMagnify,
  mdiMagnifyRemoveOutline,
  mdiAlertCircleOutline,
  mdiTimerAlertOutline,
  mdiDatabaseOutline,
  mdiCodeTags,
  mdiStar,
  mdiEyeOutline,
  mdiBugOutline,
  mdiScaleBalance,
  mdiSourceFork,
  mdiCalendarPlus,
  mdiCalendarEdit,
  mdiSourceCommit,
  mdiOpenInNew,
  mdiWeb,
  mdiCheck,
  mdiContentCopy,
  mdiArchiveOutline,
  mdiForumOutline,
  mdiBookOpenOutline,
  mdiPackageVariant,
} from '@mdi/js'

// Add new icons here as needed - this is the single place to register them.
const iconMap: Record<string, string> = {
  'mdi-magnify': mdiMagnify,
  'mdi-magnify-remove-outline': mdiMagnifyRemoveOutline,
  'mdi-alert-circle-outline': mdiAlertCircleOutline,
  'mdi-timer-alert-outline': mdiTimerAlertOutline,
  'mdi-database-outline': mdiDatabaseOutline,
  'mdi-code-tags': mdiCodeTags,
  'mdi-star': mdiStar,
  'mdi-eye-outline': mdiEyeOutline,
  'mdi-bug-outline': mdiBugOutline,
  'mdi-scale-balance': mdiScaleBalance,
  'mdi-source-fork': mdiSourceFork,
  'mdi-calendar-plus': mdiCalendarPlus,
  'mdi-calendar-edit': mdiCalendarEdit,
  'mdi-source-commit': mdiSourceCommit,
  'mdi-open-in-new': mdiOpenInNew,
  'mdi-web': mdiWeb,
  'mdi-check': mdiCheck,
  'mdi-content-copy': mdiContentCopy,
  'mdi-archive-outline': mdiArchiveOutline,
  'mdi-forum-outline': mdiForumOutline,
  'mdi-book-open-outline': mdiBookOpenOutline,
  'mdi-package-variant': mdiPackageVariant,
}

// Custom iconset: resolves 'mdi-*' names to SVG paths from @mdi/js.
// Falls back to the raw value so $-alias-resolved paths (Vuetify internals) pass through.
const mdi: IconSet = {
  component: defineComponent({
    props: {
      icon: { type: [String, Function, Object], required: true },
      tag: { type: String, required: true },
    },
    setup(props) {
      return () => {
        const path = iconMap[props.icon as string] ?? props.icon as string
        return h(props.tag, [
          h('svg', {
            class: 'v-icon__svg',
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            role: 'img',
            'aria-hidden': 'true',
          }, [h('path', { d: path })])
        ])
      }
    },
  })
}

const vuetifyOptions = {
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#7563DE',
          warning: '#ED6C02',
          success: '#2E7D32',
          error: '#C62828',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
}

export { vuetifyOptions }
