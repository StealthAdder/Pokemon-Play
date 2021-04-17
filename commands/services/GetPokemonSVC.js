const GetPokemonSVC = async (client, msg, args, messageArray, payload) => {
  const fetch = require('node-fetch');
  const { MessageEmbed } = require('discord.js');
  const embed = new MessageEmbed();
  const backendIp = process.env.backendIp;

  // Imports
  const SSOCheck = require('./SSOCheck');

  const fetchPokemon = async (PokemonName) => {
    const getPokemon = fetch(
      `https://pokeapi.co/api/v2/pokemon/${PokemonName}`
    );
    return (await getPokemon).json();
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

  var { sprites, name, abilities, id, base_experience } = pokemonRes;
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
  // console.log(pal_park_encounters.length);

  embed
    .setAuthor(
      '⚡Poké Ball Ready!⚡',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
    )
    .setImage(sprites.front_default)
    .setTitle(`Found one pokémon near ${area}!!!`)
    .addField(
      `${name.toUpperCase()}`,
      `**Best-Ability** : ${abilities[0].ability.name.toUpperCase()}\n**Capture Rate** : ${capture_rate}%\n**Legendary** : ${is_legendary}\n**Base Happiness** :${base_happiness}\n`
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
  // console.log(channelid);
  // console.log(messageid);

  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    if (user.id === msg.author.id) {
      if (reaction.message.channel.id === channelid) {
        if (reaction.message.id === messageid) {
          if (reaction.emoji.name === '💠') {
            // SSO Check
            let userid = payload.userid;
            let ssoRes = await SSOCheck({ userid });
            // console.log(ssoRes);

            // Check for PokeBall
            let resEmbed = new MessageEmbed();
            if (ssoRes.info[0].pokeball.pokeballCount === 0) {
              resEmbed
                .setAuthor(
                  `Hey ${user.username}`,
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                )
                .setImage(sprites.front_default)
                .setTitle(`Capture attempt failed!`)
                .addField(
                  `Reason`,
                  `⚠️**PokeBall** : ${ssoRes.info[0].pokeball.pokeballCount}\n`
                )
                .setDescription(`${name.toUpperCase()} Escaped!`)
                .setColor(
                  `#${Math.floor((Math.random() * 0xffffff) << 0)
                    .toString(16)
                    .padStart(6, '0')}`
                );
              await msg.channel.send(resEmbed);
              await seed.delete({ timeout: 250 });
              return;
            }

            // API CALL
            // check if data created then send msg

            // const hours = new Date().getHours();
            // const isDayTime = hours > 6 && hours < 20;
            // const isNightTime = hours < 6 && hours > 20;
            // capture_rate <= 45 && base_happiness < 70
            if (capture_rate <= 45 && base_happiness < 70) {
              payload.captured = false;
              payload.pokeballCount = ssoRes.info[0].pokeball.pokeballCount;
              let deductPokeball = await fetch(`${backendIp}/pokemon/capture`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              let deductPokeballRes = await deductPokeball.json();

              if (deductPokeballRes.deducted === true) {
                resEmbed
                  .setAuthor(
                    `Hey ${user.username}`,
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                  )
                  .setImage(sprites.front_default)
                  .setTitle(`Capture attempt failed!`)
                  .addField(
                    `Reason`,
                    `⚠️**Capture Rate** : ${capture_rate}%\n⚠️**Happiness** : ${base_happiness}\n💡**Hint**: 'Capture Rate & Happiness if Higher,\nThere is a good chance of capturing the pokémon!'`
                  )
                  .addField(
                    'ℹ️ Inventory Update',
                    `Now you have got **${deductPokeballRes.success.pokeball.pokeballCount}** PokeBall!`
                  )
                  .setDescription(`${name.toUpperCase()} Escaped!`)
                  .setColor(
                    `#${Math.floor((Math.random() * 0xffffff) << 0)
                      .toString(16)
                      .padStart(6, '0')}`
                  );

                await msg.channel.send(resEmbed);
                await seed.delete({ timeout: 250 });
              }
              return;
            }

            payload.pokemonName = name;
            payload.captured = true;
            payload.pokeid = id;
            payload.is_legendary = is_legendary;
            payload.pokeballCount = ssoRes.info[0].pokeball.pokeballCount;
            // console.log(payload);

            const captured = await fetch(`${backendIp}/pokemon/capture`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            const capturedRes = await captured.json();

            if (capturedRes.created === true) {
              // console.log(capturedRes.success);
              resEmbed
                .setAuthor(
                  `⚡Nice Work ${user.username}⚡`,
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                )
                .setImage(sprites.front_default)
                .setTitle(`${name.toUpperCase()} Captured`)
                .setDescription(
                  `${name.toUpperCase()} successfully added to you're collection.`
                )
                .addField(
                  'ℹ️ Inventory Update',
                  `Now you have got **${capturedRes.success.pokeball.pokeballCount}** PokeBall!`
                )
                .setColor(
                  `#${Math.floor((Math.random() * 0xffffff) << 0)
                    .toString(16)
                    .padStart(6, '0')}`
                )
                .setFooter(
                  `pokémon Bot`,
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                );
            }
            await msg.channel.send(resEmbed);
            await seed.delete({ timeout: 500 });
          }

          if (reaction.emoji.name === '❌') {
            console.log(`Ignored`);
          }
        }
      }
    } else {
      // somebody else reacted
    }
  });
};

module.exports = GetPokemonSVC;
