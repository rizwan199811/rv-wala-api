const jwt = require('jsonwebtoken');
const asyncMiddleWare = require('../utils/asyncMiddleware');
const status = require('../utils/statusCodes');

async function signJwt(data) {
    return jwt.sign(data, 'thesecretekey', { algorithm: 'HS256' });
}

async function verifyJwt(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
        jwt.verify(token, 'thesecretekey', (err, decoded) => {
            if (decoded) {
                req.decoded = decoded;
                next();
            } else {
                res.status(status.client.unAuthorized).json({
                    message: 'Token Is Not Valid'
                });
            }
        });
    } else {
        res.status(status.client.badRequest).json({
            message: 'Auth Token Is Not Supplied'
        });
    }
}


module.exports = {
    signJwt,
    verifyJwt
};
