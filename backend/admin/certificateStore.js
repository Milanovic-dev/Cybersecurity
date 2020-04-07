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

    fs.writeFileSync(cert_path, JSON.stringify(certificate));
    fs.writeFileSync(pk_path, JSON.stringify(privateKey));
    
    let certObj = parseCertificate(certificate);

    let result = await db.collection('certificates').insertOne({
        'certPath': cert_path,
        'pkPath': pk_path,
        'serialNumber': certObj.serialNumber,
        'commonName': certObj.issuer.commonName,
        'parent': parentId,
    });
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

const fetchTree = async (fromRoot) => {
    let nodes = await db.collection('certificates').find({parent: fromRoot}).sort({_id:-1}).toArray();

    for(let i = 0 ; i < nodes.length ; i++){
        let id = nodes[i]._id;
        nodes[i] = fetchFromFiles(nodes[i]);
        nodes[i].children = await fetchTree(id);
    }

    return nodes;
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
    };
};

const remove = async (id) =>{
    if(id.length != 24){
        return {errorStatus: 400}
    }

    let dbCertificateObject = await db.collection('certificates').findOne({
        _id: ObjectID(id)
    });

    try{
        fs.unlinkSync(dbCertificateObject.certPath);
        fs.unlinkSync(dbCertificateObject.pkPath);

        db.collection('certificates').deleteOne({
            _id : dbCertificateObject._id
        });

        return dbCertificateObject;

    }catch(err){
        console.error(err);
        return {errorStatus: 500}
    }
}

const CertificateStore = {
    storeAsync: store,
    fetchAsync: fetch,
    fetchTreeAsync: fetchTree,
    removeAsync: remove
}

export default CertificateStore;