const fs = require('fs');
const {generateOCSPResponse, parseOCSPRequest} = require('../certificateBuilder/builder');
const {fetchUpToRootAsync} = require('../admin/certificateStore');

module.exports = function (app) {
    app.post('/ocsp/check', async (req, res) => {
        let request = parseOCSPRequest(buf2ab(req.body));
        if (!request.length) {
            res.status(500);
            return;
        }

        console.log(request);

        let chain = await fetchUpToRootAsync(request[0].serialNumber.toString());


        res.writeHead(200, [['Content-Type', 'application/ocsp-respose']]);

        let response = await generateOCSPResponse(
            fs.readFileSync(chain[0].certPath, 'utf8'),
            fs.readFileSync(chain[0].pkPath, 'utf8'),
            fs.readFileSync(chain.length == 1 ? chain[0].certPath : chain[1].certPath, 'utf8'),
            request[0],
            chain[0].revoked
        );

        console.log(response);

        if (response.error) {
            res.status(500);
            return;
        }

        res.end(Buffer.from(response.response));
    })
};