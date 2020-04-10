import CertificateStore from './certificateStore';
import { Db } from 'mongodb';
const {generateCertificate, parseCertificate} = require('../certificateBuilder/builder');
import Moment from 'moment';

const CertificateService = {
    createCertificateAsync: async (certObject, parentId) => {
        certObject.validFrom = Moment.unix(certObject.validFrom).toDate();
        certObject.validTo = Moment.unix(certObject.validTo).toDate();
        if(parentId != null && parentId != undefined){
            let parentObject = await CertificateStore.fetchAsync(parentId);

            if(parentObject == undefined){
                return {status: 404 };
            }

            let result = await generateCertificate(certObject, parentObject.certificate, parentObject.privateKey); //[certificate, privateKey]
            let storeResult = await CertificateStore.storeAsync(result, parentId);
            return {status: storeResult.status, response: { "insertedID": storeResult.insertedId }};
        }
        else
        {
            let result = await generateCertificate(certObject); //[certificate, privateKey]
            console.log(result);
            let storeResult = await CertificateStore.storeAsync(result);
            
            return {status: storeResult.status, response: { "insertedID": storeResult.insertedId }};
        }
    },
    fetchCertificateAsync: async (id) => {
        let result = await CertificateStore.fetchAsync(id);
        return {
            status: result.errorStatus ? result.errorStatus : 200, 
            response: result.errorStatus ? "" : result 
        };
    },
    fetchCertificateTreeAsync: async (root) => {
        let result = await CertificateStore.fetchTreeAsync(root);

        if(result == undefined){
            return { status: 500 };
        }
        
        let status = result != undefined ? 200 : 404;
        return {
            status: status,
            response: result
        };
    },
    fetchCertificateTreesAsync: async () => {
        let roots = await CertificateStore.fetchRootsAsync();
        let ret = []
        for(let i = 0 ; i < roots.length ; i++){
            let tree = await (await CertificateService.fetchCertificateTreeAsync(roots[i].id.toString())).response;
            ret.push(tree);
        }

        return { status:200, response: ret };
    },
    fetchUpToRootAsync: async (childSerialNumber) => {
        let result = await CertificateStore.fetchUpToRootAsync(childSerialNumber);
        return { status: 200, response: result };
    },
    removeAll: async () => {
        await CertificateStore.dropAsync();
        return { status: 200 };
    },
    revoke: async (id) => {
        let tree = await CertificateStore.fetchTreeAsync(id);

        try{
            await revokeInternal(tree);
            return { status:200 };
        }
        catch(err){
            console.error(err);
            return { status:400 };
        }
    }
}


const revokeInternal = async (rootObject) => {
    await CertificateStore.revokeOneAsync(rootObject.id.toString());

    for(let i = 0 ; i < rootObject.children.length ; i++){
        revokeInternal(rootObject.children[i].id);
    }
}

export default CertificateService;