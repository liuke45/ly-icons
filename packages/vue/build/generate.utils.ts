import path from 'path'
import camelcase from 'camelcase'
import glob from 'fast-glob'
import { format } from 'prettier'
import findWorkspaceDir from '@pnpm/find-workspace-dir'
import findWorkspacePackages from '@pnpm/find-workspace-packages'

import type { BuiltInParserName } from 'prettier'
import type { Style } from './processSvg'
const defaultStyle = 'stroke'

export const getSvgFiles = async () => {
  const pkgs = await // @ts-expect-error
    (findWorkspacePackages.default as typeof findWorkspacePackages)(
      // @ts-expect-error
      (await findWorkspaceDir.default(process.cwd()))!
    )
  const pkg = pkgs.find((pkg) => pkg.manifest.name === '@ly/icons-svg')!

  return glob('*.svg', { cwd: path.resolve(pkg.dir, 'assets'), absolute: true })
}

export const getName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '')
  const componentName = camelcase(filename.replace('.vue', ''), { pascalCase: true })
  const nameSlices = filename.split('-')
  const style = nameSlices[nameSlices.length - 1]
  const colors = style === 'color'
  return {
    filename,
    componentName,
    style: (style === 'fill' || style === 'stroke'
      ? style
      : defaultStyle) as Style,
    colors,
  }
}

export const formatCode = (
  code: string,
  parser: BuiltInParserName = 'typescript'
) =>
  format(code, {
    parser,
    semi: false,
    singleQuote: true,
  })

export const attrsToString = (attrs: Record<string, any>, style: string) => {
  return Object.keys(attrs)
    .map((key) => {
      // should distinguish fill or stroke
      if (key === 'width' || key === 'height' || key === style) {
        return key + '={' + attrs[key] + '}'
      }
      return key + '="' + attrs[key] + '"'
    })
    .join(' ')
}
