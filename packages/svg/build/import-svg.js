const { execFileSync } = require('child_process')
const { basename, extname, join, resolve } = require('path')
const { mkdir, readdir, readFile, rm, writeFile } = require('fs/promises')

const options = {
  zip: process.env.LY_ICONS_ZIP || '',
  source: process.env.LY_ICONS_SOURCE_DIR || '',
  outputDir: './assets',
  clear: 'true',
}

for (const arg of process.argv.slice(2)) {
  const normalizedArg = arg.replace(/^--/, '')
  const [param, value = ''] = normalizedArg.split('=')
  if (Object.prototype.hasOwnProperty.call(options, param)) {
    options[param] = value
  }
}

const outputDir = resolve(process.cwd(), options.outputDir)

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})

/** 导入本地 SVG 资源到构建资源目录。 */
async function main() {
  if (!options.zip && !options.source) {
    throw new Error('请通过 LY_ICONS_ZIP、LY_ICONS_SOURCE_DIR、--zip 或 --source 指定图标资源')
  }

  if (options.clear !== 'false') {
    await rm(outputDir, { recursive: true, force: true })
  }
  await mkdir(outputDir, { recursive: true })

  const files = options.zip
    ? await importFromZip(resolve(options.zip))
    : await importFromDir(resolve(options.source))

  if (!files.length) {
    throw new Error('没有找到可导入的 SVG 文件')
  }

  console.log(`Imported ${files.length} SVG icons to ${outputDir}`)
}

/** 从 zip 压缩包中读取并写入 SVG 文件。 */
async function importFromZip(zipPath) {
  const entries = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split('\n')
    .filter((entry) => extname(entry).toLowerCase() === '.svg')

  const importedFiles = []
  for (const entry of entries) {
    const filename = getSafeSvgFilename(entry)
    if (!filename) continue

    const content = execFileSync('unzip', ['-p', zipPath, entry], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20,
    })
    await writeFile(join(outputDir, filename), content, 'utf8')
    importedFiles.push(filename)
  }

  return importedFiles
}

/** 从本地目录中读取并写入 SVG 文件。 */
async function importFromDir(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true })
  const importedFiles = []

  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.svg') {
      continue
    }

    const filename = getSafeSvgFilename(entry.name)
    if (!filename) continue

    const content = await readFile(join(sourceDir, entry.name), 'utf8')
    await writeFile(join(outputDir, filename), content, 'utf8')
    importedFiles.push(filename)
  }

  return importedFiles
}

/** 生成符合组件生成规则的 SVG 文件名。 */
function getSafeSvgFilename(filePath) {
  const filename = sanitizeFilename(basename(filePath)).toLowerCase()
  const isValid = /^[a-z][a-z0-9-]*\.svg$/.test(filename)

  if (!isValid) {
    console.warn(`Skip invalid svg filename: ${filePath}`)
    return ''
  }

  return filename
}

/** 移除文件系统不安全字符，保留图标命名中的短横线。 */
function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim()
}
