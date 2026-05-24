import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetifyOptions = {
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          warning: '#FFC107',
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
