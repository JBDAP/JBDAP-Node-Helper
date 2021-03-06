/**
 * JBDAP 运行环境准备
 */

// 开发环境准备，即 global.$JBDAP_SYS
if (!global.JBDAP_GLOBAL_OK) require('jbdap-global')
let JS = global.$JBDAP_SYS

// JBDAP 运行环境配置准备
if (!global.$JBDAP_ENV) global.$JBDAP_ENV = {
    i18nLang: 'zh-cn',     // 运行环境默认语言
    dbServer: 'unknown',   // 数据库名称
    primaryKey: 'id'       // 数据表主键名
}
let JE = global.$JBDAP_ENV

// 全局抛错函数
JS.throwError = function (name,cause,info,dict,lang) {
    // 默认语言
    if (lang == undefined) lang = JE.i18nLang
    JS.throwErrorI18N(name,cause,info,dict,lang)
}

module.exports.JS = JS
module.exports.JE = JE
