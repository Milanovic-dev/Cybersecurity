const fs = require('fs');
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'querystring';
const {parseCertificate} = require('../certificateBuilder/builder');
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

const store = async ({certificate, privateKey}, parentId) => {
    let certUuid = uuidv4();
    let pkUuid = uuidv4();

    let cert_path = 'certificates/'+ certUuid + '.cert';
    let pk_path = 'privateKeys/'+ pkUuid + '.pk'

    if(!fs.existsSync('certificates')){
        fs.mkdir('certificates');
    }

    if(!fs.existsSync('privateKeys')){
        fs.mkdir('privateKeys');
    }

    try{
        fs.writeFileSync(cert_path, JSON.stringify(certificate));
        fs.writeFileSync(pk_path, JSON.stringify(privateKey));
        
        let certObj = parseCertificate(certificate);
    
        let result = await db.collection('certificates').insertOne({
            'certPath': cert_path,
            'pkPath': pk_path,
            'serialNumber': parseInt(certObj.serialNumber, 10),
            'commonName': certObj.issuer.commonName,
            'parent': parentId,
            'revoked': null
        });
        console.log(result.insertedId);
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

    let dbCertificateObject = await db.collection('certificates').findOne({
        _id: ObjectID(id)
    });

    if(!dbCertificateObject){
        return {errorStatus: 404}
    }
    
    return fetchFromFiles(dbCertificateObject);
}

const fetchTreeInternal = async (fromRoot) => {
    let nodes = await db.collection('certificates').find({"parent" : fromRoot}).sort({_id:-1}).toArray();
    
    for(let i = 0 ; i < nodes.length ; i++){
        nodes[i] = fetchFromFiles(nodes[i]);
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


const fetchFromFiles = (dbCertificateObject) => {
    if(!dbCertificateObject){
        console.error('dbCertificateObject is undefined.');
        return;
    }

    let certificate = JSON.parse(fs.readFileSync(dbCertificateObject.certPath));
    let privateKey = JSON.parse(fs.readFileSync(dbCertificateObject.pkPath));

    if(!certificate){
        console.error('Could not read certificate from file: ' + dbCertificateObject.certPath);
        return;
    }

    if(!privateKey){
        console.error('Could not read private key from file: ' + dbCertificateObject.pkPath);
        return;
    }

    return {
        id: dbCertificateObject._id,
        parsedCertificate: parseCertificate(certificate), 
        certificate: certificate,
        privateKey: privateKey, 
        parent: dbCertificateObject.parent,
        revoked: dbCertificateObject.revoked
    };
};

const drop = async () =>{
    let certificates = await db.collection('certificates').find({}).toArray();

    for(let i = 0 ; i < certificates.length ; i++){
        try{
            if(fs.existsSync(certificates[i].certPath))
            fs.unlinkSync(certificates[i].certPath);

            if(fs.existsSync(certificates[i].pkPath))
            fs.unlinkSync(certificates[i].pkPath);

        }
        catch(err){
            console.error(err);
        }
    }
    try{
        await db.collection('certificates').drop();
    }
    catch(err){
        console.warn(err);
    }
}

const fetchRoots = async () => {
    let nodes = await db.collection('certificates').find({"parent" : null}).sort({_id:-1}).toArray();

    for(let i = 0 ; i < nodes.length ; i++){
        nodes[i] = fetchFromFiles(nodes[i]);
    }

    return nodes;
}

const fetchUpToRoot = async (serialNumber) => {
    let current = await db.collection('certificates').findOne({"serialNumber": parseInt(serialNumber,10)});
    
    if(current == null){
        return null;
    }

    let parent = current.parent;
    let ret = [fetchFromFiles(current)];

    while(parent != null){
        current = await db.collection('certificates').findOne({"_id": ObjectID(parent)});
        ret.push(fetchFromFiles(current));
        parent = current.parent;
    }

    return ret;
}

const revokeOne = async (id, date) => {
    await db.collection('certificates').updateOne(
        {
            _id: ObjectID(id)
        },
        {
            $set: {
                revoked: date
            }
        })
}

const fetchChildren = async (id) => {
    let children = await db.collection('certificates').find({"parent" : id}).sort({_id:-1}).toArray();
    return children;
}


const fetchCount = async () => {
    let count = await db.collection('certificates').count();
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
    fetchChildrenAsync: fetchChildren,
    fetchCountAsync: fetchCount
}

export default CertificateStore;