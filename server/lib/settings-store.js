const fs = require('fs')
const path = require('path')

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings-store.json')

if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
}

function readFile(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
    }
  } catch (error) {
    console.error('Error reading settings file:', error)
  }
  return {}
}

function writeFile(data: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing settings file:', error)
  }
}

module.exports = {
  readFile,
  writeFile,
}
