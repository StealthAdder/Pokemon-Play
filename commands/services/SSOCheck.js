const fetch = require('node-fetch');
const backendIp = process.env.backendIp;
const checkSignIn = async (info) => {
  let result = await fetch(`${backendIp}/pokemon/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });
  return await result.json();
};

module.exports = checkSignIn;
