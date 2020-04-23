const express = require("express");
const port = process.env.PORT || 4000;
const ocspPort = 8080
const cors = require('cors')
const bodyParser = require("body-parser");
const fs = require("fs");
const adminModule = new (require('./admin/admin'))();
const {generateCertificate, parseCertificate, parsePKCS12} = require('./certificateBuilder/builder');
const isAdminAuthenticated = require('./admin/auth');


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.raw({
    type: function (req) { return req.headers['content-type'] === 'application/ocsp-request' },
}))

const options = {
    ca: [fs.readFileSync('intermediate.crt'), fs.readFileSync('root.crt')],
    cert: fs.readFileSync('endEntity.crt'),
    key: fs.readFileSync('endEntity.key')
};

const https = require("https");
const server = https.createServer(options, app);
const api = require('./api/certificateApi') (app);
server.listen(port, () => console.log(`Server Listening on port ${port}`));


const appOCSP = express();
appOCSP.use(cors());
appOCSP.use(bodyParser.json({ limit: '20mb' }));
appOCSP.use('/uploads', express.static('uploads'))
appOCSP.use(bodyParser.raw({
    type: function (req) { return req.headers['content-type'] === 'application/ocsp-request' },
}))
const httpOCSP = require('http');
const serverOCSP = httpOCSP.createServer(appOCSP);
const ocspApi = require('./ocsp/ocsp')(appOCSP);
serverOCSP.listen(ocspPort, () => console.log(`OCSP Server listening on port ${ocspPort}`))



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


app.get('/certificate/test', async (req, res) => {
    let cert = await getCertificateTest();
    res.status(200).send(parseCertificate(cert.certificate));
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
    }, null, null, 'keystorepassword');

    //fs.writeFileSync('test.p12', Buffer.from(rootResult) );
    //console.log(rootResult);
    let res = await parsePKCS12(rootResult, "keystorepassword");
    console.log(res);
    
}

test();

export default app;