const WebCrypto = require('node-webcrypto-ossl');
import { bufferToHexCodes } from "pvutils";
//import nodeEngine from './nodeEngine';
import NodeEngine from './nodeEngine';

import * as asn1js from "asn1js";
const { issuerTypesMap, hashAlg, signAlg, issuerTypesRevMap, extendedKeyUsageMap, extendedKeyUsageRevMap, algomap } = require("./constants");
const { pemStringToArrayBuffer, formatPEM, importPrivateKey, buf2ab } = require("./parse");

const { Certificate,
    AttributeTypeAndValue,
    BasicConstraints,
    Extension,
    ExtKeyUsage,
    CertificateTemplate,
    CAVersion,
    getCrypto,
    setEngine,
    CryptoEngine,
    getAlgorithmParameters,
    RSAPublicKey,
    InfoAccess,
    AccessDescription,
    GeneralName,
    AuthorityKeyIdentifier,
    OCSPRequest,
    OCSPResponse,
    BasicOCSPResponse,
    ResponseBytes,
    SingleResponse,
    PrivateKeyInfo,
    PFX,
    CertBag,
    SafeBag,
    AuthenticatedSafe,
    SafeContents,
    Attribute,
    PKCS8ShroudedKeyBag,
    getRandomValues
} = require("pkijs");
var webcrypto = new WebCrypto.Crypto();



const nodeEngine = require('./node-engine');
const nodeSpecificCrypto = require('./nodeEngineNodeSpecific');

let engine = new CryptoEngine({
    crypto: nodeSpecificCrypto,
    subtle: nodeEngine.subtle,
    name: 'nodeEngine'
});


engine.getRandomValues = nodeEngine.getRandomValues;
engine.getAlgorithmByOID = nodeEngine.getAlgorithmByOID;
engine.getOIDByAlgorithm = nodeEngine.getOIDByAlgorithm;
engine.getAlgorithmParameters = nodeEngine.getAlgorithmParameters;
engine.encryptEncryptedContentInfo = nodeEngine.encryptEncryptedContentInfo;
engine.decryptEncryptedContentInfo = nodeEngine.decryptEncryptedContentInfo;
engine.stampDataWithPassword = nodeEngine.stampDataWithPassword;
engine.verifyDataStampedWithPassword = nodeEngine.verifyDataStampedWithPassword;



var functionLogger = {};

functionLogger.log = true;//Set this to false to disable logging 

/**
 * Gets a function that when called will log information about itself if logging is turned on.
 *
 * @param func The function to add logging to.
 * @param name The name of the function.
 *
 * @return A function that will perform logging and then call the function. 
 */
functionLogger.getLoggableFunction = function(func, name) {
    return function() {
        if (functionLogger.log) {
            var logText = name + '(';

            for (var i = 0; i < arguments.length; i++) {
                if (i > 0) {
                    logText += ', ';
                }
                logText += arguments[i];
            }
            logText += ');';

            console.log(logText);
        }

        return func.apply(this, arguments);
    }
};

/**
 * After this is called, all direct children of the provided namespace object that are 
 * functions will log their name as well as the values of the parameters passed in.
 *
 * @param namespaceObject The object whose child functions you'd like to add logging to.
 */
functionLogger.addLoggingToNamespace = function(namespaceObject){
    for(var name in namespaceObject){
        var potentialFunction = namespaceObject[name];

        if(Object.prototype.toString.call(potentialFunction) === '[object Function]'){
            namespaceObject[name] = functionLogger.getLoggableFunction(potentialFunction, name);
        }
    }
};




setEngine('nodeEngine', nodeSpecificCrypto, engine);



function createCertificateInternal(params, parentCertificate, caPrivateKey) {
    //region Initial variables 
    let sequence = Promise.resolve();

    const certificate = new Certificate();

    let publicKey;
    let privateKey;

    let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
    let privateKeyBuffer = new ArrayBuffer(0);
    //endregion

    //region Get a "crypto" extension 
    const crypto = getCrypto();
    if (typeof crypto === "undefined")
        return Promise.reject("No WebCrypto extension found");
    //endregion

    //region Put a static values 
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: params.serialNumber });

    if (params.issuer && !parentCertificate) {
        for (let key in params.issuer) {
            if (params.issuer.hasOwnProperty(key)) {
                certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
                    type: issuerTypesMap[key],
                    value: new asn1js.PrintableString({ value: params.issuer[key] })
                }));

            }
        }

    } else /*if (parentCertificate)*/ {
        //console.log(parentCertificate.subject)
        certificate.issuer.typesAndValues = parentCertificate.subject.typesAndValues;
        /*for (let key in parentCertificate.subject) {
            if (parentCertificate.subject.hasOwnProperty(key)) {
                certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
                    type: issuerTypesMap[key],
                    value: new asn1js.PrintableString({ value: parentCertificate.subject[key] })
                }));

            }
        }*/
    }

    if (params.subject) {
        for (let key in params.subject) {
            if (params.subject.hasOwnProperty(key)) {
                certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
                    type: issuerTypesMap[key],
                    value: new asn1js.PrintableString({ value: params.subject[key] })
                }));

            }
        }
    }


    certificate.notBefore.value = params.validFrom;
    certificate.notAfter.value = params.validTo;

    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

    //region "BasicConstraints" extension
    if (!params.basicConstraints) {
        const basicConstr = new BasicConstraints({
            cA: false,
            pathLenConstraint: null
        });

        certificate.extensions.push(new Extension({
            extnID: "2.5.29.19",
            critical: true,
            extnValue: basicConstr.toSchema().toBER(false),
            parsedValue: basicConstr // Parsed value for well-known extensions
        }));
        //endregion 

    } else {
        const basicConstr = new BasicConstraints({
            cA: params.basicConstraints.isCA,
            pathLenConstraint: params.basicConstraints.pathLengthConstraint
        });

        certificate.extensions.push(new Extension({
            extnID: "2.5.29.19",
            critical: true,
            extnValue: basicConstr.toSchema().toBER(false),
            parsedValue: basicConstr // Parsed value for well-known extensions
        }));
        //endregion 
    }

    //region "KeyUsage" extension 
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);

    bitView[0] |= 0x02; // Key usage "cRLSign" flag
    bitView[0] |= 0x04; // Key usage "keyCertSign" flag

    const keyUsage = new asn1js.BitString({ valueHex: bitArray });

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: keyUsage.toBER(false),
        parsedValue: keyUsage // Parsed value for well-known extensions
    }));
    //endregion


    //region "ExtendedKeyUsage" extension

    if (params.extendedKeyUsage) {
        const extKeyUsage = new ExtKeyUsage({
            keyPurposes: params.extendedKeyUsage.map((item) => {
                return extendedKeyUsageMap[item]
            })
        });

        certificate.extensions.push(new Extension({
            extnID: "2.5.29.37",
            critical: false,
            extnValue: extKeyUsage.toSchema().toBER(false),
            parsedValue: extKeyUsage // Parsed value for well-known extensions
        }));


    }
    //endregion

    // ocsp

    const infoAccess = new InfoAccess({
        accessDescriptions: [
            new AccessDescription({
                schema: (new AccessDescription({
                    accessMethod: '1.3.6.1.5.5.7.48.1',
                    accessLocation: new GeneralName({
                        schema: (new GeneralName({
                            type: 6,
                            value: "http://localhost:8080/ocsp/check"//"test"//new asn1js.Utf8String({ value: "certType" })
                        })).toSchema()
                    })
                })).toSchema()
            })]
    });
    //console.log(infoAccess);
    certificate.extensions.push(new Extension({
        extnID: "1.3.6.1.5.5.7.1.1",
        critical: false,
        extnValue: infoAccess.toSchema().toBER(false),
        //parsedValue: infoAccess // Parsed value for well-known extensions
    }));

    //

    //region Create a new key pair 
    sequence = sequence.then(() => {
        //region Get default algorithm parameters for key generation
        console.log('aaaa');
        const algorithm = getAlgorithmParameters(signAlg, "generatekey");
        console.log(algorithm);
        //console.log(algorithm);
        if ("hash" in algorithm.algorithm)
            algorithm.algorithm.hash.name = hashAlg;
        //endregion


        return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    });
    //endregion 

    //region Store new key in an interim variables
    sequence = sequence.then(keyPair => {
        publicKey = keyPair.publicKey;
        privateKey = keyPair.privateKey;
    }, error => Promise.reject(`Error during key generation: ${error}`));
    //endregion 

    //region Exporting public key into "subjectPublicKeyInfo" value of certificate 
    sequence = sequence.then(() =>
        certificate.subjectPublicKeyInfo.importKey(publicKey)
    );
    //endregion 


    sequence = sequence.then(() =>
        crypto.digest({ name: "SHA-1" }, certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex),
        error => Promise.reject(`Error during exporting public key: ${error}`));

    sequence = sequence.then((result) => {
        var keyIDExtension = new Extension({
            extnID: "2.5.29.14",
            critical: false,
            extnValue: new asn1js.OctetString({ valueHex: result }).toBER(false)
        });

        if (parentCertificate) {
            for (let i = 0; i < parentCertificate.extensions.length; i++) {
                if (parentCertificate.extensions[i].extnID == "2.5.29.14") {
                    console.log(bufferToHexCodes(asn1js.fromBER(parentCertificate.extensions[i].extnValue.valueBlock.valueHex).result.valueBlock.valueHex))
                    var issuerKeyIDExtension = new Extension({
                        extnID: "2.5.29.35",
                        critical: false,
                        extnValue: new AuthorityKeyIdentifier({
                            keyIdentifier: new asn1js.OctetString({ valueHex: asn1js.fromBER(parentCertificate.extensions[i].extnValue.valueBlock.valueHex).result.valueBlock.valueHex })
                        }).toSchema().toBER(false)
                    });
                    certificate.extensions.push(issuerKeyIDExtension);

                    break;
                }

            }
        } else {
            var issuerKeyIDExtension = new Extension({
                extnID: "2.5.29.35",
                critical: false,
                extnValue: new AuthorityKeyIdentifier({
                    keyIdentifier: new asn1js.OctetString({ valueHex: result })
                }).toSchema().toBER(false)
            });
            certificate.extensions.push(issuerKeyIDExtension);

        }


        certificate.extensions.push(keyIDExtension);

    },
        error => Promise.reject(`Error during exporting public key: ${error}`));

    //region Signing final certificate 
    sequence = sequence.then(() =>
        certificate.sign(caPrivateKey ? caPrivateKey : privateKey, hashAlg),
        error => Promise.reject(`Error during exporting public key: ${error}`));
    //endregion 


    //region Encode and store certificate 
    sequence = sequence.then(() => {
        certificateBuffer = certificate.toSchema(true).toBER(false);

    }, error => Promise.reject(`Error during signing: ${error}`));
    //endregion 

    //region Exporting private key 
    sequence = sequence.then(() =>
        crypto.exportKey("pkcs8", privateKey)
    );
    //endregion 

    //region Store exported key on Web page 
    sequence = sequence.then(result => {
        privateKeyBuffer = result;
    }, error => Promise.reject(`Error during exporting of private key: ${error}`));
    //endregion

    sequence = sequence.then(() => {
        return {
            privateKeyBuffer: privateKeyBuffer,
            certificateBuffer: certificateBuffer
        }
    })

    return sequence;
}




function generateCertificate(params, parentCertificate, parentPrivateKey, keyStorePassword) {
    if (parentCertificate) {
        return importPrivateKey(parentPrivateKey).then((privateKey) => {
            return createCertificateInternal(params, loadCertificate(parentCertificate), privateKey).then((result) => {


                const certificateString = String.fromCharCode.apply(null, new Uint8Array(result.certificateBuffer));
                const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result.privateKeyBuffer));

                let result2 = {
                    certificate: `-----BEGIN CERTIFICATE-----\n${formatPEM(Buffer.from(certificateString, 'ascii').toString('base64'))}\n-----END CERTIFICATE-----\n`,
                    privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(Buffer.from(privateKeyString, 'ascii').toString('base64'))}\n-----END PRIVATE KEY-----\n`
                };

                return openSSLLike(result2.certificate, result2.privateKey, keyStorePassword, "AES-256-CBC", "SHA-1");
    
            }, error => {
                if (error instanceof Object)
                    console.log(error.message);
                else
                    console.log(error);
            });

        })
    } else {
        return createCertificateInternal(params).then((result) => {


            const certificateString = String.fromCharCode.apply(null, new Uint8Array(result.certificateBuffer));
            const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result.privateKeyBuffer));

            let result2 = {
                certificate: `-----BEGIN CERTIFICATE-----\n${formatPEM(Buffer.from(certificateString, 'ascii').toString('base64'))}\n-----END CERTIFICATE-----\n`,
                privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(Buffer.from(privateKeyString, 'ascii').toString('base64'))}\n-----END PRIVATE KEY-----\n`
            };

            return openSSLLike(result2.certificate, result2.privateKey, keyStorePassword, "AES-256-CBC", "SHA-1");

        }, error => {
            if (error instanceof Object)
                console.log(error.message);
            else
                console.log(error);
        });


    }
}
function openSSLLike(certificate, privateKey, password, inputAlgorithm, inputHashAlgorithm = "SHA-256") {
    //region Initial variables

    const certSimpl = loadCertificate(certificate);

    let asn1 = asn1js.fromBER(buf2ab(Buffer.from(privateKey.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----BEGIN PRIVATE KEY-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64')));
    const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
    //console.log(pkcs8Simpl);
    //region Initial variables
    //region Initial variables
    let sequence = Promise.resolve();

    const keyLocalIDBuffer = new ArrayBuffer(4);
    const keyLocalIDView = new Uint8Array(keyLocalIDBuffer);

    getRandomValues(keyLocalIDView);

    const certLocalIDBuffer = new ArrayBuffer(4);
    const certLocalIDView = new Uint8Array(certLocalIDBuffer);

    getRandomValues(certLocalIDView);

    //region "KeyUsage" attribute
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);

    bitView[0] |= 0x80;

    const keyUsage = new asn1js.BitString({
        valueHex: bitArray,
        unusedBits: 7
    });
    //endregion

    const passwordConverted = stringToArrayBuffer(password);
    //endregion

    const contentEncryptionAlgorithm = (getAlgorithmParameters(inputAlgorithm, "encrypt")).algorithm;
    if (("name" in contentEncryptionAlgorithm) === false)
        return Promise.reject(`No support for selected algorithm: ${inputAlgorithm}`);

    const makeInternalValuesParameters = {
        password: passwordConverted,
        contentEncryptionAlgorithm,
        hmacHashAlgorithm: inputHashAlgorithm,
        iterationCount: 2048
    };


    //region Add "keyUsage" attribute
    pkcs8Simpl.attributes = [
        new Attribute({
            type: "2.5.29.15",
            values: [
                keyUsage
            ]
        })
    ];
    //endregion
    //endregion

    //region Put initial values for PKCS#12 structures
    const pkcs12 = new PFX({
        parsedValue: {
            integrityMode: 0, // Password-Based Integrity Mode
            authenticatedSafe: new AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 0, // "No-privacy" Protection Mode
                            value: new SafeContents({
                                safeBags: [
                                    new SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.2",
                                        bagValue: new PKCS8ShroudedKeyBag({
                                            parsedValue: pkcs8Simpl
                                        }),
                                        bagAttributes: [
                                            new Attribute({
                                                type: "1.2.840.113549.1.9.20", // friendlyName
                                                values: [
                                                    new asn1js.BmpString({ value: "PKCS8ShroudedKeyBag from PKIjs" })
                                                ]
                                            }),
                                            new Attribute({
                                                type: "1.2.840.113549.1.9.21", // localKeyID
                                                values: [
                                                    new asn1js.OctetString({ valueHex: keyLocalIDBuffer })
                                                ]
                                            }),
                                            new Attribute({
                                                type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
                                                values: [
                                                    new asn1js.BmpString({ value: "http://www.pkijs.org" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        },
                        {
                            privacyMode: 1, // Password-Based Privacy Protection Mode
                            value: new SafeContents({
                                safeBags: [
                                    new SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new CertBag({
                                            parsedValue: certSimpl
                                        }),
                                        bagAttributes: [
                                            new Attribute({
                                                type: "1.2.840.113549.1.9.20", // friendlyName
                                                values: [
                                                    new asn1js.BmpString({ value: "CertBag from PKIjs" })
                                                ]
                                            }),
                                            new Attribute({
                                                type: "1.2.840.113549.1.9.21", // localKeyID
                                                values: [
                                                    new asn1js.OctetString({ valueHex: certLocalIDBuffer })
                                                ]
                                            }),
                                            new Attribute({
                                                type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
                                                values: [
                                                    new asn1js.BmpString({ value: "http://www.pkijs.org" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //endregion

    //region Encode internal values for "PKCS8ShroudedKeyBag"
    sequence = sequence.then(
        () => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.makeInternalValues(makeInternalValuesParameters)
    );
    //endregion

    //region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    sequence = sequence.then(
        () => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
            safeContents: [
                {
                    // Empty parameters for first SafeContent since "No Privacy" protection mode there
                },
                makeInternalValuesParameters
            ]
        })
    );
    //endregion

    //region Encode internal values for "Integrity Protection" envelope
    sequence = sequence.then(
        () => pkcs12.makeInternalValues({
            password: passwordConverted,
            iterations: 100000,
            pbkdf2HashAlgorithm: "SHA-256", // OpenSSL can not handle usage of PBKDF2, only PBKDF1
            hmacHashAlgorithm: "SHA-256"
        })
    );
    //endregion

    //region Save encoded data
    sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
    //endregion

    return sequence;
}


function loadCertificate(cert) {
    let certificateBuffer = pemStringToArrayBuffer(cert);
    //region Initial check
    if (certificateBuffer.byteLength === 0) {
        console.log("Nothing to parse!");
        return;
    }
    //endregion

    //region Decode existing X.509 certificate
    const asn1 = asn1js.fromBER(certificateBuffer);
    //console.log(asn1.result)
    const certificate = new Certificate({ schema: asn1.result });
    //endregion
    return certificate;
}

function parseCertificate(cert) {
    let certificateBuffer = pemStringToArrayBuffer(cert);
    let result = {
        issuer: {},
        subject: {},
        extensions: {}
    }

    //region Initial check
    if (certificateBuffer.byteLength === 0) {
        console.log("Nothing to parse!");
        return;
    }
    //endregion

    //region Decode existing X.509 certificate
    const asn1 = asn1js.fromBER(certificateBuffer);
    //console.log(asn1.result)
    const certificate = new Certificate({ schema: asn1.result });
    //endregion

    for (const typeAndValue of certificate.issuer.typesAndValues) {
        result.issuer[issuerTypesRevMap[typeAndValue.type]] = typeAndValue.value.valueBlock.value;
    }
    //endregion

    //region Put information about X.509 certificate subject
    for (const typeAndValue of certificate.subject.typesAndValues) {
        result.subject[issuerTypesRevMap[typeAndValue.type]] = typeAndValue.value.valueBlock.value;
    }
    //endregion

    result.serialNumber = bufferToHexCodes(certificate.serialNumber.valueBlock.valueHex);
    result.validFrom = certificate.notBefore.value;
    result.validTo = certificate.notAfter.value;

    //region Put information about subject public key size
    let publicKeySize = "< unknown >";

    if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1)) {
        const asn1PublicKey = asn1js.fromBER(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);
        const rsaPublicKey = new RSAPublicKey({ schema: asn1PublicKey.result });
        const modulusView = new Uint8Array(rsaPublicKey.modulus.valueBlock.valueHex);
        let modulusBitLength = 0;

        if (modulusView[0] === 0x00)
            modulusBitLength = (rsaPublicKey.modulus.valueBlock.valueHex.byteLength - 1) * 8;
        else
            modulusBitLength = rsaPublicKey.modulus.valueBlock.valueHex.byteLength * 8;

        publicKeySize = modulusBitLength.toString();
    }


    result.publicKeySize = publicKeySize;

    let signatureAlgorithm = algomap[certificate.signatureAlgorithm.algorithmId];
    if (typeof signatureAlgorithm === "undefined")
        signatureAlgorithm = certificate.signatureAlgorithm.algorithmId;
    else
        signatureAlgorithm = `${signatureAlgorithm} (${certificate.signatureAlgorithm.algorithmId})`;

    result.signatureAlgorithm = signatureAlgorithm;
    //endregion

    //region Put information about certificate extensions
    if ("extensions" in certificate) {
        //console.log(certificate.extensions[0].toJSON())
        for (let i = 0; i < certificate.extensions.length; i++) {
            if (certificate.extensions[i].extnID == "2.5.29.35") {
                const authKeyIdentifier = new AuthorityKeyIdentifier({ schema: asn1js.fromBER(certificate.extensions[i].extnValue.valueBlock.valueHex).result });

                result.extensions[certificate.extensions[i].extnID] = {
                    extnID: certificate.extensions[i].extnID,
                    name: "Authority Key Identifier",
                    value: {
                        keyIdentifier: bufferToHexCodes(authKeyIdentifier.keyIdentifier.valueBlock.valueHex)
                    }
                };
            } else if (certificate.extensions[i].extnID == "2.5.29.14") {
                result.extensions[certificate.extensions[i].extnID] = {
                    extnID: certificate.extensions[i].extnID,
                    name: "Subject Key Identifier",
                    value: bufferToHexCodes(asn1js.fromBER(certificate.extensions[i].extnValue.valueBlock.valueHex).result.valueBlock.valueHex)

                };
            } else if (certificate.extensions[i].extnID == "1.3.6.1.5.5.7.1.1") {
                const infoAccess = new InfoAccess({ schema: asn1js.fromBER(certificate.extensions[i].extnValue.valueBlock.valueHex).result });
                result.extensions[certificate.extensions[i].extnID] = {
                    extnID: certificate.extensions[i].extnID,
                    name: "Authority Information Access",
                    value: infoAccess.accessDescriptions.map((item) => {
                        return {
                            accessMethod: item.accessMethod,
                            accessLocation: item.accessLocation
                        }
                    })
                };

            } else if (certificate.extensions[i].extnID == "2.5.29.19") {
                const basicConstraints = new BasicConstraints({ schema: asn1js.fromBER(certificate.extensions[i].extnValue.valueBlock.valueHex).result }).toJSON();
                //console.log(basicConstraints.toJSON());
                result.extensions[certificate.extensions[i].extnID] = {
                    extnID: certificate.extensions[i].extnID,
                    name: "Basic Constraints",
                    value: {
                        isCA: basicConstraints.cA,
                        pathLengthConstraint: basicConstraints.pathLenConstraint
                    }
                };

            } else if (certificate.extensions[i].extnID == "2.5.29.37") {
                const extKeyUsage = new ExtKeyUsage({ schema: asn1js.fromBER(certificate.extensions[i].extnValue.valueBlock.valueHex).result }).toJSON();
                result.extensions[certificate.extensions[i].extnID] = {
                    extnID: certificate.extensions[i].extnID,
                    name: "Extended Key Usage",
                    value: extKeyUsage.keyPurposes.map((item) => extendedKeyUsageRevMap[item])
                };

            } else {
                result.extensions[certificate.extensions[i].extnID] = {
                    name: "",
                    extnID: certificate.extensions[i].extnID,
                    value: null
                }
            }
        }

    }

    return result;
    //endregion
}

function generateOCSPResponse(certificatePEM, privateKeyPEM, intermediatePEM, ocspReqest, revoked = null) {
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

            return {
                issuerKeyHash: issuerKeyHash,
                issuerNameHash: issuerNameHash,
                response: ocspRespSimpl.toSchema().toBER(false)
            }
        }
    );
    //endregion
}

function parseOCSPRequest(ocspReqBuffer) {
    if (ocspReqBuffer.byteLength === 0) {
        console.log("Nothing to parse!");
        return;
    }

    const asn1 = asn1js.fromBER(ocspReqBuffer);
    const ocspReqSimpl = new OCSPRequest({ schema: asn1.result });

    let res = [];
    for (let i = 0; i < ocspReqSimpl.tbsRequest.requestList.length; i++) {
        res.push({
            serialNumber: ocspReqSimpl.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueDec,
            issuerKeyHash: bufferToHexCodes(ocspReqSimpl.tbsRequest.requestList[i].reqCert.issuerKeyHash.valueBlock.valueHex),
            issuerNameHash: bufferToHexCodes(ocspReqSimpl.tbsRequest.requestList[i].reqCert.issuerNameHash.valueBlock.valueHex)
        })
    }
    return res;
}


function stringToArrayBuffer(str) {
    var stringLength = str.length;

    var resultBuffer = new ArrayBuffer(stringLength);
    var resultView = new Uint8Array(resultBuffer);

    // noinspection NonBlockStatementBodyJS
    for (var i = 0; i < stringLength; i++) {
        resultView[i] = str.charCodeAt(i);
    } return resultBuffer;
}


function parsePKCS12(buffer, password) {
    //region Initial variables
    let sequence = Promise.resolve();

    const passwordConverted = stringToArrayBuffer(password);
    console.log(passwordConverted);
    //endregion

    //region Parse internal PKCS#12 values
    const asn1 = asn1js.fromBER(buffer);
    let pkcs12 = new PFX({ schema: asn1.result });
    console.log( (pkcs12.authSafe.content instanceof asn1js.OctetString) === false );
    //region Parse "AuthenticatedSafe" value of PKCS#12 data
    sequence = sequence.then(() => pkcs12.parseInternalValues({
        password: passwordConverted,
        checkIntegrity: true
    }));
    //endregion

    //region Parse "SafeContents" values
    sequence = sequence.then(() => pkcs12.parsedValue.authenticatedSafe.parseInternalValues({
        safeContents: [{
            // Empty parameters since for first "SafeContent" OpenSSL uses "no privacy" protection mode
        }, {
            password: passwordConverted
        }]
    }));
    //endregion

    //region Parse "PKCS8ShroudedKeyBag" value
    sequence = sequence.then(() => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parseInternalValues({
        password: passwordConverted
    }));
    //endregion

    //region Store parsed value to Web page
    sequence = sequence.then(() => {
        var certificateBuffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
        //endregion Store PKCS#8 (private key) value
        var pkcs8Buffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);

        const certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
        const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(pkcs8Buffer));

        return {
            certificate: `-----BEGIN CERTIFICATE-----\n${formatPEM(Buffer.from(certificateString, 'ascii').toString('base64'))}\n-----END CERTIFICATE-----\n`,
            privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(Buffer.from(privateKeyString, 'ascii').toString('base64'))}\n-----END PRIVATE KEY-----\n`

        }

    });
    //endregion

    return sequence;

}




module.exports = {
    generateCertificate: generateCertificate,
    parseCertificate: parseCertificate,
    loadCertificate: loadCertificate,
    generateOCSPResponse: generateOCSPResponse,
    parseOCSPRequest: parseOCSPRequest,
    parsePKCS12: parsePKCS12
}


