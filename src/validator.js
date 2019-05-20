/**
 * 验证器，用于参数合法性验证
 */

// 运行环境准备
import { JS, JE } from './global'

/**
 * 检查数据表结构定义
 * @param {object} schema 数据表结构定义
 * @param {string} lang 提示信息所用语言
 */
function checkSchema(schema,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 参数类型
    if (!JS._.isPlainObject(schema)) JS.throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ],lang)
    // 无效属性
    let props = [
        'name',
        'comment',
        'columns',
        'indexes',
        'unique',
        'foreignKeys'
    ]
    let keys = Object.keys(schema)
    for (let i=0; i<keys.length; i++) {
        if (props.indexOf(keys[i]) < 0) JS.throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ],lang)
    }
    // 必备属性
    if (!JS._.isString(schema.name) || schema.name === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ],lang)
    if (!JS._.isArray(schema.columns) || schema.columns.length === 0) JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'columns' 属性必须是一个非空数组`],
        ['en-us', `Property 'columns' must be a non-empty Array`]
    ],lang)
    // 其它属性
    if (!JS._.isUndefined(schema.unique) && (!JS._.isArray(schema.unique) || schema.unique.length === 0)) JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'unique' 属性必须是一个非空数组`],
        ['en-us', `Property 'unique' must be a non-empty Array`]
    ],lang)
    if (!JS._.isUndefined(schema.indexes) && (!JS._.isArray(schema.indexes) || schema.indexes.length === 0)) JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'indexes' 属性必须是一个非空数组`],
        ['en-us', `Property 'indexes' must be a non-empty Array`]
    ],lang)
    if (!JS._.isUndefined(schema.foreignKeys) && (!JS._.isArray(schema.foreignKeys) || schema.foreignKeys.length === 0)) JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'foreignKeys' 属性必须是一个非空数组`],
        ['en-us', `Property 'foreignKeys' must be a non-empty Array`]
    ],lang)
    return true
}
module.exports.checkSchema = checkSchema

/**
 * 检查字段定义是否合法
 * @param {object} column 字段信息
 * @param {string} lang 提示信息所用语言
 */
function checkColumn(column,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 参数类型
    if (!JS._.isPlainObject(column)) JS.throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ],lang)
    // 无效属性
    let props = [
        'name',
        'type',
        'comment',
        'primary',
        'length',
        'unsigned',
        'notNullable',
        'defaultTo'
    ]
    let keys = Object.keys(column)
    for (let i=0; i<keys.length; i++) {
        if (props.indexOf(keys[i]) < 0) JS.throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ],lang)
    }
    // 必备属性
    if (!JS._.isString(column.name) || column.name === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ],lang)
    if (!JS._.isString(column.type) || column.type === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'type' 属性必须是一个非空字符串`],
        ['en-us', `Property 'type' must be a non-empty String`]
    ],lang)
    return true
}
module.exports.checkColumn = checkColumn

/**
 * 检查数据表外键定义是否合法
 * @param {object} foreignKey 外键定义
 * @param {string} lang 提示信息所用语言
 */
function checkForeignKey(foreignKey,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    if (JS._.isUndefined(foreignKey)) return true
    // 参数类型
    if (!JS._.isPlainObject(foreignKey)) JS.throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ],lang)
    // 无效属性
    let props = [
        'selfColumn',
        'targetTable',
        'targetColumn'
    ]
    let keys = Object.keys(foreignKey)
    for (let i=0; i<keys.length; i++) {
        if (props.indexOf(keys[i]) < 0) JS.throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ],lang)
    }
    // 必备属性
    if (!JS._.isString(foreignKey.selfColumn) || foreignKey.selfColumn === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'selfColumn' 属性必须是一个非空字符串`],
        ['en-us', `Property 'selfColumn' must be a non-empty String`]
    ],lang)
    if (!JS._.isString(foreignKey.targetTable) || foreignKey.targetTable === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'targetTable' 属性必须是一个非空字符串`],
        ['en-us', `Property 'targetTable' must be a non-empty String`]
    ],lang)
    if (!JS._.isString(foreignKey.targetColumn) || foreignKey.targetColumn === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'targetColumn' 属性必须是一个非空字符串`],
        ['en-us', `Property 'targetColumn' must be a non-empty String`]
    ],lang)
    return true
}
module.exports.checkForeignKey = checkForeignKey

/**
 * 检查数据表权限定义
 * @param {object} auth 数据表结构定义
 * @param {string} lang 提示信息所用语言
 */
function checkAuth(auth,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 参数类型
    if (!JS._.isPlainObject(auth)) JS.throwError('ParamTypeError',null,null,[
        ['zh-cn', '参数必须是 Object 对象'],
        ['en-us', 'Param must be an plain Object']
    ],lang)
    // 无效属性检查
    let props = [
        'name',
        'prepare',
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
        if (props.indexOf(keys[i]) < 0) JS.throwError('InvalidPropError',null,null,[
            ['zh-cn', `'${keys[i]}' 不是有效属性`],
            ['en-us', `Property '${keys[i]}' is not valid`]
        ],lang)
    }
    // 必备属性
    if (!JS._.isString(auth.name) || auth.name === '') JS.throwError('PropDefError',null,null,[
        ['zh-cn', `'name' 属性必须是一个非空字符串`],
        ['en-us', `Property 'name' must be a non-empty String`]
    ],lang)
    props = [
        'select',
        'create',
        'update',
        'delete'
    ]
    for (let i=0; i<props.length; i++) {
        if (JS._.isUndefined(auth[props[i]])) JS.throwError('PropMissingError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须定义`],
            ['en-us', `Property '${props[i]}' must be defined`]
        ],lang)
        if (!JS._.isPlainObject(auth[props[i]])) JS.throwError('PropDefError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须是一个 Object 对象`],
            ['en-us', `Property '${props[i]}' must be a plain Object`]
        ],lang)
    }
    // 其它属性
    props = [
        'prepare',
        'verify',
        'mask',
        'freeze'
    ]
    for (let i=0; i<props.length; i++) {
        if (!JS._.isUndefined(auth[props[i]]) && !JS._.isPlainObject(auth[props[i]])) JS.throwError('PropDefError',null,null,[
            ['zh-cn', `'${props[i]}' 属性必须是一个 Object 对象`],
            ['en-us', `Property '${props[i]}' must be a plain Object`]
        ],lang)
    }
    return true
}
module.exports.checkAuth = checkAuth
