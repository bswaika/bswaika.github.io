module.exports = {
    logger: (req, res, next) => {
        console.log(`${req.ip} -- ${req.method} ${req.path} ${req.protocol.toUpperCase()} -- [${new Date().toISOString()}]`);
        next();
    }
}