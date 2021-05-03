const InventorySVC = async (client, msg, args, messageArray) => {
  const fetch = require('node-fetch');
  const { MessageEmbed } = require('discord.js');

  let embed = new MessageEmbed();
  let messageid = msg.id;
  let channelid = msg.channel.id;
  let backendIp = process.env.backendIp;

  // Internal API call
  const getInv = async (payload) => {
    let response = await fetch(`${backendIp}/pokemon/inv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  let userid = msg.author.id;
  let getInvRes = await getInv({ userid });

  if (getInvRes.exists === true) {
    let { pokeball, berry, xp, pokemonCollection } = getInvRes.info[0];
    embed
      .setAuthor(
        `Hey ${msg.author.username}`,
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
      )
      .addField(
        'ℹ️Inventory Information',
        `**Trainer Name**: ${msg.author.username}\n**XP Level**: ${xp}\n**PokeBall Count**: ${pokeball.pokeballCount}\n**Berries**: ${berry.berryCount}\n**Pokemon collected**: ${pokemonCollection.length}`
      )
      .setColor(
        `#${Math.floor((Math.random() * 0xffffff) << 0)
          .toString(16)
          .padStart(6, '0')}`
      );
    await msg.channel.send(embed);
  }
};

module.exports = InventorySVC;
