const ObjectID = require('mongodb').ObjectID;

let db;
const dbConnect = require('../db');
dbConnect()
    .then((conn) => {
        db = conn;
    })
    .catch((e) => {
        console.log('DB error')
    })

class Example {
    constructor(props) {

    }



    async query() {
        return await db.collection('testCollection').find({
            /*
                query
            */
        }).sort({ _id: -1 }).toArray();
    }


    async insert() {
        await db.collection('testCollection').insertOne({
            timestamp: Math.floor(new Date().getTime() / 1000),
            someKey: 'someValue'
        })

        return {
            response: { error: null },
            status: 200
        }
    }

    async update(id, someValue) {
        await db.collection('testCollection').updateOne(
            {
                _id: ObjectID(id)
            },
            {
                $set: {
                    someKey: someValue
                }
            })

        return {
            response: { error: null },
            status: 200
        }

    }
}

module.exports = Example;