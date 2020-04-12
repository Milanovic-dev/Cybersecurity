import CertificateStore from '../admin/certificateStore';
import CertificateService from '../admin/certificateService';
const {generateCertificate} = require('../certificateBuilder/builder');
let fs = require('fs');



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
    app.post('/certificate/createRoot', async (req, res) => {
        let result = await CertificateService.createCertificateAsync(req.body, null);    
        res.status(result.status).send(result.response);
    });

    app.post('/certificate/create/:parentId', async (req, res) => {
        let result = await CertificateService.createCertificateAsync(req.body, req.params.parentId);
        res.status(result.status).send(result.response);
    });

     //PUT
    app.put('/certificate/revoke/:id', async (req, res) => {
        let result = await CertificateService.revokeAsync(req.params.id);
        res.status(result.status).send();
    });

    app.put('/certificate/restore/:id', async (req, res) => {
        let result = await CertificateService.restoreAsync(req.params.id);
        res.status(result.status).send();
    });

    //GET
    app.get('/certificate/getOne/:id', async (req, res) => {
        let result = await CertificateService.fetchCertificateAsync(req.params.id);
        res.status(result.status).send(result.response);
    });

    app.get('/certificate/getAll', async (req, res) => {
        let result = await CertificateService.fetchCertificateTreesAsync();
        res.status(result.status).send(result.response);
    });

    app.get('/certificate/getAll/:rootId', async (req, res) => {
        let result = await CertificateService.fetchCertificateTreeAsync(req.params.rootId);
        res.status(result.status).send(result.response);
    });

    app.get('/certificate/getUpToRoot/:serialNumber', async (req, res) => {
        let result = await CertificateService.fetchUpToRootAsync(req.params.serialNumber);
        res.status(result.status).send(result.response);
    });

    //DELETE
    app.delete('/certificate/drop', async (req, res) => {
        await CertificateService.removeAll();
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