/**
 * 验证器，用于参数合法性验证
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 准备 i18n 的默认环境（单元测试用）
if (!global.$i18nLang) global.$i18nLang = 'zh-cn'
if (!global.$throwError) global.$throwError = function(name,cause,info,dict) {
    $throwErrorInLanguage(name,cause,info,dict,global.$i18nLang)
}

/**
 * 检查数据表结构定义
 * @param {object} schema 数据表结构定义
 */
function checkSchema(schema) {
    // 参数类型
    if (!_.isPlainObject(schema)) $throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ])
    // 无效属性
    let props = [
        'name',
        'columns',
        'indexes',
        'unique',
        'foreignKeys'
    ]
    let keys = Object.keys(schema)
    for (let i=0; i<keys.length; i++) {
        if (props.indexOf(keys[i]) < 0) $throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ])
    }
    // 必备属性
    if (!_.isString(schema.name) || schema.name === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ])
    if (!_.isArray(schema.columns) || schema.columns.length === 0) $throwError('PropDefError',null,null,[
        ['zh-cn', `'columns' 属性必须是一个非空数组`],
        ['en-us', `Property 'columns' must be a non-empty Array`]
    ])
    // 其它属性
    if (!_.isUndefined(schema.unique) && (!_.isArray(schema.unique) || schema.unique.length === 0)) $throwError('PropDefError',null,null,[
        ['zh-cn', `'unique' 属性必须是一个非空数组`],
        ['en-us', `Property 'unique' must be a non-empty Array`]
    ])
    if (!_.isUndefined(schema.indexes) && (!_.isArray(schema.indexes) || schema.indexes.length === 0)) $throwError('PropDefError',null,null,[
        ['zh-cn', `'indexes' 属性必须是一个非空数组`],
        ['en-us', `Property 'indexes' must be a non-empty Array`]
    ])
    if (!_.isUndefined(schema.foreignKeys) && (!_.isArray(schema.foreignKeys) || schema.foreignKeys.length === 0)) $throwError('PropDefError',null,null,[
        ['zh-cn', `'foreignKeys' 属性必须是一个非空数组`],
        ['en-us', `Property 'foreignKeys' must be a non-empty Array`]
    ])
    return true
}
module.exports.checkSchema = checkSchema

/**
 * 检查字段定义是否合法
 * @param {object} column 字段信息
 */
function checkColumn(column) {
    // 参数类型
    if (!_.isPlainObject(column)) $throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ])
    // 必备属性
    if (!_.isString(column.name) || column.name === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ])
    if (!_.isString(column.type) || column.type === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'type' 属性必须是一个非空字符串`],
        ['en-us', `Property 'type' must be a non-empty String`]
    ])
    return true
}
module.exports.checkColumn = checkColumn

/**
 * 检查数据表外键定义是否合法
 * @param {object} foreignKey 外键定义
 */
function checkForeignKey(foreignKey) {
    if (_.isUndefined(foreignKey)) return true
    // 参数类型
    if (!_.isPlainObject(foreignKey)) $throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ])
    // 必备属性
    if (!_.isString(foreignKey.selfColumn) || foreignKey.selfColumn === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'selfColumn' 属性必须是一个非空字符串`],
        ['en-us', `Property 'selfColumn' must be a non-empty String`]
    ])
    if (!_.isString(foreignKey.targetTable) || foreignKey.targetTable === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'targetTable' 属性必须是一个非空字符串`],
        ['en-us', `Property 'targetTable' must be a non-empty String`]
    ])
    if (!_.isString(foreignKey.targetColumn) || foreignKey.targetColumn === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'targetColumn' 属性必须是一个非空字符串`],
        ['en-us', `Property 'targetColumn' must be a non-empty String`]
    ])
    return true
}
module.exports.checkForeignKey = checkForeignKey

/**
 * 检查数据表权限定义
 * @param {object} auth 数据表结构定义
 */
function checkAuth(auth) {
    // 参数类型
    if (!_.isPlainObject(auth)) $throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ])
    // 无效属性
    let props = [
        'name',
        'verify',
        'mask',
        'freeze',
        'select',
        'create',
        'update',
        'delete'
    ]
    let keys = Object.keys(auth)
    for (let i=0; i<keys.length; i++) {
        if (props.indexOf(keys[i]) < 0) $throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ])
    }
    // 必备属性
    if (!_.isString(auth.name) || auth.name === '') $throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ])
    props = [
        'select',
        'create',
        'update',
        'delete'
    ]
    for (let i=0; i<props.length; i++) {
        if (_.isUndefined(auth[props[i]])) $throwError('PropMissingError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须定义`],
            ['en-us', `Property '${props[i]}' must be defined`]
        ])
        if (!_.isPlainObject(auth[props[i]])) $throwError('PropDefError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须是一个 Object 对象`],
            ['en-us', `Property '${props[i]}' must be a plain Object`]
        ])
    }
    // 其它属性
    props = [
        'verify',
        'mask',
        'freeze'
    ]
    for (let i=0; i<props.length; i++) {
        if (!_.isUndefined(auth[props[i]]) && !_.isPlainObject(auth[props[i]])) $throwError('PropDefError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须是一个 Object 对象`],
            ['en-us', `Property '${props[i]}' must be a plain Object`]
        ])
    }
    return true
}
module.exports.checkAuth = checkAuth
