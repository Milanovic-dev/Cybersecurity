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
            return {status: storeResult.status, response: storeResult.insertedId};
        }
        else
        {
            let result = await generateCertificate(certObject, null); //[certificate, privateKey]
            let storeResult = await CertificateStore.storeAsync(result, null);
            return {status: storeResult.status, response: storeResult.insertedId};
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
        
        let rootObject = await CertificateStore.fetchAsync(root);
        rootObject.children = result;
        let status = rootObject.errorStatus ? rootObject.errorStatus : 200;
        return {
            status: status,
            response: rootObject
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
    fetchUpToRootAsync: async (childId) => {
        let result = await CertificateStore.fetchUpToRootAsync(childId);
        return { status: 200, response: result };
    },
    removeAll: async () => {
        await CertificateStore.dropAsync();
        return { status: 200 };
    }
}


export default CertificateService;