import path from 'path'
import consola from 'consola'
import chalk from 'chalk'
import { build } from 'esbuild'
import GlobalsPlugin from 'esbuild-plugin-globals'
import vue from 'unplugin-vue/esbuild'
import fsExtra, { ensureDir } from 'fs-extra'
import { version } from '../package.json'
import { pathOutput, pathComponents, pathOutputEsm, pathOutputCjs, pathSrc, pathRoot } from './paths'
import type { BuildOptions, Format } from 'esbuild'
import readline from 'readline';


const { emptyDir } = fsExtra

const buildBundle = async () => {
  const vueFileNames = fsExtra.readdirSync(pathComponents);
  const vueFilePaths = vueFileNames.map(item => {
    return `${path.resolve(pathComponents, item)}`;
  });
  const componentsFile = path.resolve(pathSrc, 'components.ts')
  const indexFilepaths = path.resolve(pathSrc, 'index.ts')

  const getBuildOptions = (format: Format) => {
    const options: BuildOptions = {
      entryPoints: [...indexFilepaths],
      target: 'es2018',
      platform: 'neutral',
      plugins: [
        vue({
          isProduction: true,
        }),
      ],
      bundle: false,
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
      options.globalName = 'lyIconsVue'
    } else {
      // options.external = ['vue']
    }

    return options
  }
  function reWriteComponents() {
    return new Promise((resolve, reject) => {
      const lineStringArray: string[] = [];
      const compPath = path.resolve(pathRoot, 'dist/components.js');
      let rl = readline.createInterface({
        input: fsExtra.createReadStream(compPath)
      })

      rl.on('line', line => {
        lineStringArray.push(line.replaceAll('.vue', '.js'));
      })
      rl.on('close', () => {
        fsExtra.writeFileSync(compPath, lineStringArray.join('\n'));
        resolve(true);
      })
    })
  }
  async function generateComponentListJson() {
    const compList = await import('dist/components.js');
    const compListJson = JSON.stringify({
      list: Object.keys(compList)
    });
    await ensureDir(path.resolve(pathRoot, 'dist/json'));
    fsExtra.writeFileSync(path.resolve(pathRoot, 'dist/json/components.json'), compListJson);
  }
  const doBuild = async (minify: boolean) => {
    await Promise.all([
      build({
        ...getBuildOptions('esm'),
        entryPoints: vueFilePaths,
        bundle: true,
        external: ['vue'],
        entryNames: `components/[name]${minify ? '.min' : ''}`,
        minify: true,
        sourcemap: minify,
      }),
      build({
        ...getBuildOptions('esm'),
        entryPoints: [indexFilepaths],
        entryNames: `[name]${minify ? '.min' : ''}`,
        minify,
        sourcemap: minify,
      }),
      build({
        ...getBuildOptions('esm'),
        entryPoints: [componentsFile],
        entryNames: `[name]${minify ? '.min' : ''}`,
        minify,
        sourcemap: minify,
      }),
      build({
        ...getBuildOptions('esm'),
        entryPoints: [indexFilepaths],
        entryNames: `[name].bundle${minify ? '.min' : ''}`,
        bundle: true,
        external: ['vue'],
        platform: 'node',
        minify: true,
        sourcemap: false,
      }),
      // build({
      //   ...getBuildOptions('iife'),
      //   entryNames: `[name].iife${minify ? '.min' : ''}`,
      //   minify,
      //   sourcemap: minify,
      // }),

    ])
    await reWriteComponents();
    await generateComponentListJson();
  }

  return Promise.all([
    // doBuild(true),
    doBuild(false),
  ])
}


consola.info(chalk.blue('cleaning dist...'))
await emptyDir(pathOutput);
consola.info(chalk.blue('building...'))
await buildBundle()
