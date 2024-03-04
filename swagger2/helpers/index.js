const Handlebars = require('Handlebars');
const pinyin = require('pinyin')
const toType = {
    integer: () => "number",
    number: () => "number",
    boolean: () => "boolean",
    file: () => "File",
    string: () => "string",
    undefined: () => "undefined",
    array: () => "Array<any>",
    object: () => "any"
}

function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, function (match, p1) {
        return p1.toUpperCase();
    });
}

function removeSpaces(str) {
    return str.replace(/\s/g, '');
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getName(context) {
    return context
}

function formatType(context) {
    if(!context.originalRef && context['$ref']) {
        context.originalRef = context['$ref'].split('/').pop()
    }
    if (!context.type && context.originalRef) {
        return formatName(context.originalRef)
    }
    if (context.type === 'array' && context.items.originalRef) {
        if (context.items === 'T') {
            return 'Array<T>'
        } else {
            return formatName(context.items.originalRef)
        }
    }
    if (context.type === 'object') {
        if (context.item === 'T') {
            return 'T'
        } else {
            return 'any'
        }
    }
    return toType[context.type]()
}

function formatName(context) {
    return capitalizeFirstLetter(removeSpaces(snakeToCamel(pinyin.default(context, {style: 'normal'}).join('_'))))
}

function getType(context) {
    const res = context.filter(item => item.in !== 'header')
    const str = res.reduce((previousValue, currentValue, currentIndex, array) => {
        if (previousValue) {
            previousValue += ','
        }
        if (currentValue.in === 'body') {
            if(currentValue.name === 'file') {
                previousValue += `${currentValue.name}${!currentValue.required? '?' : ''}: File`
            } else {
                if (currentValue.schema.type && currentValue.schema.type === 'array') {
                    if(currentValue.schema.items['$ref']) {
                        previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${formatName(currentValue.schema.items['$ref'].replace('#/definitions/',''))}`
                    } else {
                        previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${toType[currentValue.schema.items.type]()}`
                    }
                } else {
                    previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${formatName(currentValue.schema['$ref'].replace('#/definitions/',''))}`
                }
            }
        }
        if (currentValue.in === 'query') {
            previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${toType[currentValue.type]()}`
        }
        if (currentValue.in === 'path') {
            previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${toType[currentValue.type]()}`
        }
        if (currentValue.in === 'formData') {
            previousValue += `${currentValue.name}${!currentValue.required ? '?' : ''}: ${toType[currentValue.type]()}`
        }
        return previousValue
    }, ``)

    if(str.split(',').length > 1) {
        return str ? `{${str}}` : ''
    }
    return str ? `${str.split(':')[1]}` : ''
}

function getOptions(context) {
    const res = context.filter(item => item.in !== 'header')
    const str = res.reduce((previousValue, currentValue, currentIndex, array) => {
        if (previousValue) {
            previousValue += ','
        }
        if (currentValue.in === 'body') {
            if (currentValue.schema.type === 'array') {
                previousValue += `${currentValue.name}: ${currentValue.schema.items.originalRef}`
            } else {
                previousValue += `${currentValue.name}: ${currentValue.schema.originalRef}`
            }
        }
        if (currentValue.in === 'query') {
            previousValue += `${currentValue.name}: ${currentValue.type}`
        }
        if (currentValue.in === 'path') {
            previousValue += `${currentValue.name}: ${currentValue.type}`
        }
        if (currentValue.in === 'formData') {
            previousValue += `${currentValue.name}: ${currentValue.type}`
        }
        return previousValue
    }, ``)
    const result = str.split(',').reduce((previousValue, currentValue, currentIndex, array) => {
        if (previousValue) {
            previousValue += ','
        }

        return previousValue + currentValue.split(':')[0]
    }, '')
    if(str.split(',').length > 1) {
        return result ? `{${result}}` : '{}'
    }
    return result ? `${result}` : '{}'
}

function getRequestData(context) {
    const options = getOptions(context)
    const type = getType(context)
    return type ? `${options}:${type}, headers?: AxiosHeaders` : 'headers?: AxiosHeaders'
}

function requestType(context) {
    if (context === 'get') return 'params'
    if (context === 'post') return 'data'
    if (context === 'put') return 'data'
    if (context === 'delete') return 'data'
    return 'data'
}

function parseUrl(context) {
    return context.replace(/\/\{/g, '/${')
}

Handlebars.registerHelper('getName', getName)
Handlebars.registerHelper('formatType', formatType)
Handlebars.registerHelper('formatName', formatName)
Handlebars.registerHelper('getRequestData', getRequestData)
Handlebars.registerHelper('getOptions', getOptions)
Handlebars.registerHelper('requestType', requestType)
Handlebars.registerHelper('parseUrl', parseUrl)
module.exports = Handlebars