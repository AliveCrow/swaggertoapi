const Handlebars = require('Handlebars')
const pinyin = require('pinyin')
const _ = require('lodash')

// region registerApiName
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, function (match, p1) {
        return p1.toUpperCase();
    });
}
function removeSpaces(str) {
    return str.replace(/\s/g, '');
}
function formatName(context) {
    return capitalizeFirstLetter(removeSpaces(snakeToCamel(pinyin.default(context, {style: 'normal'}).join('_'))))
}
function registerApiName(baseUrl, path, method) {
    return formatName(method + '_' + path.replace(baseUrl, '').replace(/-/g, '_').replace(/\/{/g, 'By_').replace(/}/g, ''))
}
// endregion

// region register
function registerParams(params, method) {
    let query = ``
    let path = ``
    if(!params) return ''
    const inQuery = params.filter((item) => item.in === 'query')
    const inPath = params.filter((item) => item.in === 'path')
    inQuery.forEach((item) => {
        query += ` ${item.name},`
    })
    inPath.forEach((item) => {
        path += ` ${item.name},`
    })
    if(inQuery.length === 0 && inPath.length === 0) return ''
    switch (inPath.length) {
        case 0:
            return `{${query.slice(0, query.length - 1)}},`
        case 1:
            return `${path.slice(0, path.length - 1)},{${query.slice(0, query.length - 1)}},`
        default:
            return `{${path.slice(0, path.length - 1)}},{${query.slice(0, query.length - 1)}},`
    }
}
function registerBody(requestBody, schemas) {
    let result = ''
    if(!requestBody) return 'config'
    const schema = requestBody.content['application/json'].schema
    switch (schema.type) {
        case 'array':
            result = ''
            const bodyArr = schemas[schema.items['$ref'].split('/').pop()]
            _.forEach(bodyArr.properties, (item, key) => {
                result += `${key},`
            })
            return `{${result.slice(0, result.length - 1)}}, config`
        default:
            // console.log(schemas[schema['$ref'].split('/').pop()])
            result = ''
            const body = schemas[schema['$ref'].split('/').pop()]
            _.forEach(body.properties, (item, key) => {
                result += `${key},`
            })
            return `{${result.slice(0, result.length - 1)}}, config`
    }
}
// endregion

function getUrl(outerKeyVar) {
    return outerKeyVar.replace(/{/g, '${')
}

function getParams(params) {
    let query = ``
    if(!params) return ''
    const inQuery = params.filter((item) => item.in === 'query')
    inQuery.forEach((item) => {
        query += ` ${item.name},`
    })
    return `params: {${query.slice(0, query.length - 1)}},`
}

function getBody(requestBody, schemas) {
    let result = ''
    if(!requestBody) return ''
    const schema = requestBody.content['application/json'].schema
    switch (schema.type) {
        case 'array':
            result = ''
            const bodyArr = schemas[schema.items['$ref'].split('/').pop()]
            _.forEach(bodyArr.properties, (item, key) => {
                result += `${key},`
            })
            return `body: {${result.slice(0, result.length - 1)}},`
        default:
            // console.log(schemas[schema['$ref'].split('/').pop()])
            result = ''
            const body = schemas[schema['$ref'].split('/').pop()]
            _.forEach(body.properties, (item, key) => {
                result += `${key},`
            })
            return `body: {${result.slice(0, result.length - 1)}},`
    }
}

Handlebars.registerHelper('registerApiName', registerApiName)
Handlebars.registerHelper('registerParams', registerParams)
Handlebars.registerHelper('registerBody', registerBody)
Handlebars.registerHelper('getUrl', getUrl)
Handlebars.registerHelper('getParams', getParams)
Handlebars.registerHelper('getBody', getBody)
module.exports = Handlebars