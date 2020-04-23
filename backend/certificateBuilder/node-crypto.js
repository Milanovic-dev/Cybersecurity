const crypto = require('crypto');
const WebCrypto = require('node-webcrypto-ossl');

const webcrypto = new WebCrypto.Crypto();

const nodeEngineNodeSpecific = require('./nodeEngineNodeSpecific');
const asn1js = require("asn1js");

const {PBKDF2Params, AlgorithmIdentifier, PBES2Params, EncryptedContentInfo} = require('pkijs');

function getAlgorithmParameters(algorithmName, operation) {
    console.log('getAlgorithmParameters', algorithmName, operation);
    let result = {
        algorithm: {},
        usages: []
    };

    console.log(algorithmName.toUpperCase(), operation.toLowerCase());
    switch (algorithmName.toUpperCase()) {
        case "RSASSA-PKCS1-V1_5":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":

                    result = {
                        algorithm:
                        {
                            name: 'RSASSA-PKCS1-V1_5',
                            modulusLength: 2048,
                            publicExponent: new Uint8Array([1, 0, 1]),
                            hash: { name: 'SHA-256' }
                        },
                        usages: ['sign', 'verify']
                    }
                    break;
                case "sign":
                    result = {
                        algorithm:
                        {
                            name: 'RSASSA-PKCS1-V1_5',
                            hash: { name: 'SHA-256' }
                        },
                        usages: ['verify']
                    }
            }
            break;

            break;
        case "RC2-40-CBC":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":
                    result = {
                        algorithm: {
                            name: "RC2-40-CBC",
                            length: 5
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                case "decrypt":
                case "encrypt":
                    result = {
                        algorithm: {
                            name: "RC2-40-CBC",
                            iv: getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                            length: 5
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "RC2-40-CBC"
                        },
                        usages: []
                    };
            }
            break;
        case "DES-EDE3-CBC":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":
                    result = {
                        algorithm: {
                            name: "DES-EDE3-CBC",
                            length: 24
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                case "decrypt":
                case "encrypt":
                    result = {
                        algorithm: {
                            name: "DES-EDE3-CBC",
                            iv: getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                            length: 24
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "DES-EDE3-CBC"
                        },
                        usages: []
                    };
            }
            break;
        case "AES-128-CBC":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":
                    result = {
                        algorithm: {
                            name: "AES-128-CBC",
                            length: 16
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                case "decrypt":
                case "encrypt":
                    result = {
                        algorithm: {
                            name: "AES-128-CBC",
                            iv: getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                            length: 16
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "AES-128-CBC",
                            length: 16
                        },
                        usages: []
                    };
            }
            break;
        case "AES-192-CBC":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":
                    result = {
                        algorithm: {
                            name: "AES-192-CBC",
                            length: 24
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                case "decrypt":
                case "encrypt":
                    result = {
                        algorithm: {
                            name: "AES-192-CBC",
                            iv: getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                            length: 24
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "AES-192-CBC",
                            length: 24
                        },
                        usages: []
                    };
            }
            break;
        case "AES-256-CBC":
            switch (operation.toLowerCase()) {
                case "importkey":
                case "exportkey":
                case "generatekey":
                    result = {
                        algorithm: {
                            name: "AES-256-CBC",
                            length: 32
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                case "decrypt":
                case "encrypt":
                    result = {
                        algorithm: {
                            name: "AES-256-CBC",
                            iv: getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                            length: 32
                        },
                        usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "AES-256-CBC",
                            length: 32
                        },
                        usages: []
                    };
            }
            break;
        case "PBKDF2":
            switch (operation.toLowerCase()) {
                case "derivekey":
                    result = {
                        algorithm: {
                            name: "PBKDF2",
                            hash: { name: "SHA-256" },
                            salt: new Uint8Array([]),
                            iterations: 10000
                        },
                        usages: ["encrypt", "decrypt"]
                    };
                    break;
                default:
                    return {
                        algorithm: {
                            name: "PBKDF2"
                        },
                        usages: []
                    };
            }
            break;
        default:
    }

    return result;
}

function encryptEncryptedContentInfo(parameters) {
    //region Initial variables
    let sequence = Promise.resolve();
    //endregion

    //region Check for input parameters
    if ((parameters instanceof Object) === false)
        return Promise.reject("Parameters must have type \"Object\"");

    if (("password" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"password\"");

    if (("contentEncryptionAlgorithm" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"contentEncryptionAlgorithm\"");

    if (("hmacHashAlgorithm" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"hmacHashAlgorithm\"");

    if (("iterationCount" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"iterationCount\"");

    if (("contentToEncrypt" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"contentToEncrypt\"");

    if (("contentType" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"contentType\"");

    if (("pbeSchema" in parameters) === false)
        parameters.pbeSchema = "PBES2";

    const contentEncryptionOID = getOIDByAlgorithm(parameters.contentEncryptionAlgorithm);
    if (contentEncryptionOID === "")
        return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");

    const pbkdf2OID = getOIDByAlgorithm({
        name: "PBKDF2"
    });
    if (pbkdf2OID === "")
        return Promise.reject("Can not find OID for PBKDF2");

    const hmacOID = getOIDByAlgorithm({
        name: "HMAC",
        hash: {
            name: parameters.hmacHashAlgorithm
        }
    });
    if (hmacOID === "")
        return Promise.reject(`Incorrect value for \"hmacHashAlgorithm\": ${parameters.hmacHashAlgorithm}`);
    //endregion

    //region Special case for PBES1
    if (parameters.pbeSchema.toUpperCase() !== "PBES2")  // Assume we have PBES1 here
    {
        //region Initial variables
        const saltBuffer = new ArrayBuffer(20);
        const saltView = new Uint8Array(saltBuffer);
        getRandomValues(saltView);

        const ivLength = 8; // (in bytes) For current algorithms (3DES and RC2) IV length has the same value
        //endregion

        //region Check we have correct encryption algorithm
        let pbeAlgorithm;

        switch (parameters.contentEncryptionAlgorithm.name.toUpperCase()) {
            case "DES-EDE3-CBC":
                pbeAlgorithm = "1.2.840.113549.1.12.1.3"; // pbeWithSHAAnd3-KeyTripleDES-CBC
                break;
            case "RC2-40-CBC":
                pbeAlgorithm = "1.2.840.113549.1.12.1.6"; // pbeWithSHAAnd40BitRC2-CBC
                break;
            default:
                return Promise.reject("For PBES1 encryption algorithm could be only DES-EDE3-CBC or RC2-40-CBC");
        }
        //endregion

        //region Encrypt data using PBKDF1 as a source for key
        sequence = sequence.then(() =>
            nodeEngineNodeSpecific.encryptUsingPBKDF1Password(parameters.contentEncryptionAlgorithm.name, parameters.contentEncryptionAlgorithm.length, ivLength, parameters.password, saltBuffer, parameters.iterationCount, parameters.contentToEncrypt)
        );
        //endregion

        //region Store all parameters in EncryptedData object
        sequence = sequence.then(result => {
            const encryptedContentInfo = new EncryptedContentInfo({
                contentType: parameters.contentType,
                contentEncryptionAlgorithm: new AlgorithmIdentifier({
                    algorithmId: pbeAlgorithm,
                    algorithmParams: new asn1js.Sequence({
                        value: [
                            new asn1js.OctetString({ valueHex: saltBuffer }),
                            new asn1js.Integer({ value: parameters.iterationCount })
                        ]
                    })
                })
            });
            encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: result });

            return encryptedContentInfo;
        });
        //endregion

        return sequence;
    }
    //endregion

    //region Initial variables
    console.log(parameters);
    const ivBuffer = new ArrayBuffer(parameters.contentEncryptionAlgorithm.iv.length);
    const ivView = new Uint8Array(ivBuffer);
    getRandomValues(ivView);

    const saltBuffer = new ArrayBuffer(8);
    const saltView = new Uint8Array(saltBuffer);
    getRandomValues(saltView);

    const pbkdf2Params = new PBKDF2Params({
        salt: new asn1js.OctetString({ valueHex: saltBuffer }),
        iterationCount: parameters.iterationCount,
        prf: new AlgorithmIdentifier({
            algorithmId: hmacOID,
            algorithmParams: new asn1js.Null()
        })
    });
    //endregion

    //region Encrypt data using PBKDF2 as a source for key
    sequence = sequence.then(() =>
        nodeEngineNodeSpecific.encryptUsingPBKDF2Password(parameters.contentEncryptionAlgorithm.name, parameters.contentEncryptionAlgorithm.length, parameters.password, saltBuffer, parameters.iterationCount, parameters.hmacHashAlgorithm, ivBuffer, parameters.contentToEncrypt)
    );
    //endregion

    //region Store all parameters in EncryptedData object
    sequence = sequence.then(result => {
        const pbes2Parameters = new PBES2Params({
            keyDerivationFunc: new AlgorithmIdentifier({
                algorithmId: pbkdf2OID,
                algorithmParams: pbkdf2Params.toSchema()
            }),
            encryptionScheme: new AlgorithmIdentifier({
                algorithmId: contentEncryptionOID,
                algorithmParams: new asn1js.OctetString({ valueHex: ivBuffer })
            })
        });

        const encryptedContentInfo = new EncryptedContentInfo({
            contentType: parameters.contentType,
            contentEncryptionAlgorithm: new AlgorithmIdentifier({
                algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
                algorithmParams: pbes2Parameters.toSchema()
            })
        });
        encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: result });

        return encryptedContentInfo;
    }, error =>
            Promise.reject(error)
    );
    //endregion

    return sequence;
}
function getOIDByAlgorithm(algorithm) {
    let result = "";

    switch (algorithm.name.toUpperCase()) {
        case "RC2-40-CBC":
            result = "1.2.840.113549.3.2";
            break;
        case "DES-EDE3-CBC":
            result = "1.2.840.113549.3.7";
            break;
        case "AES-128-CBC":
            result = "2.16.840.1.101.3.4.1.2";
            break;
        case "AES-192-CBC":
            result = "2.16.840.1.101.3.4.1.22";
            break;
        case "AES-256-CBC":
            result = "2.16.840.1.101.3.4.1.42";
            break;
        case "PBKDF2":
            result = "1.2.840.113549.1.5.12";
            break;
        case "HMAC":
            switch (algorithm.hash.name.toUpperCase()) {
                case "SHA-1":
                    result = "1.2.840.113549.2.7";
                    break;
                case "SHA-256":
                    result = "1.2.840.113549.2.9";
                    break;
                case "SHA-384":
                    result = "1.2.840.113549.2.10";
                    break;
                case "SHA-512":
                    result = "1.2.840.113549.2.11";
                    break;
                default:
            }
            break;
        case "SHA-1":
            result = "1.3.14.3.2.26";
            break;
        case "SHA-256":
            result = "2.16.840.1.101.3.4.2.1";
            break;
        case "SHA-384":
            result = "2.16.840.1.101.3.4.2.2";
            break;
        case "SHA-512":
            result = "2.16.840.1.101.3.4.2.3";
            break;
        default:
    }

    return result;
}

function getRandomValues(view) {
    //console.log(typeof t);
    view.set(nodeEngineNodeSpecific.getRandomValues(view.length));
    return view;

}

function encryptUsingPBKDF2Password(
    algorithm,
    keyLength,
    password,
    salt,
    iterationCount,
    hashAlgorithm,
    iv,
    messageToEncrypt) {

    let cipher;

    hashAlgorithm = hashAlgorithm.replace('-', '');

    const key = crypto.pbkdf2Sync(
        Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);

    if (iv.byteLength) {
        cipher = crypto.createCipheriv(algorithm, key, Buffer.from(iv));
    } else {
        cipher = crypto.createCipher(algorithm, key);
    }

    return (new Uint8Array(
        Buffer.concat([cipher.update(Buffer.from(messageToEncrypt)), cipher.final()]))).buffer;
}

function decryptUsingPBKDF2Password(
    algorithm,
    keyLength,
    password,
    salt,
    iterationCount,
    hashAlgorithm,
    iv,
    messageToDecrypt) {

    let cipher;

    hashAlgorithm = hashAlgorithm.replace('-', '');

    const key = crypto.pbkdf2Sync(
        Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);

    if (iv.byteLength) {
        cipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv));
    } else {
        cipher = crypto.createDecipher(algorithm, key);
    }

    return (new Uint8Array(
        Buffer.concat([cipher.update(Buffer.from(messageToDecrypt)), cipher.final()]))).buffer;
}
function makePKCS12B2Key(
    hashAlgorithm,
    keyLength,
    password,
    salt,
    iterationCount) {

    let u;
    let v;

    const result = [];

    switch (hashAlgorithm.toUpperCase()) {
        case 'SHA1':
            u = 20; // 160
            v = 64; // 512
            break;
        case 'SHA256':
            u = 32; // 256
            v = 64; // 512
            break;
        case 'SHA384':
            u = 48; // 384
            v = 128; // 1024
            break;
        case 'SHA512':
            u = 64; // 512
            v = 128; // 1024
            break;
        default:
            throw new Error('Unsupported hashing algorithm');
    }

    const passwordViewInitial = new Uint8Array(password);
    const passwordTransformed = new ArrayBuffer((password.byteLength * 2) + 2);
    const passwordTransformedView = new Uint8Array(passwordTransformed);

    for (let i = 0; i < passwordViewInitial.length; i++) {
        passwordTransformedView[i * 2] = 0x00;
        passwordTransformedView[i * 2 + 1] = passwordViewInitial[i];
    }

    passwordTransformedView[passwordTransformedView.length - 2] = 0x00;
    passwordTransformedView[passwordTransformedView.length - 1] = 0x00;

    password = passwordTransformed.slice(0);

    const D = new ArrayBuffer(v);
    const dView = new Uint8Array(D);

    for (let i = 0; i < D.byteLength; i++) {
        dView[i] = 3;
    } // The ID value equal to "3" for MACing (see B.3 of standard)

    // region Concatenate copies of the salt together to
    // create a string S of length v * ceil(s / v) bytes
    // (the final copy of the salt may be trunacted to create S)
    const saltLength = salt.byteLength;

    const sLen = v * Math.ceil(saltLength / v);
    const S = new ArrayBuffer(sLen);
    const sView = new Uint8Array(S);

    const saltView = new Uint8Array(salt);

    for (let i = 0; i < sLen; i++) {
        sView[i] = saltView[i % saltLength];
    }
    // endregion

    // region Concatenate copies of the password
    // together to create a string P of length v * ceil(p / v)
    // bytes (the final copy of the password may be truncated to create P)
    const passwordLength = password.byteLength;

    const pLen = v * Math.ceil(passwordLength / v);
    const P = new ArrayBuffer(pLen);
    const pView = new Uint8Array(P);

    const passwordView = new Uint8Array(password);

    for (let i = 0; i < pLen; i++) {
        pView[i] = passwordView[i % passwordLength];
    }
    // endregion

    // region Set I=S||P to be the concatenation of S and P
    const sPlusPLength = S.byteLength + P.byteLength;

    let I = new ArrayBuffer(sPlusPLength);
    let iView = new Uint8Array(I);

    iView.set(sView);
    iView.set(pView, sView.length);
    // endregion

    // region Set c=ceil(n / u)
    // tslint:disable-next-line:no-bitwise
    const c = Math.ceil((keyLength >> 3) / u);
    // endregion

    // region For i=1, 2, ..., c, do the following:
    for (let i = 0; i <= c; i++) {
        // region Create contecanetion of D and I
        const dAndI = new ArrayBuffer(D.byteLength + I.byteLength);
        const dAndIView = new Uint8Array(dAndI);

        dAndIView.set(dView);
        dAndIView.set(iView, dView.length);
        // endregion

        // region Make "iterationCount" rounds of hashing
        let roundBuffer = Buffer.from(dAndI);

        for (let j = 0; j < iterationCount; j++) {
            const hash = crypto.createHash(hashAlgorithm);
            hash.update(roundBuffer);
            roundBuffer = hash.digest();
        }
        // endregion

        // region Concatenate copies of Ai to create a string B of
        // length v bits (the final copy of Ai may be truncated to create B)
        const B = new ArrayBuffer(v);
        const bView = new Uint8Array(B);

        for (let j = 0; j < B.byteLength; j++) {
            bView[j] = roundBuffer[j % roundBuffer.length];
        }
        // endregion

        // region Make new I value
        const k = Math.ceil(saltLength / v) + Math.ceil(passwordLength / v);
        const iRound = [];

        let sliceStart = 0;
        let sliceLength = v;

        for (let j = 0; j < k; j++) {
            const chunk = Array.from(new Uint8Array(I.slice(sliceStart, sliceStart + sliceLength)));
            sliceStart += v;
            if ((sliceStart + v) > I.byteLength) {
                sliceLength = I.byteLength - sliceStart;
            }

            let x = 0x1ff;

            for (let l = (B.byteLength - 1); l >= 0; l--) {
                // tslint:disable-next-line:no-bitwise
                x = x >> 8;
                x += bView[l] + chunk[l];
                // tslint:disable-next-line:no-bitwise
                chunk[l] = (x & 0xff);
            }

            iRound.push(...chunk);
        }

        I = new ArrayBuffer(iRound.length);
        iView = new Uint8Array(I);

        iView.set(iRound);
        // endregion

        result.push(...roundBuffer);
    }
    // endregion

    // region Initialize final key
    // tslint:disable-next-line:no-bitwise
    const resultBuffer = new ArrayBuffer(keyLength >> 3);
    const resultView = new Uint8Array(resultBuffer);

    // tslint:disable-next-line:no-bitwise
    resultView.set((new Uint8Array(result)).slice(0, keyLength >> 3));
    // endregion
    // endregion

    return Buffer.from(resultBuffer);
}

function stampDataWithPassword(
    hashAlgorithm,
    keyLength,
    password,
    salt,
    iterationCount,
    stampingData,
    method) {

    let key;

    if (method === undefined) {
        method = 'pkcs12';
    }
    console.log('hashAlgorithm', hashAlgorithm);
    hashAlgorithm = hashAlgorithm.replace('-', '');

    // region Derive key using PKCS#12 algorithm from B.2 item of standard
    switch (method.toLowerCase()) {
        case 'pbkdf2':
            key = crypto.pbkdf2Sync(
                Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);
            break;
        case 'pkcs12':
        default:
            key = makePKCS12B2Key(hashAlgorithm, keyLength, password, salt, iterationCount);
    }
    // endregion

    const hmac = crypto.createHmac(hashAlgorithm, key);
    hmac.update(Buffer.from(stampingData));

    return (new Uint8Array(hmac.digest())).buffer;
}

function engineStampDataWithPassword(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
		
		if(("salt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("contentToStamp" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToStamp\"");
		//endregion
		
		//region Initial variables
		let length;
		//endregion
		
		//region Choose correct length for HMAC key
		switch(parameters.hashAlgorithm.toLowerCase())
		{
			case "sha-1":
				length = 160;
				break;
			case "sha-256":
				length = 256;
				break;
			case "sha-384":
				length = 384;
				break;
			case "sha-512":
				length = 512;
				break;
			default:
				return Promise.reject(`Incorrect \"parameters.hashAlgorithm\" parameter: ${parameters.hashAlgorithm}`);
		}
		//endregion

		return Promise.resolve().then(() =>
			nodeEngineNodeSpecific.stampDataWithPassword(parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount, parameters.contentToStamp)
		);
	}

function verifyDataStampedWithPassword(
    hashAlgorithm,
    keyLength,
    password,
    salt,
    iterationCount,
    stampedData,
    signatureToVerify,
    method) {

    let key;

    if (method === undefined) {
        method = 'pkcs12';
    }

    hashAlgorithm = hashAlgorithm.replace('-', '');

    // region Derive key using PKCS#12 algorithm from B.2 item of standard
    switch (method.toLowerCase()) {
        case 'pbkdf2':
            key = crypto.pbkdf2Sync(
                Buffer.from(password), Buffer.from(salt), iterationCount, keyLength, hashAlgorithm);
            break;
        case 'pkcs12':
        default:
            key = makePKCS12B2Key(hashAlgorithm, keyLength, password, salt, iterationCount);
    }
    // endregion

    const hmac = crypto.createHmac(hashAlgorithm, key);
    hmac.update(Buffer.from(stampedData));
    const hmacValue = new Uint8Array(hmac.digest());

    // region Compare HMAC digest with signature to verify
    const dataView = new Uint8Array(signatureToVerify);

    if (hmacValue.length !== dataView.length) {
        return false;
    }

    let result = true;

    for (let i = 0; i < hmacValue.length; i++) {
        if (hmacValue[i] !== dataView[i]) {
            result = false;
            break;
        }
    }

    return result;
}

function getAlgorithmByOID(oid)
{
    switch(oid)
    {
        case "1.2.840.113549.3.2":
            return {
                name: "RC2-40-CBC",
                length: 5
            };
        case "1.2.840.113549.3.7":
            return {
                name: "DES-EDE3-CBC",
                length: 24
            };
        case "2.16.840.1.101.3.4.1.2":
            return {
                name: "AES-128-CBC",
                length: 16
            };
        case "2.16.840.1.101.3.4.1.22":
            return {
                name: "AES-192-CBC",
                length: 24
            };
        case "2.16.840.1.101.3.4.1.42":
            return {
                name: "AES-256-CBC",
                length: 32
            };
        case "1.2.840.113549.1.5.12":
            return {
                name: "PBKDF2"
            };
        case "1.3.14.3.2.26":
            return {
                name: "SHA-1"
            };
        case "2.16.840.1.101.3.4.2.1":
            return {
                name: "SHA-256"
            };
        case "2.16.840.1.101.3.4.2.2":
            return {
                name: "SHA-384"
            };
        case "2.16.840.1.101.3.4.2.3":
            return {
                name: "SHA-512"
            };
        case "1.2.840.113549.2.7":
            return {
                name: "HMAC",
                hash: {
                    name: "SHA-1"
                }
            };
        case "1.2.840.113549.2.9":
            return {
                name: "HMAC",
                hash: {
                    name: "SHA-256"
                }
            };
        case "1.2.840.113549.2.10":
            return {
                name: "HMAC",
                hash: {
                    name: "SHA-384"
                }
            };
        case "1.2.840.113549.2.11":
            return {
                name: "HMAC",
                hash: {
                    name: "SHA-512"
                }
            };
        default:
    }
    
    return {};
}


function decryptEncryptedContentInfo(parameters)
{
    //region Initial variables
    let pbes1EncryptionAlgorithm = "";
    let pbes1EncryptionAlgorithmLength = 0;
    let pbes1EncryptionIVLength = 8;

    let pbes2Parameters;
    let pbkdf2Params;
    //endregion
    
    //region Check for input parameters
    if((parameters instanceof Object) === false)
        return Promise.reject("Parameters must have type \"Object\"");
    
    if(("password" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"password\"");
    
    if(("encryptedContentInfo" in parameters) === false)
        return Promise.reject("Absent mandatory parameter \"encryptedContentInfo\"");
    
    switch(parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId)
    {
        case "1.2.840.113549.1.5.13": // pkcs5PBES2
            break;
        case "1.2.840.113549.1.12.1.3": // pbeWithSHAAnd3-KeyTripleDES-CBC
            pbes1EncryptionAlgorithm = "DES-EDE3-CBC";
            pbes1EncryptionAlgorithmLength = 24;
            break;
        case "1.2.840.113549.1.12.1.6": // pbeWithSHAAnd40BitRC2-CBC
            pbes1EncryptionAlgorithm = "RC2-40-CBC";
            pbes1EncryptionAlgorithmLength = 5;
            break;
        default:
            return Promise.reject(`Unknown \"contentEncryptionAlgorithm\": ${parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
    }
    //endregion
    
    //region Create correct data block for decryption
    let dataBuffer = new ArrayBuffer(0);
    
    if(parameters.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
        dataBuffer = parameters.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
    else
    {
        for(const content of parameters.encryptedContentInfo.encryptedContent.valueBlock.value)
            dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
    }
    //endregion

    //region Check if we have PBES1
    if(pbes1EncryptionAlgorithm.length)
    {
        //region Description
        const pbesParameters = parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
        
        const saltBuffer = pbesParameters.valueBlock.value[0].valueBlock.valueHex;
        const iterationCount = pbesParameters.valueBlock.value[1].valueBlock.valueDec;
        //endregion
        
        return Promise.resolve().then(() =>
            nodeEngineNodeSpecific.decryptUsingPBKDF1Password(pbes1EncryptionAlgorithm, pbes1EncryptionAlgorithmLength, pbes1EncryptionIVLength, parameters.password, saltBuffer, iterationCount, dataBuffer)
        );
    }
    //endregion
    
    //region Initial variables
    try
    {
        pbes2Parameters = new PBES2Params({ schema: parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
    }
    catch(ex)
    {
        return Promise.reject("Incorrectly encoded \"pbes2Parameters\"");
    }
    
    try
    {
        pbkdf2Params = new PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
    }
    catch(ex)
    {
        return Promise.reject("Incorrectly encoded \"pbkdf2Params\"");
    }
    
    const contentEncryptionAlgorithm = getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId);
    if(("name" in contentEncryptionAlgorithm) === false)
        return Promise.reject(`Incorrect OID for \"contentEncryptionAlgorithm\": ${pbes2Parameters.encryptionScheme.algorithmId}`);
    
    const ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
    const saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;
    
    const iterationCount = pbkdf2Params.iterationCount;
    
    let hmacHashAlgorithm = "SHA-1";
    
    if("prf" in pbkdf2Params)
    {
        const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
        if(("name" in algorithm) === false)
            return Promise.reject("Incorrect OID for HMAC hash algorithm");
        
        hmacHashAlgorithm = algorithm.hash.name;
    }
    //endregion
    
    return Promise.resolve().then(() =>
        decryptUsingPBKDF2Password(contentEncryptionAlgorithm.name, contentEncryptionAlgorithm.length, parameters.password, saltBuffer, iterationCount, hmacHashAlgorithm, ivBuffer, dataBuffer)
    );
}
module.exports = {
    subtle: webcrypto.subtle,
    getAlgorithmParameters,
    encryptEncryptedContentInfo,
    getOIDByAlgorithm,
    getRandomValues,
    encryptUsingPBKDF2Password,
    decryptUsingPBKDF2Password,
    makePKCS12B2Key,
    stampDataWithPassword,
    verifyDataStampedWithPassword,
    getAlgorithmByOID,
    decryptEncryptedContentInfo,
    engineStampDataWithPassword
}

