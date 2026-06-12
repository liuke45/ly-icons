const got = require('got')
const { ensureDir, writeFile, remove } = require('fs-extra')
const { join, resolve } = require('path')
const Figma = require('figma-js')
const { FIGMA_TOKEN, FIGMA_FILE_URL } = require('./env.js')
const PQueue = require('p-queue')
const sanitize = require('sanitize-filename')
const { chunk } = require('lodash')

const options = {
  format: 'svg',
  outputDir: './assets',
  scale: '1',
}

for (const arg of process.argv.slice(2)) {
  const [param, value] = arg.split('=')
  if (options[param]) {
    options[param] = value
  }
}

if (!FIGMA_TOKEN) {
  throw Error('Cannot find FIGMA_TOKEN in process!')
}

const client = Figma.Client({
  personalAccessToken: FIGMA_TOKEN,
})

// Fail if there's no figma file key
let fileId = null
let nodeId = '489:12633'
if (!fileId) {
  try {
    fileId = FIGMA_FILE_URL.match(/file\/([a-z0-9]+)\//i)[1]
  } catch (e) {
    throw Error('Cannot find FIGMA_FILE_URL key in process!')
  }
}

console.log(`Exporting ${FIGMA_FILE_URL} components`)
client
  .fileNodes(fileId, { ids: [nodeId] })

  .then(({ data }) => {
    console.log('Processing response')
    let components = {}
    const page = data.nodes[nodeId]

    const fileNameSet = new Set()

    const errorNames = []
    const duplicateNames = []
    const contentInvalidNames = []

    //文件校验筛查 start
    // 检查svg内容是否包含图片image
    function checkFileContent(comp) {
      let valid = true;
      if (comp.children) {
        for (const childItem of comp.children) {
          if (childItem.fills && childItem.fills.length > 0) {
            for (const item of childItem.fills) {
              if (item.type === 'IMAGE') {
                valid = false;
                break;
              }
            }
          }
        }
      }
      
      return valid;
    }

    function check(c) {
      if (c.type === 'COMPONENT') {
        const { name, id } = c
        const { description = '', key } = page.components[c.id]
        const { width, height } = c.absoluteBoundingBox
        const filename = `${sanitize(name.split('/').pop()).toLowerCase()}.${
          options.format
        }`.trim()

        const reg = /^[a-z][a-z0-9-]*(\.svg)$/
        if (filename && reg.test(filename)) {
          if (!fileNameSet.has(filename)) {
            if (checkFileContent(c)) {
              fileNameSet.add(filename)

              components[id] = {
                name,
                filename,
                id,
                key,
                file: fileId,
                description,
                width,
                height,
              }
            } else {
              contentInvalidNames.push(name)
            }
            
          } else {
            duplicateNames.push(name)
          }
        } else {
          errorNames.push(name)
        }
      } else if (c.children) {
        // eslint-disable-next-line github/array-foreach
        c.children.forEach(check)
      }
    }
    //文件校验筛查 end

    if (page) {
      page.document.children
        // .filter(item => item.name === '图标设计')
        .forEach(check)
    }

    if (errorNames.length) {
      console.log('以下组件名称不符合规范，请修改后重新导出：')
      console.log(errorNames)
    }
    if (duplicateNames.length) {
      console.log('以下组件名称重复，请修改后重新导出：')
      console.log(duplicateNames)
    }
    if (contentInvalidNames.length) {
      console.log('以下组件内容不合法，请修改后重新导出：')
      console.log(contentInvalidNames)
    }

    if (Object.values(components).length === 0) {
      throw Error('No components found!')
    }

    console.log(
      `${Object.values(components).length} components found in the figma file`
    )
    return components
  })
  // 获取每个image的链接地址
  .then((components) => {
    const ids = Object.keys(components)
    console.log('Getting export urls', ids.length)
    const chunks = chunk(ids, 100)

    return Promise.all(
      chunks.map((ids) =>
        client
          .fileImages(fileId, {
            ids,
            format: options.format,
            scale: options.scale,
          })
          .then(({ data }) => {
            for (const id of Object.keys(data.images)) {
              components[id].image = data.images[id]
            }
            return components
          })
      )
    ).then(() => components)
  })
  // 删除旧目录旧数据
  .then((components) => {
    console.log('Delete old data')
    return remove(join(options.outputDir)).then(() => components)
  })
  // 数据写入到data.json中
  .then((components) => {
    console.log('Writing data.json')
    return ensureDir(join(options.outputDir))
      .then(() =>
        writeFile(
          resolve(options.outputDir, 'data.json'),
          JSON.stringify(components),
          'utf8'
        )
      )
      .then(() => components)
  })
  // 下载图片
  .then((components) => {
    console.log('Downloading images')

    const contentTypes = {
      svg: 'image/svg+xml',
    }
    return queueTasks(
      Object.values(components).map((component) => () => {
        return got
          .get(component.image, {
            headers: {
              'Content-Type': contentTypes[options.format],
            },
            encoding: 'utf8',
          })
          .then((response) => {
            return ensureDir(join(options.outputDir)).then(() =>
              writeFile(
                join(options.outputDir, component.filename),
                response.body,
                'utf8'
              )
            )
          })
      })
    )
  })
  .catch((error) => {
    throw Error(`Error fetching components from Figma: ${error}`)
  })

function queueTasks(tasks, options) {
  const queue = new PQueue(Object.assign({ concurrency: 5 }, options))
  for (const task of tasks) {
    queue.add(task)
  }
  queue.start()
  return queue.onIdle()
}
