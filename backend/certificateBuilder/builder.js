const WebCrypto = require('node-webcrypto-ossl');
import { bufferToHexCodes } from "pvutils";

const asn1js = require("asn1js");

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
    AuthorityKeyIdentifier
} = require("pkijs")

const nodeSpecificCrypto = require('./node-crypto');
const webcrypto = new WebCrypto.Crypto();

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




function formatPEM(pemString) {
    /// <summary>Format string in order to have each line with length equal to 63</summary>
    /// <param name="pemString" type="String">String to format</param>

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


setEngine('nodeEngine', nodeSpecificCrypto, new CryptoEngine({
    crypto: nodeSpecificCrypto,
    subtle: webcrypto.subtle,
    name: 'nodeEngine'
}));


let hashAlg = "SHA-256";
let signAlg = "RSASSA-PKCS1-v1_5";

const issuerTypesMap = {
    country: '2.5.4.6',
    organizationName: '2.5.4.10',
    organizationalUnit: '2.5.4.11',
    commonName: '2.5.4.3',
    localityName: '2.5.4.7',
    stateName: '2.5.4.8',
    email: '1.2.840.113549.1.9.1'
}

const issuerTypesRevMap = {
    '2.5.4.6': 'country',
    '2.5.4.10': 'organizationName',
    '2.5.4.11': 'organizationalUnit',
    '2.5.4.3': 'commonName',
    '2.5.4.7': 'localityName',
    '2.5.4.8': 'stateName',
    '1.2.840.113549.1.9.1': 'email'
}


const extendedKeyUsageMap = {
    "anyExtendedKeyUsage": "2.5.29.37.0",       // anyExtendedKeyUsage
    "serverAuth": "1.3.6.1.5.5.7.3.1", // id-kp-serverAuth
    "clientAuth": "1.3.6.1.5.5.7.3.2", // id-kp-clientAuth
    "codeSigning": "1.3.6.1.5.5.7.3.3", // id-kp-codeSigning
    "emailProtection": "1.3.6.1.5.5.7.3.4", // id-kp-emailProtection
    "timeStamping": "1.3.6.1.5.5.7.3.8", // id-kp-timeStamping
    "OCSPSigning": "1.3.6.1.5.5.7.3.9", // id-kp-OCSPSigning
    "MicrosoftCertificateTrustListSigning": "1.3.6.1.4.1.311.10.3.1", // Microsoft Certificate Trust List signing
    "MicrosoftEncryptedFileSystem": "1.3.6.1.4.1.311.10.3.4"  // Microsoft Encrypted File System
}

const extendedKeyUsageRevMap = {
    "2.5.29.37.0": "anyExtendedKeyUsage",       // anyExtendedKeyUsage
    "1.3.6.1.5.5.7.3.1": "serverAuth", // id-kp-serverAuth
    "1.3.6.1.5.5.7.3.2": "clientAuth", // id-kp-clientAuth
    "1.3.6.1.5.5.7.3.3": "codeSigning", // id-kp-codeSigning
    "1.3.6.1.5.5.7.3.4": "emailProtection", // id-kp-emailProtection
    "1.3.6.1.5.5.7.3.8": "timeStamping", // id-kp-timeStamping
    "1.3.6.1.5.5.7.3.9": "OCSPSigning", // id-kp-OCSPSigning
    "1.3.6.1.4.1.311.10.3.1": "MicrosoftCertificateTrustListSigning", // Microsoft Certificate Trust List signing
    "1.3.6.1.4.1.311.10.3.4": "MicrosoftEncryptedFileSystem"  // Microsoft Encrypted File System
}


function createCertificateInternal(params, parentCertificate, caPrivateKey) {
    //region Initial variables 
    let sequence = Promise.resolve();

    const certificate = new Certificate();

    let publicKey;
    let privateKey;

    let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
    let privateKeyBuffer = new ArrayBuffer(0);
    let trustedCertificates = [];
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

    } else if (parentCertificate) {
        for (let key in parentCertificate.subject) {
            if (parentCertificate.subject.hasOwnProperty(key)) {
                certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
                    type: issuerTypesMap[key],
                    value: new asn1js.PrintableString({ value: parentCertificate.subject[key] })
                }));

            }
        }
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
                            value: "http://localhost:4000"//"test"//new asn1js.Utf8String({ value: "certType" })
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
        const algorithm = getAlgorithmParameters(signAlg, "generatekey");
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


    //region Signing final certificate 
    sequence = sequence.then(() =>
        certificate.sign(caPrivateKey ? caPrivateKey : privateKey, hashAlg),
        error => Promise.reject(`Error during exporting public key: ${error}`));
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

        var issuerKeyIDExtension = new Extension({
            extnID: "2.5.29.35",
            critical: false,
            extnValue: new AuthorityKeyIdentifier({
                keyIdentifier: new asn1js.OctetString({ valueHex: parentCertificate ? hexStringToArrayBuffer(parentCertificate.extensions['2.5.29.14'].value) : result })
            }).toSchema().toBER(false)
        });

        certificate.extensions.push(keyIDExtension);
        certificate.extensions.push(issuerKeyIDExtension);

    },
        error => Promise.reject(`Error during exporting public key: ${error}`));


    //region Encode and store certificate 
    sequence = sequence.then(() => {
        trustedCertificates.push(certificate);
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




function generateCertificate(params, parentCertificate, parentPrivateKey) {
    let parsedParentCertificate;
    if (parentCertificate) {
        parsedParentCertificate = parseCertificate(parentCertificate);
        return importPrivateKey(parentPrivateKey).then((privateKey) => {
            return createCertificateInternal(params, parsedParentCertificate, privateKey).then((result) => {


                const certificateString = String.fromCharCode.apply(null, new Uint8Array(result.certificateBuffer));
                const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result.privateKeyBuffer));

                return {
                    certificate: `-----BEGIN CERTIFICATE-----\n${formatPEM(Buffer.from(certificateString, 'ascii').toString('base64'))}\n-----END CERTIFICATE-----\n`,
                    privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(Buffer.from(privateKeyString, 'ascii').toString('base64'))}\n-----END PRIVATE KEY-----\n`
                }

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

            return {
                certificate: `-----BEGIN CERTIFICATE-----\n${formatPEM(Buffer.from(certificateString, 'ascii').toString('base64'))}\n-----END CERTIFICATE-----\n`,
                privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(Buffer.from(privateKeyString, 'ascii').toString('base64'))}\n-----END PRIVATE KEY-----\n`
            }

        }, error => {
            if (error instanceof Object)
                console.log(error.message);
            else
                console.log(error);
        });


    }



}

function getPublicKey(cert) {
    let certificateBuffer = buf2ab(Buffer.from(cert.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64'));
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

    return certificate.getPublicKey().then((res) => res);
    //endregion
}



function parseCertificate(cert) {
    let certificateBuffer = buf2ab(Buffer.from(cert.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64'));
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


    const crypto = getCrypto();

    //region Decode existing X.509 certificate
    const asn1 = asn1js.fromBER(certificateBuffer);
    //console.log(asn1.result)
    const certificate = new Certificate({ schema: asn1.result });
    //endregion

    //region Put information about X.509 certificate issuer
    const rdnmap = {
        "2.5.4.6": "C",
        "2.5.4.10": "O",
        "2.5.4.11": "OU",
        "2.5.4.3": "CN",
        "2.5.4.7": "L",
        "2.5.4.8": "S",
        "2.5.4.12": "T",
        "2.5.4.42": "GN",
        "2.5.4.43": "I",
        "2.5.4.4": "SN",
        "1.2.840.113549.1.9.1": "E-mail"
    };

    for (const typeAndValue of certificate.issuer.typesAndValues) {
        let typeval = rdnmap[typeAndValue.type];
        if (typeof typeval === "undefined")
            typeval = typeAndValue.type;

        result.issuer[issuerTypesRevMap[typeAndValue.type]] = typeAndValue.value.valueBlock.value;
    }
    //endregion

    //region Put information about X.509 certificate subject
    for (const typeAndValue of certificate.subject.typesAndValues) {
        let typeval = rdnmap[typeAndValue.type];
        if (typeof typeval === "undefined")
            typeval = typeAndValue.type;

        result.subject[issuerTypesRevMap[typeAndValue.type]] = typeAndValue.value.valueBlock.value;
    }
    //endregion

    result.serialNumber = bufferToHexCodes(certificate.serialNumber.valueBlock.valueHex);
    result.validFrom = certificate.notBefore.value;
    result.validTo = certificate.notBefore.value;

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

    //region Put information about signature algorithm
    const algomap = {
        "1.2.840.113549.1.1.2": "MD2 with RSA",
        "1.2.840.113549.1.1.4": "MD5 with RSA",
        "1.2.840.10040.4.3": "SHA1 with DSA",
        "1.2.840.10045.4.1": "SHA1 with ECDSA",
        "1.2.840.10045.4.3.2": "SHA256 with ECDSA",
        "1.2.840.10045.4.3.3": "SHA384 with ECDSA",
        "1.2.840.10045.4.3.4": "SHA512 with ECDSA",
        "1.2.840.113549.1.1.10": "RSA-PSS",
        "1.2.840.113549.1.1.5": "SHA1 with RSA",
        "1.2.840.113549.1.1.14": "SHA224 with RSA",
        "1.2.840.113549.1.1.11": "SHA256 with RSA",
        "1.2.840.113549.1.1.12": "SHA384 with RSA",
        "1.2.840.113549.1.1.13": "SHA512 with RSA"
    };       // array mapping of common algorithm OIDs and corresponding types

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


module.exports = {
    generateCertificate: generateCertificate,
    parseCertificate: parseCertificate
}

