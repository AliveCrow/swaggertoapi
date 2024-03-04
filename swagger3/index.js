const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const Handlebars = require('./helpers')
const config = require('./config')

const resolve = (dir) => path.join(__dirname, dir)
const currentWorkingDirectory = process.cwd();

function transform({baseURL= config.baseURL, dir= config.dir, template, modules}, DEBUG = false) {
  let tpl_path = resolve(config.template)
  if(!modules) throw new Error('modules is required')
  if(template) tpl_path = path.join(currentWorkingDirectory, template)
  modules.forEach(async (module) => {
    try {
      const commonUrl = module.commonUrl
      const res = await axios.get(baseURL + module.url)
      const json = res.data
      const info = json.info
      const paths = json.paths
      const tags = json.tags
      const schemas = json.components.schemas
      const result = []

      const api_tpl = Handlebars.compile(fs.readFileSync(tpl_path, 'utf-8'))
      const api_data = api_tpl({
        paths,
        schemas,
        commonUrl
      })

      if(DEBUG) {
        console.dir({
          commonUrl,
          paths,
          result
        },{ depth: null })
      }

      if (!fs.existsSync(path.join(currentWorkingDirectory, `./${dir}`))) {
        fs.mkdirSync(path.join(currentWorkingDirectory, `./${dir}`), {recursive: true})
      }
      fs.writeFileSync(path.join(currentWorkingDirectory, `./${dir}/${module.name}.ts`), api_data)

      console.log(`✅ api file ${module.name}.js created in ${currentWorkingDirectory}/${dir}`)
    }
    catch(e) {
      console.error(e)
    }
  })
}

module.exports = {
  transform,
  registerHelper: Handlebars.registerHelper,
}