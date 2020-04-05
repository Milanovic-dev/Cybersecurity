const express = require("express");
const http = require("http");
const port = process.env.PORT || 4000;
const cors = require('cors')
const bodyParser = require("body-parser");

const adminModule = new (require('./admin/admin'))();
const {generateCertificate} = require('./certificateBuilder/builder');

const isAdminAuthenticated = require('./admin/auth');

const exampleModule = new (require('./example/example'))();


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use('/uploads', express.static('uploads'))
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

    console.log(result);
}

test();


export default app;