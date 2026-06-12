// 修改package.json中的版本号信息

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

function readVersion() {
  const packageJSON = fs.readFileSync(
    path.resolve(__dirname, '../package.json')
  )

  return JSON.parse(packageJSON).version
}

function writeVersion(packageName, version) {
  const filePath = path.resolve(__dirname, `../${packageName}/package.json`)

  let packageJSON = fs.readFileSync(filePath)
  packageJSON = JSON.parse(packageJSON)
  packageJSON.version = version

  fs.writeFileSync(filePath, JSON.stringify(packageJSON, null, 2))
}

function commitRelease(version) {
  execSync('git config --location=local user.email "jenkins@ly-tech.com"')
  execSync('git config --location=local user.name "jenkins"')
  execSync('git add -A')
  execSync(`git commit -m "chore(release): ${version}"`)
}

const localVersion = readVersion().trim()
let changed = false;

// 更新icons-vue
const remoteVerVue = execSync('npm view @ly/icons-vue version').toString().trim();
if (remoteVerVue !== localVersion) {
  writeVersion('packages/vue', localVersion)
  writeVersion('packages/svg', localVersion)

  changed = true;
}

// 更新icons-vue2
const remoteVerVue2 = execSync('npm view @ly/icons-vue2 version').toString().trim();
if (remoteVerVue2 !== localVersion) {
  writeVersion('packages/vue2', localVersion)
  // execSync('npm publish packages/vue2')

  changed = true;
}

// 更新doc
function writeVersionToDocs() {
  const filePath = path.resolve(__dirname, `../playground/icons.md`)

  let text = fs.readFileSync(filePath).toString();
  text = text.replace(/iconVersion\s*=\s*'\d+(\.\d+)+'/, `iconVersion = '${localVersion}'`);
  fs.writeFileSync(filePath, text);
}
writeVersionToDocs();


function publish() {
  execSync('npm publish ./packages/vue')
  execSync('npm publish ./packages/vue2')
}

publish();
