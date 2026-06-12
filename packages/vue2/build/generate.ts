import path from 'path'
import fsPromise from 'fs/promises'
import fsExtra from 'fs-extra'
import consola from 'consola'
import chalk from 'chalk'
import { pathComponents } from './paths'
import { getAttrs, getElementCode } from './template'
import {
  attrsToString,
  getSvgFiles,
  formatCode,
  getName,
} from '../../vue/build/generate.utils'
import { processSvg } from '../../vue/build/processSvg'
import type { Style } from '../../vue/build/processSvg'

const { emptyDir, ensureDir, readdir } = fsExtra
const { readFile, writeFile } = fsPromise

const transformToVueComponent = async (file: Style) => {
  const content = await readFile(file, 'utf-8')
  const { filename, componentName, style, colors } = getName(file)

  const svgData = await processSvg(content, style, colors)
  if (!svgData) {
    console.log(chalk.red(`vue2: svg文件 ${filename} 解析失败`));
    return;
  }

  const component = getElementCode(
    componentName,
    attrsToString(getAttrs(style, svgData), style),
    svgData
  )
  const vue = formatCode(component, 'vue')
  writeFile(path.resolve(pathComponents, `${filename}.vue`), vue, 'utf-8')
}

const generateEntry = async () => {
  // 根据当前实时生成的组件文件生成files文件列表
  const files = (await readdir(pathComponents)).map(file => file.split('.')[0]);

  const indexFile: string[] = []
  files.forEach((file) => {
    const { filename, componentName } = getName(file)
    indexFile.push(`import ${componentName} from './${filename}.vue'`)
  })
  indexFile.push('export {')
  files.forEach((file) => {
    const { componentName } = getName(file)
    indexFile.push(`${componentName},`)
  })
  indexFile.push('}')
  const code = formatCode(indexFile.join('\n'))

  await writeFile(path.resolve(pathComponents, 'index.ts'), code, 'utf-8')
}


const judgeFileName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '');

  const nameChunks = filename.split('-');
  const reg = /^\w+$/;
  const flag = nameChunks.every(chunk => reg.test(chunk));

  if (!flag) {
    console.log('vue2不合法的名称', filename);
  }

  return flag;
}

consola.info(chalk.blue('generating vue components'))
await ensureDir(pathComponents)
await emptyDir(pathComponents)
let files = await getSvgFiles()
// 过滤掉名称不合格的
files = files.filter(judgeFileName) 

consola.info(chalk.blue('generating vue files'))
await Promise.all(files.map((file) => transformToVueComponent(file)))

consola.info(chalk.blue('generating entry file'))
await generateEntry()
