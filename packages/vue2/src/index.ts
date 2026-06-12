import * as icons from './components'

export interface InstallOptions {
  /** @default `LyIcon` */
  prefix?: string
}
export default (app: any, { prefix = 'LyIcon' }: InstallOptions = {}) => {
  for (const [key, component] of Object.entries(icons)) {
    component.name = prefix  + key;
    app.component(component.name, component)
  }
}

export { icons }
export * from './components'
