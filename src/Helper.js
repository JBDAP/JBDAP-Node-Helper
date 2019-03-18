/**
 * JBDAP-Node-Helper 入口
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 标记运行环境语言
global.$i18nLang = 'zh-cn'

// 自定义一个 i18n 的错误抛出器
global.$throwError = function(name,cause,info,dict) {
    $throwErrorInLanguage(name,cause,info,dict,global.$i18nLang)
}

// 输出版本号
import { version } from '../package.json'
module.exports.version = version

// 引入其它模块
import validator from './validator'

/**
 * 根据 table 的定义文件创建数据表
 * @param {object} conn 数据库连接
 * @param {array} tables 包含多个 table 定义的数组
 */
async function createTables(conn,tables) {
    try {
        if (_.isArray(tables) && tables.length > 0) {
            for (let i=0; i<tables.length; i++) {
                let table = tables[i]
                // 合法性检查
                validator.checkSchema(table)
                // 创建单个表的结构
                await createTable(conn,table)
            }
        }
        else $throwError('ParamTypeError',null,null,[
            ['zh-cn', '参数必须是含有至少一个元素的数组'],
            ['en-us', 'Param must be an Array which has one element at least']
        ])
    }
    catch (err) {
        $throwError('TableInitError',err,null,[
            ['zh-cn', `创建数据表出错`],
            ['en-us', `Error occurred while creating tables`]
        ])
    }
}
module.exports.createTables = createTables

/**
 * 创建单个数据表
 * @param {object} conn 数据库连接
 * @param {object} schema 单个数据表的定义文件
 */
async function createTable(conn,schema) {
    // 检查表名是否存在
    let exists = await conn.schema.hasTable(schema.name)
    if (exists) $throwError('TableExistsError',null,null,[
        ['zh-cn', `数据表 '${schema.name}' 已经存在`],
        ['en-us', `Table '${schema.name}' already exists`]
    ])
    // 创建字段、唯一键、索引、外键
    return conn.schema.createTable(schema.name, (table) => {
        try {
            // 创建字段
            for (let i=0; i<schema.columns.length; i++) {
                let column = schema.columns[i]
                validator.checkColumn(column)
                let length = (column.type === 'string' && _.isInteger(column.length)) ? ',' + column.length : ''
                let type = `.${column.type}('${column.name}'${length})`
                let primary = column.primary === true ? '.primary()' : ''
                let notNullable = column.notNullable === true ? '.notNullable()' : ''
                let defaultTo = !_.isUndefined(column.defaultTo) ? `.defaultTo(${JSON.stringify(column.defaultTo)})` : ''
                let unsigned = ((column.type === 'integer' || column.type === 'bigInteger' || column.type === 'float' || column.type === 'decimal') && column.unsigned === true) ? '.unsigned()' : ''
                let str = `table${type}${unsigned}${notNullable}${defaultTo}${primary}`
                // console.log(str)
                eval(str)
            }
            // 创建唯一键
            if (schema.unique) table.unique(schema.unique)
            // 创建索引
            if (schema.indexes) {
                for (let i=0; i<schema.indexes.length; i++) {
                    table.index(schema.indexes[i])
                }
            }
            // 创建外键
            if (schema.foreignKeys) {
                for (let i=0; i<schema.foreignKeys.length; i++) {
                    let foreignKey = schema.foreignKeys[i]
                    validator.checkForeignKey(foreignKey)
                    table.foreign(foreignKey.selfColumn).references(foreignKey.targetColumn).inTable(foreignKey.targetTable)
                }
            }
        }
        catch (err) {
            $throwError('SingleTableInitError',err,null,[
                ['zh-cn', `创建数据表 '${schema.name}' 结构出错`],
                ['en-us', `Error occurred while creating struct of table '${schema.name}'`]
            ])
        }
    })
}

