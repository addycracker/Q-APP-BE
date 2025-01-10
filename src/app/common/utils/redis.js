const redis = require('redis');

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const addCache = async function (key, data, cacheTime) {
  try {
    return await client.set(key, JSON.stringify(data), {
      EX: cacheTime,
    });
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getCacheByKey = async function (key) {
  const data = await client.get(key);
  return JSON.parse(data) ? data : undefined;
};

const invalidateCacheByKey = async function (key) {
  try {
    return await client.del(key);
  } catch (err) {
    return false;
  }
};

module.exports = {
  addCache,
  getCacheByKey,
  invalidateCacheByKey,
  client,
};
