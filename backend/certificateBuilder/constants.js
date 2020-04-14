const hashAlg = "SHA-256";
const signAlg = "RSASSA-PKCS1-v1_5";
const issuerTypesMap = {
  country: '2.5.4.6',
  organizationName: '2.5.4.10',
  organizationalUnit: '2.5.4.11',
  commonName: '2.5.4.3',
  localityName: '2.5.4.7',
  stateName: '2.5.4.8',
  email: '1.2.840.113549.1.9.1'
};
const issuerTypesRevMap = {
  '2.5.4.6': 'country',
  '2.5.4.10': 'organizationName',
  '2.5.4.11': 'organizationalUnit',
  '2.5.4.3': 'commonName',
  '2.5.4.7': 'localityName',
  '2.5.4.8': 'stateName',
  '1.2.840.113549.1.9.1': 'email'
};
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
};
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
};
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
};


module.exports = {
  hashAlg : hashAlg,
  signAlg : signAlg,
  issuerTypesMap: issuerTypesMap,
  issuerTypesRevMap: issuerTypesRevMap,
  extendedKeyUsageMap: extendedKeyUsageMap,
  extendedKeyUsageRevMap: extendedKeyUsageRevMap,
  algomap:algomap
}