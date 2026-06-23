import path from 'path'
import fsPromise from 'fs/promises'
import fsExtra from 'fs-extra'
import consola from 'consola'
import chalk from 'chalk'
import { pathComponents, pathSrc } from './paths'
import { processSvg } from './processSvg'
import { getAttrs, getComponentIndex, getComponents, getElementCode } from './template'
import {
  attrsToString,
  getSvgFiles,
  formatCode,
  getName,
} from './generate.utils'

const { emptyDir, ensureDir, readdir } = fsExtra
const { readFile, writeFile } = fsPromise


const transformToVueComponent = async (file: string) => {
  const content = await readFile(file, 'utf-8')
  const { filename, componentName, style, colors } = getName(file)

  const svgData = await processSvg(content, style, colors)
  if (!svgData) {
    console.log(chalk.red(`vue: svg文件 ${filename} 解析失败`));
    return;
  }
  const component = getElementCode(
    componentName,
    attrsToString(getAttrs(style, svgData), style),
    svgData
  )
  const vue = formatCode(component, 'vue')
  // 等待组件文件写入完成，避免生成入口时读取到空目录。
  await writeFile(path.resolve(pathComponents, `${filename}.vue`), vue, 'utf-8')
}

const generateEntry = async () => {
  // 根据当前实时生成的组件文件生成files文件列表
  const files = await readdir(pathComponents);


  const imports: string[] = [];
  const exports: string[] = [];
  const components: string[] = [];

  files.forEach(item => {
    const { filename, componentName } = getName(item)
    imports.push(`import ${componentName} from './components/${filename}'`);
    exports.push(`export { default as ${componentName} } from './components/${filename}'`);
    components.push(componentName);
  })

  const iconsContent = getComponents({ imports, exports, components }) + `\n`;
  // components.ts文件
  // 等待入口文件写入完成，保证后续构建读取到完整内容。
  await writeFile(
    path.resolve(pathSrc, './components.ts'),
    iconsContent,
  );
}

const judgeFileName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '');

  const nameChunks = filename.split('-');
  const reg = /^\w+$/;
  const flag = nameChunks.every(chunk => reg.test(chunk));

  if (!flag) {
    console.log('vue不合法的名称', filename);
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
await Promise.all(files
  .map((file) => transformToVueComponent(file))) // 根据内容再次过滤了无用的图标
consola.info(chalk.blue('generating index files'))

consola.info(chalk.blue('generating entry file'))
await generateEntry()
