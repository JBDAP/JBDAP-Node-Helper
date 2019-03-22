/**
 * JBDAP-Node-Helper 入口
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 标记运行环境语言
if (!global.$i18nLang) global.$i18nLang = 'zh-cn'

// 标记数据表主键
if (!global.$primaryKey) global.$primaryKey = 'id'

// 自定义一个 i18n 的错误抛出器
if (!global.$throwError) global.$throwError = function(name,cause,info,dict) {
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
    // 合法性检查
    validator.checkSchema(schema)
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
            // 检查是否需要自动创建 createdAt 和 updatedAt
            if (_.findIndex(schema.columns, { name: 'createdAt' }) < 0) table.datetime('createdAt')
            if (_.findIndex(schema.columns, { name: 'updatedAt' }) < 0) table.datetime('updatedAt')
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
module.exports.createTable = createTable

/**
 * 对查询得到的数据进行敏感字段过滤后返回
 * @param {object} configs 数据库权限配置
 * @param {object} user 当前用户信息
 * @param {object} fields 解析后的字段
 * @param {array|object} data 查询到的结果
 */
function scan(configs,user,fields,data) {
    // 检查参数
    validator.checkAuth(configs)
    // 检查 mask 配置
    if (_.isUndefined(configs.mask)) return data
    let keys = Object.keys(configs.mask)
    // 当前角色没有配置隐藏字段
    if (keys.indexOf(user.role) < 0) return data
    let item = configs.mask[user.role]
    // 检查类型
    let names = []
    if (_.isString(item) && item !== '') names = item.split(',')
    else if (_.isArray(item)) names = item
    else $throwError('PropTypeError',null,null,[
        ['zh-cn', '隐藏字段配置必须是非空 String 或者 Array 类型'],
        ['en-us', 'Hidden fields config must be a non-empty String or an Array']
    ])
    // 抹掉字段
    let yon = false
    // 考虑 '*' 和 [] 两种情况
    if (fields === '*' || (_.isArray(fields) && fields.length === 0)) yon = true
    for (let i=0; i<fields.length; i++) {
        let field = fields[i]
        // 两种可能，字符串就是字段名
        if (_.isString(field)) {
            if (names.indexOf(field) >= 0) {
                yon = true
            }
        }
        // 对象的话就是别名表达
        if (_.isPlainObject(field)) {
            let key = field[Object.keys(field)[0]]
            if (names.indexOf(key) >= 0) {
                yon = true
                names.push(Object.keys(field)[0])
            }
        }
    }
    if (yon === true) {
        // 将字段抹掉
        for (let i=0; i<data.length; i++) {
            let row = data[i]
            _.forEach(names, (key) => {
                // 如果存在该字段就模糊化
                if (!_.isUndefined(row[key])) row[key] = '***'
            })
        }
    }
    return data
}
module.exports.scan = scan

/**
 * 检查当前用户是否拥有执行该操作的权限
 * @param {object} configs 数据表权限配置
 * @param {object} user 当前用户信息
 * @param {object} cmd 要执行的指令
 */
async function check(configs,user,cmd,target) {
    // 检查参数
    validator.checkAuth(configs)
    // 删改类型
    let controlTypes = [
        'update',
        'delete',
        'increase',
        'decrease'
    ]    
    let config = null
    switch (cmd.type) {
        case 'entity':
        case 'list':
        case 'values': {
            config = configs.select
            break
        }
        case 'create': {
            config = configs.create
            break
        }
        case 'delete': {
            config = configs.delete
            break
        }
        case 'update':
        case 'increase':
        case 'decrease': {
            config = configs.update
            break
        }
    }
    // console.log(config)
    let keys = Object.keys(config)
    // 角色没有配置视作无权限
    if (keys.indexOf(user.role) < 0) return false
    let item = config[user.role]
    // console.log(item)
    // 配置为 false，直接拒绝
    let allowForNow = false
    if (item === false) return false
    // 如果配置为 true，则需要检查数据有效性
    else if (item === true) allowForNow = true
    // 字符串说明是字段约定，如 'id=$id'
    else if (_.isString(item) && item !== '') {
        // 检查定义有效性
        let slices = item.split('=$')
        if (slices.length === 1 || slices.length > 2) $throwError('PropDefError',null,null,[
            ['zh-cn', `权限约定必须是 'id=$id' 的形式`],
            ['en-us', `The definition must be like 'id=$id' pattern`]
        ])
        if (slices[0] === '' || slices[1] === '') $throwError('PropDefError',null,null,[
            ['zh-cn', `符号 '=' 两侧都不能为空字符串`],
            ['en-us', `Neither left side nor right side around '=' can be empty String`]
        ])
        // 数据操作类型（update/increase/decrease/delete）的检查
        if (controlTypes.indexOf(cmd.type) >= 0) {
            // 通过与 user 的字段比对来判断是否当前用户所有
            let isOwner = true
            _.forEach(target, (row) => {
                // console.log(row)
                if (Object.keys(row).indexOf(slices[0]) >= 0) {
                    if (row[slices[0]] !== user[slices[1]]) isOwner = false
                }
                else isOwner = false
            })
            allowForNow = isOwner
            if (isOwner === false) $throwError('NotOwnerError',null,null,[
                ['zh-cn', '当前用户不是目标数据的持有者'],
                ['en-us', 'Current user is not the owner of target data']
            ])
        }
        // 如果是创建数据类型
        else if (cmd.type === 'create') {
            // 通过与 user 的字段比对来判断是否当前用户所有
            let isOwner = true
            _.forEach(cmd.data, (row) => {
                // console.log(row)
                if (Object.keys(row).indexOf(slices[0]) >= 0) {
                    if (row[slices[0]] !== user[slices[1]]) isOwner = false
                }
                else isOwner = false
            })
            allowForNow = isOwner
            if (isOwner === false) $throwError('NotOwnerError',null,null,[
                ['zh-cn', '用户只能创建属于自己的数据'],
                ['en-us', 'User can only create data of their own']
            ])
        }
        // 纯查询数据
        else {
            // 通过与 user 的字段比对来判断是否当前用户所有
            let isOwner = true
            _.forEach(target, (row) => {
                // console.log(row)
                if (Object.keys(row).indexOf(slices[0]) >= 0) {
                    if (row[slices[0]] !== user[slices[1]]) isOwner = false
                }
                else isOwner = false
            })
            if (isOwner === false) $throwError('NotOwnerError',null,null,[
                ['zh-cn', '当前用户不是目标数据的持有者'],
                ['en-us', 'Current user is not the owner of target data']
            ])
            // 查询无需进行有效性验证，直接返回
            else return true
        }
    }
    // 自定义函数
    else if (_.isFunction(item)) {
        // console.log(item)
        let yon = await $exec(item(user,cmd,target))
        if (yon.error) $throwError('NotOwnerError',yon.error,null,[
            ['zh-cn', '你没有进行当前操作的权限'],
            ['en-us', 'You are not allowed to do so']
        ])
        allowForNow = yon.data
        if (allowForNow === false) $throwError('NotOwnerError',null,null,[
            ['zh-cn', '你没有进行当前操作的权限'],
            ['en-us', 'You are not allowed to do so']
        ])
    }
    else $throwError('PropTypeError',null,null,[
        ['zh-cn', `权限配置有误，'${cmd.type}.${user.role}' 的值必须是非空字符串或者 Function 类型`],
        ['en-us', `Config definition is invalid, the value of '${cmd.type}.${user.role}' must be a non-empty String or a Function`]
    ])
    // 最后进行数据预处理及有效性验证
    // 先是 create 操作
    if (cmd.type === 'create') {
        // 先检查是否涉及冻结字段
        let freezedColumns = []
        if (_.isUndefined(configs.freeze)) {
            freezedColumns.push('createdAt')
            freezedColumns.push('updatedAt')
        }
        else {
            // 如果该角色没有定义 freeze 字段也要检查两个时间戳
            if (_.isUndefined(configs.freeze[user.role])) {
                freezedColumns.push('createdAt')
                freezedColumns.push('updatedAt')
            }
            // 定义格式错误
            else if (!_.isString(configs.freeze[user.role]) && !_.isArray(configs.freeze[user.role])) $throwError('InvalidDefError',null,null,[
                ['zh-cn', `角色 '${user.role}' 的冻结字段的定义有误`],
                ['en-us', `The 'freeze' definition for '${user.role}' is invalid`]
            ])
        }
        let hasFreezed = false
        let tryings = []
        let columns = []
        if (!_.isUndefined(configs.freeze) && !_.isUndefined(configs.freeze[user.role])) columns = configs.freeze[user.role].split(',')
        freezedColumns = _.concat(freezedColumns,columns)
        // create 的 data 是个数组
        _.forEach(cmd.data, (row) => {
            _.forEach(Object.keys(row), (key) => {
                if (freezedColumns.indexOf(key) >= 0) {
                    tryings.push(key)
                    hasFreezed = true
                }
            })
        })
        if (hasFreezed === true) $throwError('FreezedColumnError',null,null,[
            ['zh-cn', `新创建的数据中不能包含被冻结的数据字段 '${tryings.join(',')}'`],
            ['en-us', `New data to be created can not contain freezed columns '${tryings.join(',')}'`]
        ])
        // 然后进行数据预处理
        let needPrepare = false
        if (!_.isUndefined(configs.prepare)) {
            if (!_.isPlainObject(configs.prepare)) {
                needPrepare = true
                $throwError('InvalidDefError',null,null,[
                    ['zh-cn', `数据预处理模块必须是一个 Object 对象`],
                    ['en-us', `The 'prepare' module definition must be an Object`]
                ])
            }
            let funcs = Object.keys(configs.prepare)
            for (let i=0; i<cmd.data.length; i++) {
                let row = cmd.data[i]
                // func 是强制执行的，哪怕前端传来的数据没有这个字段
                for (let j=0; j<funcs.length; j++) {
                    let key = funcs[j]
                    row[key] = await configs.prepare[key](row[key],user)
                }
                // 自动设置数据生成和最后更新时间
                row.createdAt = new Date().toISOString()
                row.updatedAt = new Date().toISOString()
            }
        }
        else needPrepare = true
        if (needPrepare) {
            for (let i=0; i<cmd.data.length; i++) {
                let row = cmd.data[i]
                // 自动设置数据生成和最后更新时间
                row.createdAt = new Date().toISOString()
                row.updatedAt = new Date().toISOString()
            }
        }
        // 最后对字段有效性进行检查
        if (_.isUndefined(configs.verify)) return true
        let ruleKeys = Object.keys(configs.verify)
        let final = true
        let fails = []
        for (let i=0; i<cmd.data.length; i++) {
            let row = cmd.data[i]
            for (let j=0; j<Object.keys(row).length; j++) {
                let col = Object.keys(row)[j]
                // 需要验证的字段
                if (ruleKeys.indexOf(col) >= 0) {
                    let func = configs.verify[col]
                    // 枚举数组
                    if (_.isArray(func)) {
                        if (func.indexOf(row[col]) < 0) {
                            if (fails.indexOf(col) < 0) fails.push(col)
                            final = false
                        }
                    }
                    else if (_.isFunction(func)) {
                        let checked = await func(row[col],user)
                        if (checked === false) {
                            if (fails.indexOf(col) < 0) fails.push(col)
                            final = false
                        }
                    }
                    else $throwError('InvalidDefError',null,null,[
                        ['zh-cn', `有效性规则的定义有误`],
                        ['en-us', `The 'verify' definition is invalid`]
                    ])
                }
            }
        }
        fails = _.uniq(fails)
        if (final === false) $throwError('ValueCheckError',null,null,[
            ['zh-cn', `有不符合规则的数据，请检查下列字段 '${fails.join(',')}'`],
            ['en-us', `Some values are invalid, please check columns as follows '${fails.join(',')}'`]
        ])
        else return true
    }
    else if (cmd.type === 'update') {
        // 先检查是否涉及冻结字段
        let freezedColumns = []
        if (_.isUndefined(configs.freeze)) {
            freezedColumns.push('createdAt')
            freezedColumns.push('updatedAt')
        }
        else {
            // 如果该角色没有定义 freeze 字段也要检查两个时间戳
            if (_.isUndefined(configs.freeze[user.role])) {
                freezedColumns.push('createdAt')
                freezedColumns.push('updatedAt')
            }
            // 定义格式错误
            else if (!_.isString(configs.freeze[user.role]) && !_.isArray(configs.freeze[user.role])) $throwError('InvalidDefError',null,null,[
                ['zh-cn', `角色 '${user.role}' 的冻结字段的定义有误`],
                ['en-us', `The 'freeze' definition for '${user.role}' is invalid`]
            ])
        }
        let hasFreezed = false
        let tryings = []
        let columns = []
        if (!_.isUndefined(configs.freeze) && !_.isUndefined(configs.freeze[user.role])) columns = configs.freeze[user.role].split(',')
        freezedColumns = _.concat(freezedColumns,columns)
        // updata 的 data 是个 Object
        _.forEach(Object.keys(cmd.data), (key) => {
            if (freezedColumns.indexOf(key) >= 0) {
                tryings.push(key)
                hasFreezed = true
            }
        })
        if (hasFreezed === true) $throwError('FreezedColumnError',null,null,[
            ['zh-cn', `试图更新被冻结的数据字段 '${tryings.join(',')}'`],
            ['en-us', `You are trying to update some freezed columns '${tryings.join(',')}'`]
        ])
        // 然后进行数据预处理
        let needPrepare = false
        if (!_.isUndefined(configs.prepare)) {
            if (!_.isPlainObject(configs.prepare)) {
                needPrepare = true
                $throwError('InvalidDefError',null,null,[
                    ['zh-cn', `数据预处理模块必须是一个 Object 对象`],
                    ['en-us', `The 'prepare' module definition must be an Object`]
                ])
            }
            let funcs = Object.keys(configs.prepare)
            // func 是强制执行的，哪怕前端传来的数据没有这个字段
            for (let j=0; j<funcs.length; j++) {
                let key = funcs[j]
                cmd.data[key] = await configs.prepare[key](cmd.data[key],user)
            }
            // 自动设置数据最后更新时间
            cmd.data.updatedAt = new Date().toISOString()
        }
        else needPrepare = true
        if (needPrepare) {
            // 自动设置数据最后更新时间
            cmd.data.updatedAt = new Date().toISOString()
        }
        // 最后进行字段有效性检查
        if (_.isUndefined(configs.verify)) return true
        let ruleKeys = Object.keys(configs.verify)
        let final = true
        let fails = []
        // 更新类型的 data 只有一个对象
        for (let j=0; j<Object.keys(cmd.data).length; j++) {
            let col = Object.keys(cmd.data)[j]
            // 需要验证的字段
            if (ruleKeys.indexOf(col) >= 0) {
                let func = configs.verify[col]
                // 枚举数组
                if (_.isArray(func)) {
                    if (func.indexOf(cmd.data[col]) < 0) {
                        if (fails.indexOf(col) < 0) fails.push(col)
                        final = false
                    }
                }
                else if (_.isFunction(func)) {
                    let checked = await func(cmd.data[col],user)
                    if (checked === false) {
                        if (fails.indexOf(col) < 0) fails.push(col)
                        final = false
                    }
                }
                else $throwError('InvalidDefError',null,null,[
                    ['zh-cn', `有效性规则的定义有误`],
                    ['en-us', `The 'verify' definition is invalid`]
                ])
            }
        }
        fails = _.uniq(fails)
        if (final === false) $throwError('ValueCheckError',null,null,[
            ['zh-cn', `有不符合规则的数据，请检查下列字段 '${fails.join(',')}'`],
            ['en-us', `Some values are invalid, please check columns as follows '${fails.join(',')}'`]
        ])
        else return true
    }
    else return true
}
module.exports.check = check
