module.exports = async () => {
   await global.redisClient?.disconnect();
};