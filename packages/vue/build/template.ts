import { SvgData } from './processSvg'

const getAttrs = (style: string, svgData: SvgData) => {
  const baseAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    ':width': 'size',
    ':height': 'size',
    viewBox: svgData.viewBox,
    'aria-hidden': 'true',
    'v-bind': '$attrs',
  }
  const fillAttrs = {}
  const strokeAttrs = {
    fill: 'none',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }
  return Object.assign(
    {},
    baseAttrs,
    style === 'fill' ? fillAttrs : strokeAttrs
  )
}

const getElementCode = (
  ComponentName: string,
  attrs: string,
  svgData: SvgData
) => {
  let content = svgData.inner
  // 匹配svg中所有id="任意字符"的内容
  const reg = /id="(.*?)"/g
  const matches = content.match(reg)
  if (matches) {
    matches.forEach((match) => {
      // 匹配id="任意字符"中的任意字符
      const id = match.match(/id="(.*?)"/)?.[1]
      if (id) {
        // 替换svg中所有id="任意字符"的内容为id="任意字符+时间戳"
        content = content.replace(
          match,
          `:id="'${id}' + timeStamp"`
        )
      }
    })
  }
  // 匹配svg中所有\w+="url(#任意字符)"中的任意字符，同时替换成:\w+="`url(#${任意字符})`"
  const reg2 = /([\w-]+)="url\(#(.*?)\)"/g
  const matches2 = content.match(reg2)

  if (matches2) {
    matches2.forEach((match) => {
      // 匹配\w+="url(#任意字符)"中的任意字符
      const matches = match.match(/([\w-]+)="url\(#(.*?)\)"/)
      const id = matches?.[2]
      const attrName = matches?.[1]
      if (id) {
        // 替换svg中所有\w+="url(#任意字符)"的内容为\w+="`url(#${任意字符})`"
        content = content.replace(
          match,
          `:${attrName}="'url(#${id}'+timeStamp+')'"`
        )
      }
    })
  }
  return `
<template>
  <svg
    ${attrs}
  >
    ${content}
  </svg>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: "${ComponentName}",
  props: {
    size: {
      type: Number,
      default: 20
    },
    color: {
      type: String,
      default: "currentColor"
    }
  },
  data() {
    return {
      timeStamp: this.getTimeStamp()
    };
  },
  methods: {
    getTimeStamp() {
      return new Date().getTime();
    }
  }
});
</script>
`
}

const getComponentIndex = ({
  name,
  componentName,
}: {
  name: string
  componentName: string
}) =>
  // language=TypeScript
  // prettier-ignore
  `import type { App } from 'vue';
import type { InstallOptions } from '../index';
import _${componentName} from './${name}.vue';

const ${componentName} = Object.assign(_${componentName}, {
  install: (app: App, options?: InstallOptions) => {
    const iconPrefix = options?.prefix ?? '';
    app.component(iconPrefix + _${componentName}.name, _${componentName});
  }
});

export default ${componentName};
`

export const getComponents = ({
  imports,
  exports,
  components,
}: {
  imports: string[]
  exports: string[]
  components: string[]
}) =>
  // language=TypeScript
  // prettier-ignore
  `${exports.join('\n')}`

export { getAttrs, getElementCode, getComponentIndex }
