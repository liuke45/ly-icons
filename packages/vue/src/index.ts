import type { App, Component } from 'vue'
import * as icons from './components'

const LyVueIcons: Record<string, Component> = {
  ...icons,
}

export interface InstallOptions {
  /** @default `LyIcon` */
  prefix?: string
}
export default (app: App, { prefix = 'LyIcon' }: InstallOptions = {}) => {
  for (const [key, component] of Object.entries(LyVueIcons)) {
    app.component(prefix + key, component)
  }
}

export { LyVueIcons as icons }
export * from './components'
