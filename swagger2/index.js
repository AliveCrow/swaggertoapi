const fs = require('fs')
const path = require('path')
const Handlebars = require('./helpers')
const axios = require('axios')
const config = require('./config')
const currentWorkingDirectory = process.cwd();
/**
 * @param baseURL
 * @param dir
 * @param template
 * @param modules
 */
function transform({baseURL= config.baseURL, dir= config.dir, template, modules}, DEBUG = false) {
    let tpl_path = path.join(__dirname, config.template)
    if(!modules) throw new Error('modules is required')
    if(template) tpl_path = path.join(currentWorkingDirectory, template)
    modules.forEach(async (module) => {
        try {
            const res = await axios.get(baseURL + module.url)
            const json = res.data
            const basePath = res.data.basePath
            const tags = json.tags
            const paths = json.paths
            const definitions = json.definitions
            const result = []
            for (const definitionsKey in definitions) {
                const obj = {}
                const definition = definitions[definitionsKey]
                // 泛型获取
                let generics
                const regRes = definitionsKey.match(/(«)(.+)(»)/)
                if (regRes) generics = regRes[2]
                obj.name = definitionsKey.replace(`«${generics}»`, '<T>')
                obj.type = definition.type
                obj.properties = definition.properties

                // 替换properties中的泛型
                for (const propertiesKey in obj.properties) {
                    const property = obj.properties[propertiesKey]
                    if (property.type === 'array' && generics && property.items.originalRef === generics) {
                        property.items = 'T'
                    }
                    if (!property.type && generics && property.originalRef === generics) {
                        property.type = 'object'
                        property.item = 'T'
                    }
                }
                if (obj.name.indexOf('ServerResponse') === -1) {
                    result.push(obj)
                }
            }
            // console.dir(paths, { depth: null })
            const api_tpl = Handlebars.compile(fs.readFileSync(tpl_path, 'utf-8'))
            const api_data = api_tpl({
                basePath,
                paths,
                result
            })

            if(DEBUG) {
                console.dir({
                    paths,
                    result
                },{ depth: null })
            }

            if (!fs.existsSync(path.join(currentWorkingDirectory, `./${dir}`))) {
                fs.mkdirSync(path.join(currentWorkingDirectory, `./${dir}`), {recursive: true})
            }
            fs.writeFileSync(path.join(currentWorkingDirectory, `./${dir}/${module.name}.ts`), api_data)

            console.log(`✅ api file ${module.name}.ts created in ${currentWorkingDirectory}/${dir}`)

        } catch (e) {
            console.log(e)
        }
    })
}

module.exports = {
    transform,
    registerHelper: Handlebars.registerHelper,
}