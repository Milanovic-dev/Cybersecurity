const express = require("express");
const http = require("http");
const port = process.env.PORT || 4000;
const cors = require('cors')
const bodyParser = require("body-parser");
const fs = require("fs");
const adminModule = new (require('./admin/admin'))();
const {generateCertificate, parseCertificate} = require('./certificateBuilder/builder');

const isAdminAuthenticated = require('./admin/auth');

const exampleModule = new (require('./example/example'))();

const logger = function (req, res, next) {



    console.log(req.headers);
    next(); // Passing the request to the next handler in the stack.
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use('/uploads', express.static('uploads'))
app.use(logger);
const server = http.createServer(app);

server.listen(port, () => console.log(`Listening on port ${port}`));


/*
    ADMIN API ROUTES
*/


app.post('/admin/login', async (req, res) => {
    let result = await adminModule.login(req.body.username, req.body.password);
    res.status(result.status).send(result.response);
});

app.post('/admin/verify', isAdminAuthenticated, (req, res) => {
    res.send({ valid: true }).status(200);
});


/*
    READ WRITE DB EXAMPLE

*/

app.get('/example/insert', async (req, res) => {
    let result = await exampleModule.insert();
    res.status(result.status).send(result.response);
});

app.get('/example/update/:id/:someValue', async (req, res) => {
    let result = await exampleModule.update(req.params.id, req.params.someValue);
    res.status(result.status).send(result.response);
});

app.get('/example/query', async (req, res) => {
    res.status(200).send(await exampleModule.query());
});



async function test(){
    let rootResult = await generateCertificate({
        serialNumber: 1,
        issuer: {
            country: 'BA',
            organizationName: 'CybersecurityRoot',
            organizationalUnit: 'Test',
            commonName: 'CybersecurityRoot',
            localityName: 'Bijeljina',
            stateName: 'RS',
            email: 'stanojevic.milan97@gmail.com'
        },
        subject: {
            country: 'BA',
            organizationName: 'CybersecurityRoot',
            organizationalUnit: 'Test',
            commonName: 'CybersecurityRoot',
            localityName: 'Bijeljina',
            stateName: 'RS',
            email: 'stanojevic.milan97@gmail.com'
        },
        validFrom: new Date(2020, 1, 1),
        validTo: new Date(2021, 1, 1),
        basicConstraints: {
            isCA: true,
            pathLengthConstraint: 2
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
    }, null);


    fs.writeFileSync('root.crt', rootResult.certificate);
    fs.writeFileSync('root.key', rootResult.privateKey);

    let intermediateResult = await generateCertificate({
        serialNumber: 2,
        subject: {
            country: 'BA',
            organizationName: 'CybersecurityIntermediate',
            organizationalUnit: 'Test',
            commonName: 'CybersecurityIntermediate',
            localityName: 'Bijeljina',
            stateName: 'RS',
            email: 'stanojevic.milan97@gmail.com'
        },
        validFrom: new Date(2020, 1, 1),
        validTo: new Date(2021, 1, 1),
        basicConstraints: {
            isCA: true,
            pathLengthConstraint: 1
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
    }, rootResult.certificate, rootResult.privateKey );


    fs.writeFileSync('intermediate.crt', intermediateResult.certificate);
    fs.writeFileSync('intermediate.key', intermediateResult.privateKey);


    let endEntityResult = await generateCertificate({
        serialNumber: 3,
        subject: {
            country: 'BA',
            organizationName: 'CybersecurityEndEntity',
            organizationalUnit: 'Test',
            commonName: 'localhost',
            localityName: 'Bijeljina',
            stateName: 'RS',
            email: 'stanojevic.milan97@gmail.com'
        },
        validFrom: new Date(2020, 1, 1),
        validTo: new Date(2021, 1, 1),
        basicConstraints: {
            isCA: false,
            pathLengthConstraint: null
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
    }, intermediateResult.certificate, intermediateResult.privateKey );


    fs.writeFileSync('endEntity.crt', endEntityResult.certificate);
    fs.writeFileSync('endEntity.key', endEntityResult.privateKey);


    //console.log(result.certificate);
    //console.log(JSON.stringify( await parseCertificate(fs.readFileSync('test.cer', 'utf8')), null ,4) )
    
    //console.log(parseCertificate(result.certificate));
}

test();


export default app;