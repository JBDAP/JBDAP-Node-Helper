const validator = require('../src/validator')

global.$i18nLanguage = 'zh-cn'

test('测试 checkSchema 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/参数必须是 Object 对象/)
    }
    // 缺 name
    json = {}
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // name 为空
    json = {
        name: ''
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // 缺 columns
    json = {
        name: 'test'
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'columns'/)
    }
    // columns 为空数组
    json = {
        name: 'test',
        columns: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'columns'/)
    }
    // unique 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'unique'/)
    }
    // indexes 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'indexes'/)
    }
    // foreignKeys 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'foreignKeys'/)
    }
    // 无效属性
    json = {
        tst: '123',
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('InvalidPropError')
        expect(err.fullMessage()).toMatch(/'tst'/)
    }
    // 完全正常
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: [{}]
    }
    expect(validator.checkSchema(json)).toBe(true)
})

test('测试 checkColumn 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/参数必须是 Object 对象/)
    }
    // 缺 name
    json = {}
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // name 类型不对
    json = {
        name: 123
    }
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // name 为空
    json = {
        name: ''
    }
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // 缺 type
    json = {
        name: 'test'
    }
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'type'/)
    }
    // type 类型不对
    json = {
        name: 'test',
        type: []
    }
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'type'/)
    }
    // type 为空字符串
    json = {
        name: 'test',
        type: ''
    }
    try {
        validator.checkColumn(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'type'/)
    }
    // 完全正常
    json = {
        name: 'test',
        type: 'string'
    }
    expect(validator.checkColumn(json)).toBe(true)
})

test('测试 checkForeignKey 方法', () => {
    expect(validator.checkForeignKey(undefined)).toBe(true)
    // 整个参数不对
    let json = []
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/参数必须是 Object 对象/)
    }
    // 缺 selfColumn
    json = {}
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'selfColumn'/)
    }
    // selfColumn 类型不对
    json = {
        selfColumn: 123
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'selfColumn'/)
    }
    // selfColumn 为空
    json = {
        selfColumn: ''
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'selfColumn'/)
    }
    // 缺 targetTable
    json = {
        selfColumn: 'userId'
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetTable'/)
    }
    // targetTable 类型不对
    json = {
        selfColumn: 'userId',
        targetTable: 123
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetTable'/)
    }
    // selfColumn 为空
    json = {
        selfColumn: 'userId',
        targetTable: ''
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetTable'/)
    }
    // 缺 targetColumn
    json = {
        selfColumn: 'userId',
        targetTable: 'post'
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetColumn'/)
    }
    // targetColumn 类型不对
    json = {
        selfColumn: 'userId',
        targetTable: 'post',
        targetColumn: 123
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetColumn'/)
    }
    // selfColumn 为空
    json = {
        selfColumn: 'userId',
        targetTable: 'post',
        targetColumn: ''
    }
    try {
        validator.checkForeignKey(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'targetColumn'/)
    }
    // 完全正常
    json = {
        selfColumn: 'userId',
        targetTable: 'post',
        targetColumn: 'id'
    }
    expect(validator.checkForeignKey(json)).toBe(true)
})

test('测试 checkAuth 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/参数必须是 Object 对象/)
    }
    // 缺 name
    json = {}
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // name 为空
    json = {
        name: ''
    }
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'name'/)
    }
    // 无效属性
    json = {
        stupid: 'test'
    }
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('InvalidPropError')
        expect(err.fullMessage()).toMatch(/不是有效属性/)
    }
    // 缺 select
    json = {
        name: 'test'
    }
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/属性必须定义/)
    }
    // select 非 object
    json = {
        name: 'test',
        select: '1223'
    }
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/属性必须是一个 Object 对象/)
    }
    // verify 非 object
    json = {
        name: 'test',
        verify: '123',
        select: {},
        create: {},
        update: {},
        delete: {}
    }
    try {
        validator.checkAuth(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/属性必须是一个 Object 对象/)
    }





    // columns 为空数组
    json = {
        name: 'test',
        columns: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'columns'/)
    }
    // unique 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'unique'/)
    }
    // indexes 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'indexes'/)
    }
    // foreignKeys 为空数组
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('PropDefError')
        expect(err.fullMessage()).toMatch(/'foreignKeys'/)
    }
    // 无效属性
    json = {
        tst: '123',
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: []
    }
    try {
        validator.checkSchema(json)
    }
    catch (err) {
        expect(err.name).toBe('InvalidPropError')
        expect(err.fullMessage()).toMatch(/'tst'/)
    }
    // 完全正常
    json = {
        name: 'test',
        columns: [{}],
        unique: [''],
        indexes: [[]],
        foreignKeys: [{}]
    }
    expect(validator.checkSchema(json)).toBe(true)
})
