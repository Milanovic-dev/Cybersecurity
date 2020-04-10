const fs = require('fs');
const {generateOCSPResponse, parseOCSPRequest} = require('../certificateBuilder/builder');

module.exports = function (app) {
    app.post('/ocsp/check', async (req, res) => {
        let request = parseOCSPRequest(buf2ab(req.body));
        if (!request.length) {
            res.status(500);
            return;
        }

        console.log(request);

        res.writeHead(200, [['Content-Type', 'application/ocsp-respose']]);

        let response = await generateOCSPResponse(
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