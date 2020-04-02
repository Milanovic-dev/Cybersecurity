const dbAuth = {
    username: 'root',
    password: 'lEsjcYm#~PJdK9iL',
    dbName: 'cybersecurity_db',
    server: '127.0.0.1:27017'
}

const dbAuthTest = {
    username: 'root',
    password: 'lEsjcYm#~PJdK9iL',
    dbName: 'cybersecurity_db',
    server: '127.0.0.1:27017'
}

//db.createUser( { user: "root", pwd: "lEsjcYm#~PJdK9iL", roles: [ { role: "readWrite", db: "cybersecurity_db" } ] } )



var isInTest = typeof global.it === 'function';


module.exports = {
    dbAuth: isInTest ? dbAuthTest : dbAuth
}