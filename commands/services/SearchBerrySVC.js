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
    let userid = msg.author.id;

    let berryCountRes = await patchBerry({ berryName, userid });

    if (berryCountRes.addedBerry === true) {
      let sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berryName}.png`;
      embed
        .setAuthor(
          `Hey ${msg.author.username}`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        )
        .setImage(sprite)
        .addField(
          'In the wild search we found',
          `**Item** : **${berryName.toUpperCase()}**`
        )
        .addField(
          'ℹ️ Inventory Update',
          `Now you have got **${berryCountRes.info.berry.berryCount}** Berries!`
        )
        .setColor(
          `#${Math.floor((Math.random() * 0xffffff) << 0)
            .toString(16)
            .padStart(6, '0')}`
        );
      await msg.channel.send(embed);
    }
  };
  await berry(randomBerry);
};

module.exports = SearchBerrySVC;
