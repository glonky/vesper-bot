module.exports = async () => {
  // eslint-disable-next-line no-empty
  try {
  } catch (err) {
    console.error('Error in global jest teardown', err);
    throw err;
  }
};
