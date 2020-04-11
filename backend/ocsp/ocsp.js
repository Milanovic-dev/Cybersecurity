import certificateStore from '../admin/certificateStore';
const fs = require('fs');
const {generateOCSPResponse, parseOCSPRequest} = require('../certificateBuilder/builder');
const moment = require('moment');

function buf2ab(buffer) {
    var buf = new ArrayBuffer(buffer.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = buffer.length; i < strLen; i++) {
        bufView[i] = buffer[i];
    }
    return buf;
}


module.exports = function (app) {
    app.post('/ocsp/check', async (req, res) => {
        let request = parseOCSPRequest(buf2ab(req.body));
        if (!request.length) {
            res.status(500);
            return;
        }

        console.log(request);

        let chain = await certificateStore.fetchUpToRootAsync(request[0].serialNumber.toString());
        console.log(chain);

        res.writeHead(200, [['Content-Type', 'application/ocsp-respose']]);

        let response = await generateOCSPResponse(
            chain[0].certificate,
            chain[0].privateKey,
            chain.length == 1 ? chain[0].certificate : chain[1].certificate,
            request[0],
            chain[0].revoked ? moment.unix(chain[0].revoked).toDate() : null 
        );

        console.log(response);

        if (response.error) {
            res.status(500);
            return;
        }

        res.end(Buffer.from(response.response));
    })
};