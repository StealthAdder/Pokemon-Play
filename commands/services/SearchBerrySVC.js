const SearchBerrySVC = async (client, msg, args, messageArray) => {
  // console.log(args);
  // console.log(messageArray);
  const fetch = require('node-fetch');
  const { MessageEmbed } = require('discord.js');

  let embed = new MessageEmbed();
  let messageid = msg.id;
  let channelid = msg.channel.id;
  let backendIp = process.env.backendIp;
  let randomBerry = Math.floor(Math.random() * (64 - 1 + 1));
  console.log(randomBerry);

  // Internal API Contact
  const patchBerry = async (payload) => {
    const response = await fetch(`${backendIp}/pokemon/berry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  const berry = async (randomBerry) => {
    // Fetch berry from API
    const getBerry = await fetch(
      `https://pokeapi.co/api/v2/berry/${randomBerry}`
    );
    const berryResult = await getBerry.json();
    let berryName = berryResult.item.name;
    let result = await patchBerry({ berryName });

    // if result addedBerry ==== true
  };
  await berry(randomBerry);
};

module.exports = SearchBerrySVC;
