const fs = require('fs');
const WebCrypto = require('node-webcrypto-ossl');
import { bufferToHexCodes } from "pvutils";
import { loadCertificate } from '../certificateBuilder/builder';

const asn1js = require("asn1js");

const {
    getCrypto,
    setEngine,
    CryptoEngine,
    OCSPRequest,
    OCSPResponse,
    BasicOCSPResponse,
    ResponseBytes,
    SingleResponse,
} = require("pkijs")

const nodeSpecificCrypto = require('../certificateBuilder/node-crypto');
const webcrypto = new WebCrypto.Crypto();
const hashAlg = 'SHA-256'

function buf2ab(buffer) {
    var buf = new ArrayBuffer(buffer.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = buffer.length; i < strLen; i++) {
        bufView[i] = buffer[i];
    }
    return buf;
}

function hexStringToArrayBuffer(string) {
    let buffer = [];
    for (let i = 0; i < string.length; i += 2) {
        buffer.push(parseInt(`${string[i]}${string[i + 1]}`, 16));
    }
    return buf2ab(buffer);
}

function importPrivateKey(cert) {
    return new Promise(function (resolve) {
        const crypto = getCrypto();
        var importer = crypto.subtle.importKey("pkcs8", buf2ab(Buffer.from(cert.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----BEGIN PRIVATE KEY-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64')), {
            name: "RSASSA-PKCS1-v1_5",
            hash: {
                name: "SHA-256"
            },
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1])
        }, true, ["sign"])
        importer.then(function (key) {
            resolve(key)
        })
    })
}


function formatPEM(pemString) {
    const stringLength = pemString.length;
    let resultString = '';

    for (let i = 0, count = 0; i < stringLength; i++ , count++) {
        if (count > 63) {
            resultString = `${resultString}\r\n`;
            count = 0;
        }

        resultString = `${resultString}${pemString[i]}`;
    }

    return resultString;
}



setEngine('nodeEngine', nodeSpecificCrypto, new CryptoEngine({
    crypto: nodeSpecificCrypto,
    subtle: webcrypto.subtle,
    name: 'nodeEngine'
}));


function createOCSPRespInternal(certificatePEM, privateKeyPEM, intermediatePEM, ocspReqest, revoked=null) {
    let issuerKeyHash, issuerNameHash;

    const crypto = getCrypto();

    const certificate = loadCertificate(certificatePEM);
    const caCertificate = loadCertificate(intermediatePEM);
    //region Initial variables
    let sequence = Promise.resolve();

    const ocspRespSimpl = new OCSPResponse();
    const ocspBasicResp = new BasicOCSPResponse();

    let privateKey;

    sequence = sequence.then(() =>
        importPrivateKey(privateKeyPEM),
        error => Promise.reject(`Error during exporting public key: ${error}`));

    sequence = sequence.then((result) => {
        privateKey = result;
    })

    sequence = sequence.then(() =>
        crypto.digest({ name: "SHA-1" }, caCertificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex),
        error => Promise.reject(`Error during exporting public key: ${error}`));

    sequence = sequence.then((result) => {
        issuerKeyHash = result;
    })

    sequence = sequence.then(() =>
        crypto.digest({ name: "SHA-1" }, caCertificate.subject.valueBeforeDecode),
        error => Promise.reject(`Error during exporting public key: ${error}`));

    sequence = sequence.then((result) => {
        issuerNameHash = result;
    });




    //region Create specific TST info structure to sign
    sequence = sequence.then(
        () => {
            ocspRespSimpl.responseStatus.valueBlock.valueDec = 0; // success
            ocspRespSimpl.responseBytes = new ResponseBytes();
            ocspRespSimpl.responseBytes.responseType = "1.3.6.1.5.5.7.48.1.1";

            ocspBasicResp.tbsResponseData.responderID = certificate.issuer;
            ocspBasicResp.tbsResponseData.producedAt = new Date();

            const response = new SingleResponse();
            response.certID.hashAlgorithm.algorithmId = "1.3.14.3.2.26"; // SHA-1
            response.certID.issuerNameHash.valueBlock.valueHex = issuerNameHash; // Fiction hash
            response.certID.issuerKeyHash.valueBlock.valueHex = issuerKeyHash; // Fiction hash
            response.certID.serialNumber.valueBlock.valueDec = certificate.serialNumber.valueBlock.valueDec; // Fiction serial number


            if (revoked) {
                response.certStatus = new asn1js.Constructed({
                    //name: (names.certStatus || ""),
                    idBlock: {
                        tagClass: 3, // CONTEXT-SPECIFIC
                        tagNumber: 1 // [1]
                    },
                    value: [
                        new asn1js.GeneralizedTime({ valueDate: revoked }),
                        //null
                    ]
                });

            } else {
                response.certStatus = new asn1js.Primitive({
                    idBlock: {
                        tagClass: 3, // CONTEXT-SPECIFIC
                        tagNumber: 0 // [0]
                    },
                    lenBlockLength: 1 // The length contains one byte 0x00
                }); // status - success
            }

            response.thisUpdate = new Date();

            ocspBasicResp.tbsResponseData.responses.push(response);

            ocspBasicResp.certs = [certificate];

            return ocspBasicResp.sign(privateKey, hashAlg);
        }
    );
    //endregion

    //region Finally create completed OCSP response structure
    return sequence.then(
        () => {
            if (ocspReqest.serialNumber != certificate.serialNumber.valueBlock.valueDec) {
                return {
                    error: 'Wrong request'
                };
            }
            if (ocspReqest.issuerKeyHash != bufferToHexCodes(issuerKeyHash)) {
                return {
                    error: 'Wrong request'
                };
            }
            if (ocspReqest.issuerNameHash != bufferToHexCodes(issuerNameHash)) {
                return {
                    error: 'Wrong request'
                };
            }



            const encodedOCSPBasicResp = ocspBasicResp.toSchema().toBER(false);
            ocspRespSimpl.responseBytes.response = new asn1js.OctetString({ valueHex: encodedOCSPBasicResp });
            console.log(ocspRespSimpl.toSchema().toBER(false));



            return {
                issuerKeyHash: issuerKeyHash,
                issuerNameHash: issuerNameHash,
                response: ocspRespSimpl.toSchema().toBER(false)
            }
        }
    );
    //endregion
}
//*********************************************************************************
function createOCSPResp() {
    return Promise.resolve().then(() => createOCSPRespInternal()).then(() => {
        let resultString = "-----BEGIN CERTIFICATE-----\r\n";
        resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(certificateBuffer)))}`;
        resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;

        alert("Certificate created successfully!");

        resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
        resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(privateKeyBuffer)))}`;
        resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;

        alert("Private key exported successfully!");

        resultString = `${resultString}\r\n-----BEGIN OCSP RESPONSE-----\r\n`;
        resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(ocspResponseBuffer)))}`;
        resultString = `${resultString}\r\n-----END OCSP RESPONSE-----\r\n\r\n`;

        // noinspection InnerHTMLJS
        document.getElementById("new_signed_data").innerHTML = resultString;

        parseOCSPResp();

        alert("OCSP response has created successfully!");
    });
}

function parseOCSPReq(ocspReqBuffer) {
    //console.log(ocspReqBuffer);
    //region Initial check 
    if (ocspReqBuffer.byteLength === 0) {
        console.log("Nothing to parse!");
        return;
    }
    //endregion 

    //region Decode existing OCSP request
    const asn1 = asn1js.fromBER(ocspReqBuffer);
    const ocspReqSimpl = new OCSPRequest({ schema: asn1.result });
    //console.log(JSON.stringify(ocspReqSimpl.toJSON(), null, 4));
    //endregion 
    console.log(JSON.stringify( ocspReqSimpl.toJSON(), null, 4) )


    let res = [];
    //region Put information about requests 
    for (let i = 0; i < ocspReqSimpl.tbsRequest.requestList.length; i++) {
        //console.log(ocspReqSimpl.tbsRequest.requestList[i].reqCert.issuerKeyHash.valueBlock.valueHex);
        res.push({
            serialNumber: ocspReqSimpl.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueDec,
            issuerKeyHash: bufferToHexCodes(ocspReqSimpl.tbsRequest.requestList[i].reqCert.issuerKeyHash.valueBlock.valueHex),
            issuerNameHash: bufferToHexCodes(ocspReqSimpl.tbsRequest.requestList[i].reqCert.issuerNameHash.valueBlock.valueHex)

        })
    }
    return res;
    //endregion 
}


//createOCSPRespInternal();
module.exports = function (app) {
    app.post('/ocsp/check', async (req, res) => {
        let request = parseOCSPReq(buf2ab(req.body));
        if (!request.length) {
            res.status(500);
            return;
        }

        console.log(request);

        res.writeHead(200, [['Content-Type', 'application/ocsp-respose']]);

        let response = await createOCSPRespInternal(
            fs.readFileSync('./endEntity.crt', 'utf8'),
            fs.readFileSync('./endEntity.key', 'utf8'),
            fs.readFileSync('./intermediate.crt', 'utf8'),
            request[0]
        );

        console.log(response);

        if (response.error) {
            res.status(500);
            return;
        }

        res.end(Buffer.from(response.response));
    })

};