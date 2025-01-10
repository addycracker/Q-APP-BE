function sanitisePayload(payload) {
  for (const key in payload) {
    !payload[key] && delete payload[key];
  }
  return payload;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  sanitisePayload,
  generateOtp,
};
