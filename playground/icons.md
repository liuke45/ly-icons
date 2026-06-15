# 图标展示 <Badge type="tip" :text="iconVersion" />

::: info
当前展示的是最新版本的图标
:::

::: tip
点击图标可复制图标名
:::

<el-input v-model="keyword" placeholder="搜索图标名" />
<el-tabs v-model="activeIconType" class="icon-tabs">
  <el-tab-pane
    v-for="item in iconTypes"
    :key="item.value"
    :label="item.label"
    :name="item.value"
  />
</el-tabs>
<el-switch
  v-model="ifAddPrefix"
  class="icon-prefix-switch"
  inactive-text="复制时原名称"
  active-text="复制时添加'LyIcon'前缀"
/>

<div class="icon-list">
  <div v-for="icon in filteredIcons" class="icon-item" :title="icon.name" :key="icon.name" @click="copyIconName(icon.name)">
    <component :is="icon" :size="size" class="icon" />
    <span class="icon-name">{{ icon.name }}</span>
  </div>
</div>

<style>
.el-switch__label.is-active {
  color: var(--vp-custom-block-tip-text)
}
.icon-prefix-switch {
  --el-switch-on-color: #278C5D;
}
.icon-tabs {
  margin-top: 16px;
}
.icon-tabs .el-tabs__item.is-active,
.icon-tabs .el-tabs__item:hover {
  color: #278C5D;
}
.icon-tabs .el-tabs__active-bar {
  background-color: #278C5D;
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
import { ElInput, ElMessage, ElSwitch, ElTabPane, ElTabs } from 'element-plus'
import { ref, computed  } from 'vue'

const iconVersion = '1.5.1';

const keyword = ref("");

const size = ref(24)

const ifAddPrefix = ref(true);

type IconType = 'all' | 'line' | 'fill' | 'color';

const activeIconType = ref<IconType>('all');

const iconTypes: { label: string; value: IconType }[] = [
  { label: '全部', value: 'all' },
  { label: '线性图标', value: 'line' },
  { label: '面性图标', value: 'fill' },
  { label: '颜色图标', value: 'color' },
];

const filteredIcons = computed(() => {
  const _keyword = keyword.value.trim();
  const reg = _keyword === '' ? null : new RegExp(_keyword, 'i');

  return Object.values(allIcons).filter(icon => {
    const iconName = icon.name || '';
    return isMatchIconType(iconName, activeIconType.value) && (!reg || reg.test(iconName));
  });
});

/** 判断图标名称是否匹配当前图标分类。 */
function isMatchIconType(iconName: string, iconType: IconType) {
  if (iconType === 'all') return true;
  if (iconType === 'fill') return iconName.endsWith('Fill');
  if (iconType === 'color') return iconName.endsWith('Color');
  return !iconName.endsWith('Fill') && !iconName.endsWith('Color');
}

/** 复制图标组件名称。 */
async function copyIconName(iconName) {
  try {
    await navigator.clipboard.writeText((ifAddPrefix.value ? "LyIcon" : '') + iconName);
    ElMessage.success('复制成功！');
  } catch (err) {
    ElMessage.warn(`复制失败，${err.message}`);
  }
}

</script>
