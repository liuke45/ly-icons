import path from 'path'
import consola from 'consola'
import chalk from 'chalk'
import { build } from 'esbuild'
import GlobalsPlugin from 'esbuild-plugin-globals'
import vuePlugin from 'esbuild-vue'
import fsExtra from 'fs-extra'
import { version } from '../package.json'
import { pathOutput, pathSrc } from './paths'
import type { BuildOptions, Format } from 'esbuild'

const { emptyDir } = fsExtra

const buildBundle = async () => {
  const getBuildOptions = (format: Format) => {
    const options: BuildOptions = {
      entryPoints: [path.resolve(pathSrc, 'index.ts')],
      target: 'es2018',
      platform: 'neutral',
      plugins: [
        vuePlugin({
          workers: false,
        }),
      ],
      bundle: true,
      format,
      minifySyntax: true,
      banner: {
        js: `/*! Ly Icons Vue v${version} */\n`,
      },
      outdir: pathOutput,
    }
    if (format === 'iife') {
      options.plugins!.push(
        GlobalsPlugin({
          vue: 'Vue',
        })
      )
      options.globalName = 'LyIconsVue'
    } else {
      options.external = ['vue']
    }

    return options
  }
  const doBuild = async (minify: boolean) => {
    await Promise.all([
      build({
        ...getBuildOptions('esm'),
        entryNames: `[name]${minify ? '.min' : ''}`,
        minify,
        sourcemap: minify,
      }),
      // build({
      //   ...getBuildOptions('iife'),
      //   entryNames: `[name].iife${minify ? '.min' : ''}`,
      //   minify,
      //   sourcemap: minify,
      // }),
      // build({
      //   ...getBuildOptions('cjs'),
      //   entryNames: `[name]${minify ? '.min' : ''}`,
      //   outExtension: { '.js': '.cjs' },
      //   minify,
      //   sourcemap: minify,
      // }),
    ])
  }

  return Promise.all([
    // doBuild(true),
    doBuild(false),
  ])
}

consola.info(chalk.blue('cleaning dist...'))
await emptyDir(pathOutput)
consola.info(chalk.blue('building...'))
await buildBundle()
