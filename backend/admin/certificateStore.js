const fs = require('fs');
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'querystring';
const {parseCertificate, parsePKCS12} = require('../certificateBuilder/builder');
const {buf2ab} = require('../certificateBuilder/parse');
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


let collName = 'certificates';

const store = async (buffer, parentId) => {
    let fileId = uuidv4();

    let cert_path = 'certificates/'+ fileId + '.p12';

    if(!fs.existsSync('certificates')){
        fs.mkdirSync('certificates');
    }

    const certKeyObject = await parsePKCS12(buffer, 'keystorepassword');

    try{
        fs.writeFileSync(cert_path, Buffer.from(buffer));

        let certObj = parseCertificate(certKeyObject.certificate);
    
        let result = await db.collection(collName).insertOne({
            'certPath': cert_path,
            'serialNumber': parseInt(certObj.serialNumber, 10),
            'commonName': certObj.issuer.commonName,
            'parent': parentId,
            'revoked': null
        });
        return {status: 200, insertedId: result.insertedId};
    } catch(err){
        console.error(err);
        return {status: 500};
    }

}

/**
 * @param {*} id Id of certificate.
 * @return {Object}  Returns json with keys: certificate, privateKey, serialNumber, commonName
 */
const fetch = async (id) => {

    if(id.length != 24){
        return {errorStatus: 400}
    }

    let dbCertificateObject = await db.collection(collName).findOne({
        _id: ObjectID(id),
    });

    if(!dbCertificateObject){
        return {errorStatus: 404}
    }
    
    let result = await fetchFromFiles(dbCertificateObject);

    return result;
}

const fetchTreeInternal = async (fromRoot) => {
    let nodes = await db.collection(collName).find({"parent" : fromRoot}).sort({_id:-1}).toArray();
    
    for(let i = 0 ; i < nodes.length ; i++){
        nodes[i] = await fetchFromFiles(nodes[i]);
        nodes[i].children = await fetchTreeInternal(nodes[i].id.toString());
    }

    return nodes;
}

const fetchTree = async (fromRoot) => {
    let result = await fetchTreeInternal(fromRoot);
      
    let rootObject = await CertificateStore.fetchAsync(fromRoot);
    rootObject.children = result;

    return rootObject;
};


const fetchFromFiles = async (dbCertificateObject) => {
    if(!dbCertificateObject){
        console.error('dbCertificateObject is undefined.');
        return;
    }

    let buffer = buf2ab(fs.readFileSync(dbCertificateObject.certPath));
    
    let certKeyObject = await parsePKCS12(buffer, 'keystorepassword');

    if(!certKeyObject){
        console.error('Could not read certificate from file: ' + dbCertificateObject.certPath);
        return;
    }

    return {
        id: dbCertificateObject._id,
        parsedCertificate: parseCertificate(certKeyObject.certificate), 
        certificate: certKeyObject.certificate,
        privateKey: certKeyObject.privateKey, 
        parent: dbCertificateObject.parent,
        revoked: dbCertificateObject.revoked
    };
};

const drop = async () =>{
    let certificates = await db.collection(collName).find({}).toArray();

    for(let i = 0 ; i < certificates.length ; i++){
        try{
            if(fs.existsSync(certificates[i].certPath))
            fs.unlinkSync(certificates[i].certPath);
        }
        catch(err){
            console.error(err);
        }
    }
    try{
        db.listCollections({name: collName})
        .next(function(err, collinfo) {
            if (collinfo) {
                db.collection(collName).drop();
            }
        });
    }
    catch(err){
        console.warn(err);
    }
}

const fetchRoots = async () => {
    let nodes = await db.collection(collName).find({"parent" : null}).sort({_id:-1}).toArray();

    for(let i = 0 ; i < nodes.length ; i++){
        nodes[i] = await fetchFromFiles(nodes[i]);
    }

    return nodes;
}

const fetchUpToRoot = async (serialNumber) => {
    let current = await db.collection(collName).findOne({"serialNumber": parseInt(serialNumber,10)});
    
    if(current == null){
        return null;
    }

    let parent = current.parent;
    let first = await fetchFromFiles(current);
    let ret = [first];

    while(parent != null){
        current = await db.collection(collName).findOne({"_id": ObjectID(parent)});
        let obj = await fetchFromFiles(current);
        ret.push(obj);
        parent = current.parent;
    }

    return ret;
}

const revokeOne = async (id, date) => {
    await db.collection(collName).updateOne(
        {
            _id: ObjectID(id)
        },
        {
            $set: {
                revoked: date
            }
        })
}

const restoreOne = async (id) => {
    await db.collection(collName).updateOne(
        {
            _id: ObjectID(id)
        },
        {
            $set: {
                revoked: null
            }
        })
}

const fetchChildren = async (id) => {
    let children = await db.collection(collName).find({"parent" : id}).sort({_id:-1}).toArray();
    return children;
}


const fetchCount = async () => {
    let count = await db.collection(collName).count();
    return count;
}

const CertificateStore = {
    storeAsync: store,
    fetchAsync: fetch,
    fetchTreeAsync: fetchTree,
    dropAsync: drop,
    fetchRootsAsync: fetchRoots,
    fetchUpToRootAsync: fetchUpToRoot,
    revokeOneAsync : revokeOne,
    restoreOneAsync : restoreOne,
    fetchChildrenAsync: fetchChildren,
    fetchCountAsync: fetchCount
}

export default CertificateStore;