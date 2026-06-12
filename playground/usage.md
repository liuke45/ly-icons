# 使用

## 局部引入

```vue
<script lang="ts" setup>
import { Query } from '@ly/icons-vue'
</script>

<template>
  <Query />
</template>
```

## 全局引入

::: info
为避免组件名重复，图标组件在全局安装时加上了前缀`LyIcon`。
:::

```typescript
// main.ts
import { createApp } from 'vue'
import LyIcon from '@ly/icons-vue'
import App from './App.vue'

const app = createApp(App)

app.use(LyIcon)
app.mount('#app')
```

```vue
<template>
  <LyIconQuery />
</template>
```

## 配合组件库使用

::: warning
目前仅支持 vue2 版本
:::

```typescript
// main.ts
import Vue from 'vue'
import LyUI from '@ly/ui'
import LyIcon from '@ly/icons-vue2'
import App from './App.vue'

Vue.use(LyIcon)
Vue.use(LyUI)
new Vue({
  el: '#app',
  render: (h) => h(App),
})
```

```vue
<template>
  <ly-icon name="Query" color="#B2B2B2" :size="36" />
</template>
```

::: tip
当使用`ly-icon`组件时，可以通过`color`和`size`属性来控制图标颜色和尺寸
:::
