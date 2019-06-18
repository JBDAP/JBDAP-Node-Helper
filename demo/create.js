const knex = require('knex')
const helper = require('../lib/Helper')

let conn = knex({
    client: 'sqlite3',
    connection: {
        filename: __dirname + '/test.sqlite'
    },
    useNullAsDefault: true,
    asyncStackTraces: true,
    debug: false
})

let role = {
    name: 'Role',
    columns: [
        {
            name: 'id',
            type: 'increments',
            primary: true
        },
        {
            name: 'name',
            type: 'string',
            length: 100,
            notNullable: true
        },
        {
            name: 'definition',
            type: 'text'
        },
        {
            name: 'createdAt',
            type: 'datetime'
        }
    ],
    uniques: [
        ['name']
    ]
}

let user = {
    name: 'User',
    columns: [
        {
            name: 'id',
            type: 'increments',
            primary: true
        },
        {
            name: 'roleId',
            type: 'integer',
            notNullable: true,
            unsigned: true,
            defaultTo: 0
        },
        {
            name: 'level',
            type: 'string',
            length: 100,
            notNullable: true
        },
        {
            name: 'username',
            type: 'string',
            length: 100,
            notNullable: true
        },
        {
            name: 'gender',
            type: 'string',
            length: 100,
            defaultTo: 'male'
        },
        {
            name: 'createdAt',
            type: 'datetime'
        }
    ],
    uniques: [
        ['level','username']
    ],
    indexes: [
        ['level'],
        ['username']
    ],
    foreignKeys: [
        {
            selfColumn: 'roleId',
            targetTable: 'Role',
            targetColumn: 'id'
        }
    ]
}

let tables = [
    user,
    role,
]

helper.createTables(conn,tables).then(() => {
    console.log('done')
    process.exit()
})
.catch((err) => {
    console.log(err.fullStack())
    process.exit()
})