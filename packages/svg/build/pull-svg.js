const { spawnSync } = require('child_process')
const { resolve } = require('path')

const hasLocalSource = Boolean(
  process.env.LY_ICONS_ZIP || process.env.LY_ICONS_SOURCE_DIR
)

const packageRoot = resolve(__dirname, '..')
const script = resolve(packageRoot, hasLocalSource ? 'build/import-svg.js' : 'build/figma.js')
const result = spawnSync(process.execPath, [script], {
  cwd: packageRoot,
  stdio: 'inherit',
})

process.exit(result.status || 0)
