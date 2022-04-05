module.exports = async () => {
   try {
   } catch(err) {
      console.error("Error in global jest teardown", err);
      throw err;
   }
};
