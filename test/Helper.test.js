const Helper = require('../src/Helper')

global.$i18nLanguage = 'zh-cn'

test('测试 scan 方法', () => {
    let configs = {
        name: 'test',
        select: {},
        create: {},
        update: {},
        delete: {}
    }
    let user = {
        id: 0,
        role: 'default'
    }
    let fields = []
    let data = [
        {
            id: 1,
            username: '123',
            password: 'pass123',
            email: null
        }
    ]
    // configs 为 undefined
    try {
        Helper.scan(undefined,user,fields,data)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/参数必须是 Object 对象/)
    }
    // mask 为 undefined
    expect(Helper.scan(configs,user,fields,data)).toEqual(data)
    // mask 类型错误
    configs.mask = 123
    try {
        Helper.scan(configs,user,fields,data)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/属性必须是一个 Object 对象/)
    }
    // config 的 role 未定义
    configs.mask = {}
    expect(Helper.scan(configs,user,fields,data)).toEqual(data)
    // config 的 role 定义成空字符串
    configs.mask = {
        default: ''
    }
    try {
        Helper.scan(configs,user,fields,data)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/必须是非空 String 或者 Array 类型/)
    }
    // config 的 role 是非法类型
    configs.mask = {
        default: 123
    }
    try {
        Helper.scan(configs,user,fields,data)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/必须是非空 String 或者 Array 类型/)
    }
    // config 的 role 定义正常
    configs.mask = {
        default: 'password'
    }
    expect(Helper.scan(configs,user,fields,data)[0].password).toEqual('***')
    configs.mask = {
        default: ['password']
    }
    expect(Helper.scan(configs,user,fields,data)[0].password).toEqual('***')
    configs.mask = {
        default: '*'
    }
    expect(Helper.scan(configs,user,fields,data)[0].password).toEqual('***')
    configs.mask = {
        default: []
    }
    expect(Helper.scan(configs,user,fields,data)[0].password).toEqual('***')
})

test('测试 check 方法', async () => {
    let auth = {
        name: 'test',
        select: {
            default: false,
            user: '',
            admin: true
        },
        create: {
            default: true,
            user: false,
            admin: true
        },
        update: {
            default: false,
            user: '',
            admin: true
        },
        delete: {}
    }
    let user = {
        id: 0,
        role: 'default'
    }
    let cmd = {
        type: 'list'
    }
    let target = [
        {
            id: 1,
            username: '123',
            password: 'pass123',
            email: null
        }
    ]
    let data = [
        {
            id: 1,
            username: '123',
            type: 'vip',
            password: 'pass123',
            email: null
        }
    ]
    expect.assertions(18)
    // 纯查询
    // default
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(false)
    // user
    user.id = 1
    user.role = 'user'
    // 配置错误
    let res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.error.name).toBe('PropTypeError')
    expect(res.error.fullMessage()).toMatch(/必须是非空字符串或者 Function 类型/)
    // 一切正常
    auth.select.user = 'id=$id'
    res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.data).toBe(true)
    // admin
    user.role = 'admin'
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(true)

    // create 操作
    cmd.type = 'create'
    user.role = 'default'
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(true)
    // 数据有效性不通过
    auth.verify = {
        type: ['user','vip'],
        email: async function(val) {
            return val !== null
        }
    }
    res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.error.name).toBe('ValueCheckError')
    expect(res.error.fullMessage()).toMatch(/有不符合规则的数据/)
    // 有效性校验通过
    data = [
        {
            id: 1,
            username: '123',
            type: 'vip',
            password: 'pass123',
            email: ''
        }
    ]
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(true)

    // update 操作
    cmd.type = 'update'
    user.role = 'default'
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(false)
    user.role = 'admin'
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(true)
    // 一切正常
    user.role = 'user'
    user.id = 1
    auth.update.user = 'id=$id'
    expect(await Helper.check(auth,user,cmd,target,data)).toEqual(true)
    // 用户验证配置错误
    auth.update.user = 'id=$sid'
    res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.error.name).toBe('NotOwnerError')
    expect(res.error.fullMessage()).toMatch(/当前用户不是目标数据的持有者/)
    // 检查是否有冻结字段
    auth.freeze = {
        user: 'password'
    }
    data = data[0]
    auth.update.user = 'id=$id'
    res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.error.name).toBe('FreezedColumnError')
    expect(res.error.fullMessage()).toMatch(/试图改变被冻结的数据字段/)
    auth.update.user = true
    res = await $exec(Helper.check(auth,user,cmd,target,data))
    expect(res.error.name).toBe('FreezedColumnError')
    expect(res.error.fullMessage()).toMatch(/试图改变被冻结的数据字段/)

})
