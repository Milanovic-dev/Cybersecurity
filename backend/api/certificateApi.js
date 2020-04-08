import CertificateStore from '../admin/certificateStore';
const {generateCertificate} = require('../certificateBuilder/builder');
let fs = require('fs');
import Moment from 'moment';



module.exports = function(app){

    let db;
const dbConnect = require('../db');
dbConnect()
    .then((conn) => {
        db = conn;
        //db.collection('certificates').drop();
    })
    .catch((e) => {
        console.log('DB error')
    })


    //POST
    app.post('/certificate/create/:parentId', async (req, res) => {
        let reqBody = req.body;

        if(reqBody == undefined){
            res.status(400).send();
        }
        reqBody.validFrom= new Date(2020, 1, 1);
        reqBody.validTo= new Date(2021, 1, 1);
        //reqBody.validForm = Moment.unix(reqBody.validForm).toDate();
        //reqBody.validTo = Moment.unix(reqBody.validTo).toDate();

        let result = await generateCertificate(reqBody);
        await CertificateStore.storeAsync(result, req.params.parentId);
        res.status(200).send();
    });

    //GET
    app.get('/certificate/get/:id', async (req, res) => {
        let id = req.params.id;
        let result = await CertificateStore.fetchAsync(id);

        if(result.errorStatus){
            res.status(result.errorStatus).send();
        }

        res.status(200).send(result);
    });

    app.get('/certificate/getTree', async (req, res) => {
        let tree = await CertificateStore.fetchTreeAsync('null');
        res.status(200).send(tree);
    });

    app.get('/certificate/getTree/:rootId', async (req, res) => {
        let rootId = req.params.rootId;
        let tree = await CertificateStore.fetchTreeAsync(rootId);
        res.status(200).send(tree);
    });

    //DELETE
    app.delete('/certificate/drop/', async (req, res) => {
        await CertificateStore.dropAsync();

        res.status(200).send();
    });

}

//Mock object
async function getCertificateTest(){
    let result = await generateCertificate({
        serialNumber: 1,
        issuer: {
            country: 'BA',
            organizationName: 'Test',
            organizationalUnit: 'Test',
            commonName: 'localhost',
            localityName: 'Bijeljina',
            stateName: 'BiH',
            email: 'stanojevic.milan97@gmail.com'
        },
        subject: {
            country: 'SR',
            organizationName: 'FTN',
            organizationalUnit: 'Test',
            commonName: 'localhost',
            localityName: 'Novi Sad',
            stateName: 'Serbia',
            email: 'stanojevic.milan97@gmail.com'
        },

        validFrom: new Date(2020, 1, 1),
        validTo: new Date(2021, 1, 1),
        basicConstraints: {
            isCA: true,
            pathLengthConstraint: 3
        },
        extendedKeyUsage: [
            "anyExtendedKeyUsage",
            "serverAuth",
            "clientAuth",
            "codeSigning",
            "emailProtection",
            "timeStamping",
            "OCSPSigning",
            "MicrosoftCertificateTrustListSigning",
            "MicrosoftEncryptedFileSystem"
        ]    
    });
    return result;
}