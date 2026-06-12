# 图标展示 <Badge type="tip" :text="iconVersion" />

::: info
当前展示的是最新版本的图标
:::

::: tip
点击图标可复制图标名
:::

<el-input v-model="keyword" placeholder="搜索图标名" />
<el-switch v-model="ifAddPrefix" inactive-text="复制时原名称" active-text="复制时添加'LyIcon'前缀" />

<div class="icon-list">
  <div v-for="(icon) in allIcons" class="icon-item" :title="icon.name" :key="icon.name" v-show="visibleIconKeys.has(icon.name)" @click="copyIconName(icon.name)">
    <component :is="icon" :size="size" class="icon" />
    <span class="icon-name">{{ icon.name }}</span>
  </div>
</div>

<style>
.el-switch__label.is-active {
  color: var(--vp-custom-block-tip-text)
}
.icon-list {
  margin-top: 20px;
  padding: 0!important;
  border-radius: 4px;
  display: grid;
  width: 688px;
  grid-template-columns: repeat(6,1fr);
}
.icon-item {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
}
.icon-item:hover {
  cursor: pointer;
  border-color: #f6f6f7;
  background-color: #f6f6f7;
}

html.dark .icon-item:hover {
  border-color: #2b2b2c;
  background-color: #2b2b2c;
}

.icon {
  margin-bottom: 16px;
}
.icon-name {
  max-width: 100%;
  display: inline-block;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<script lang="ts" setup>
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/index.css'
import { icons as allIcons } from '@ly/icons-vue'
import { ElInput, ElMessage, ElSwitch } from 'element-plus'
import { ref, computed  } from 'vue'

const iconVersion = '1.5.1';

const keyword = ref("");

const size = ref(24)

const ifAddPrefix = ref(true);

const visibleIconKeys = computed (() => {
  const _keyword = keyword.value.trim();

  if (_keyword === '') return new Set(Object.keys(allIcons));

  const reg = new RegExp(_keyword, 'i');

  return new Set(Object.keys(allIcons).filter(iconName => reg.test(iconName)));
});

async function copyIconName(iconName) {
  try {
    await navigator.clipboard.writeText((ifAddPrefix.value ? "LyIcon" : '') + iconName);
    ElMessage.success('复制成功！');
  } catch (err) {
    ElMessage.warn(`复制失败，${err.message}`);
  }
}

</script>
