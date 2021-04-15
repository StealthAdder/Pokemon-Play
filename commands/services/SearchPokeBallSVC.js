const SearchPokeBallSVC = async (client, msg, args, messageArray) => {
  // console.log(args);
  // console.log(messageArray);
  const fetch = require('node-fetch');
  const { MessageEmbed } = require('discord.js');

  let embed = new MessageEmbed();
  let messageid = msg.id;
  let channelid = msg.channel.id;

  // Internal API contact.
  const patchPokeBall = async (payload) => {
    // console.log(payload);
    let userid = msg.author.id;
    payload.userid = userid;
    // console.log(payload);
    let backendIp = process.env.backendIp;

    let response = await fetch(`${backendIp}/pokemon/pokeball`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  // pokeball Function
  const pokeball = async (item) => {
    console.log(item);

    // Fetch from PokeAPI
    const getItems = await fetch(`https://pokeapi.co/api/v2/item/${item}`);
    const ItemsResult = await getItems.json();
    // // console.log(ItemsResult);

    const { category, id, cost, name, sprites } = ItemsResult;
    let value = 2;
    if (category.name === 'standard-balls') {
      value = 1;
    }
    // console.log(value);

    let payload = {
      value: value,
    };

    let result = await patchPokeBall({ value });
    if (result.addedItem === true) {
      embed
        .setAuthor(
          `Hey ${msg.author.username}`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        )
        .setImage(sprites.default)
        .addField(
          'In the wild search we found',
          `**Item** : **${name.toUpperCase()}**\n**Quantity** : ${value}\n**Category** : ${category.name.toUpperCase()}`
        )
        .addField(
          'ℹ️ Inventory Update',
          `Now you have got **${result.info.pokeball.pokeballCount}** PokeBall!`
        )
        .setColor(
          `#${Math.floor((Math.random() * 0xffffff) << 0)
            .toString(16)
            .padStart(6, '0')}`
        );
      await msg.channel.send(embed);
    }
  };

  // const noPokeBall = () => {
  //   embed
  //     .setAuthor(
  //       `Hey ${msg.author.username}`,
  //       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
  //     )
  //     .setDescription(`**Found Nothing**`)
  //     .setColor(
  //       `#${Math.floor((Math.random() * 0xffffff) << 0)
  //         .toString(16)
  //         .padStart(6, '0')}`
  //     );

  //   let seed = msg.channel.send(embed);
  // };

  let specialBalls = [7, 10, 13, 11, 8, 617, 6, 15, 9, 887, 16, 12, 14];
  let standardBalls = [4, 2, 1, 457, 5, 456, 3];

  let random_boolean = Math.random() < 0.5;
  let item;

  if (random_boolean) {
    item = specialBalls[Math.floor(Math.random() * specialBalls.length)];
    // console.log(`specialBalls: ${item}`);
    await pokeball(item);
  } else {
    item = standardBalls[Math.floor(Math.random() * standardBalls.length)];
    // console.log(`standardBalls: ${item}`);
    await pokeball(item);
  }
};

module.exports = SearchPokeBallSVC;
