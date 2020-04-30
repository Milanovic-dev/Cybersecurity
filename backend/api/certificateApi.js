import CertificateStore from '../admin/certificateStore';
import CertificateService from '../admin/certificateService';

let fs = require('fs');
const {generateCertificate} = require('../certificateBuilder/builder');
const isAdminAuthenticated = require('../admin/auth');


module.exports = function(app){

let db;
const dbConnect = require('../db');
dbConnect()
    .then(async (conn) => {
        db = conn;
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


