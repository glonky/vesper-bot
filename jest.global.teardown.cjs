module.exports = async () => {
   try {
      await global.redisClient?.quit();
   } catch(err) {
      console.error("Error in global jest teardown", err);
      throw err;
   }
};