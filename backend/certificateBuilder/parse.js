const buf2ab = (buffer) => {
  var buf = new ArrayBuffer(buffer.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = buffer.length; i < strLen; i++) {
      bufView[i] = buffer[i];
  }
  return buf;
};

const pemStringToArrayBuffer = (pemString) => {
  return buf2ab(Buffer.from(pemString.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64'));
};


const formatPEM = (pemString) => {
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
};

const importPrivateKey = (cert) => {
  return new Promise(function (resolve) {
      const crypto = getCrypto();
      var importer = crypto.subtle.importKey("pkcs8", buf2ab(Buffer.from(cert.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----BEGIN PRIVATE KEY-----', '').replace(/\r/g, '').replace(/\n/g, ''), 'base64')), {
          name: Constants.signAlg,
          hash: {
              name: Constants.hashAlg
          },
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1])
      }, true, ["sign"])
      importer.then(function (key) {
          resolve(key)
      })
  })
};

module.exports = {
  buf2ab: buf2buf,
  pemStringToArrayBuffer: pemStringToArrayBuffer,
  formatPEM: formatPEM,
  importPrivateKey: importPrivateKey

}
