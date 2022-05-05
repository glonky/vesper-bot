/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = async () => {
  // eslint-disable-next-line no-empty
  try {
  } catch (err) {
    console.error('Error in jest global setup', err);
    throw err;
  }
};
