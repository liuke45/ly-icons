import svgo from 'svgo'
import * as cheerio from 'cheerio'

export type Style = 'fill' | 'stroke'
type attributes = Record<string, string>
export interface SvgData {
  inner: string
  viewBox: string
}

const anotherStyle = (style: Style): Style =>
  style === 'fill' ? 'stroke' : 'fill'

const fixedStrokeWidth = (attr: attributes) =>
  (attr['vector-effect'] = 'non-scaling-stroke')

const dynamicFillOrStroke = (attr: attributes, key: 'fill' | 'stroke') => {
  const oldVal = attr[key]
  if (oldVal) {
    if (oldVal === '#fff' || oldVal === 'white') {
      return
    }
    if (oldVal !== 'none') {
      attr[`:${key}`] = 'color'
    }
    delete attr[key]
  }
}

/**
 * Optimize SVG with `svgo`.
 * @param {string} svg - An SVG string.
 * @param {Style} style - fill or stroke.
 * @returns {Promise<string>}
 */
function optimize(svg: string, style: Style, colors: Boolean) {
  const config = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            convertShapeToPath: false,
            mergePaths: false,
            cleanupIDs: {
              minify: false,
            },
          },
        },
      },
      'removeTitle',
      // {
      //   name: 'removeAttrs',
      //   params: {
      //     attrs: style,
      //   },
      // },
      {
        name: 'custom-plugin',
        type: 'perItem',
        fn: (node: any) => {
          if (node.name !== 'svg') {
            // 设置固定轮廓宽度
            fixedStrokeWidth(node.attributes)

            if (!colors) {
              // 动态化颜色值
              dynamicFillOrStroke(node.attributes, style)
              dynamicFillOrStroke(node.attributes, anotherStyle(style))
            }
          }
        },
      },
    ],
  }

  return svgo.optimize(svg, config).data
}

/**
 * remove SVG element.
 * @param {string} svg - An SVG string.
 * @returns {string}
 */
function removeSVGElement(svg: string) {
  const $ = cheerio.load(svg)
  return $('body').children().html()!
}

/**
 * parse SVG element.
 * @param {string} svg - An SVG string.
 * @returns {string}
 */
function parseSVGElement(svg: string) {
  const $ = cheerio.load(svg)

  const svgElement = $('body').children()
  const { width, height } = svgElement[0].attribs

  return {
    inner: removeOuterSvgTags(svg),
    viewBox: `0,0,${width},${height}`,
  }
}

/**
 * Process SVG string.
 * @param {string} svg - An SVG string.
 * @param {Style} style - Fill Or Stroke.
 * @param {Promise<string>}
 */
async function processSvg(svg: string, style: Style, colors: Boolean) {
  let optimized = optimize(svg, style, colors)

  if (optimized.includes('base64')) {
    return null;
  }

  optimized = parseSVGElement(optimized)

  return optimized
}

function removeOuterSvgTags(svgString: string): string {
  // 移除开头的 SVG 标签
  const withoutStartTag = svgString.replace(/<svg[^>]*>/, '')
  // 移除结尾的 SVG 标签
  const withoutEndTag = withoutStartTag.replace(/<\/svg>/, '')
  return withoutEndTag.trim()
}

export { processSvg }
