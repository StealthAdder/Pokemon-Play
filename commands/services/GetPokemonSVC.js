const GetPokemonSVC = async (client, msg, args, messageArray, payload) => {
  const fetch = require('node-fetch');
  const { MessageEmbed } = require('discord.js');
  const embed = new MessageEmbed();
  const fetchPokemon = async (PokemonName) => {
    const getPokemon = fetch(
      `https://pokeapi.co/api/v2/pokemon/${PokemonName}`
    );
    return (await getPokemon).json();
    // console.log(gpResponse);
  };

  const fetchPokemonSpecies = async (PokemonName) => {
    const getPokemonSpecies = fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${PokemonName}`
    );
    return (await getPokemonSpecies).json();
  };

  let PokemonName = Math.floor(Math.random() * (898 - 1 + 1)) + 1;

  let pokemonRes = await fetchPokemon(PokemonName);
  // console.log(pokemonRes);
  let pokemonSpeciesRes = await fetchPokemonSpecies(PokemonName);
  // console.log(pokemonSpeciesRes);

  var { sprites, name, abilities, base_experience } = pokemonRes;
  var {
    base_happiness,
    capture_rate,
    flavor_text_entries,
    is_legendary,
    is_mythical,
    pal_park_encounters,
  } = pokemonSpeciesRes;

  let area;
  if (pal_park_encounters.length === 0) {
    area = 'tree';
  } else {
    area = pal_park_encounters[0].area.name;
  }
  console.log(pal_park_encounters.length);

  embed
    .setAuthor(
      '⚡Poké Ball Ready!⚡',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
    )
    .setImage(sprites.front_default)
    .setTitle(`Found one pokémon near ${area}!!!`)
    // .setDescription(
    //   `Name: **${name.toUpperCase()}**\nBase Experience: **${base_experience}**\nBest-Ability: **${abilities[0].ability.name.toUpperCase()}**\nWeight: **${weight} lbs**\nHeight: **${height} m**\nType: **${powers
    //     .toString()
    //     .toUpperCase()}**\nEnergy Needed to Catch: **${energy}**`
    // )
    .addField(
      `${name.toUpperCase()}`,
      `**Best-Ability** : ${abilities[0].ability.name.toUpperCase()}\n**Capture Rate** : ${capture_rate}\n**Legendary**:\n**Base Happiness** :${base_happiness}\n`
    )
    .setColor(
      `#${Math.floor((Math.random() * 0xffffff) << 0)
        .toString(16)
        .padStart(6, '0')}`
    )
    .setFooter(`React 💠 to Catch & ❌ to Ignore`, msg.author.avatarURL());
  let seed = await msg.channel.send(embed);
  await seed.react('💠');
  await seed.react('❌');
  var channelid = seed.channel.id;
  var messageid = seed.id;
  console.log(channelid);
  console.log(messageid);

  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    if (user.id === msg.author.id) {
      if (reaction.message.channel.id === channelid) {
        if (reaction.message.id === messageid) {
          // if (reaction.emoji.name = '')
          console.log(reaction.emoji);
        }
      }
    } else {
      // somebody else reacted
    }
  });
};

module.exports = GetPokemonSVC;
