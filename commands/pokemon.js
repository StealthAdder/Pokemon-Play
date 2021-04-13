module.exports.run = async (client, message, args, messageArray) => {
  const prefix = require('../prefix.json');
  const { MessageEmbed } = require('discord.js');
  const fetch = require('node-fetch');
  const embed = new MessageEmbed();
  // console.log(args);
  // console.log(messageArray);
  const msg = message;
  const backendIp = process.env.backendIp;
  // setTimeout(() => message.delete(), 5000);

  const userid = msg.author.id;

  // SignIn Checker
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

  // GET Pokemons
  const getPokemon = async (PokemonName, credits) => {
    const api = `https://pokeapi.co/api/v2/pokemon/${PokemonName}`;
    fetch(api)
      .then((response) => {
        return response.json();
      })
      .then(async (data) => {
        // console.log(data);
        var {
          sprites,
          abilities,
          name,
          base_experience,
          types,
          weight,
          height,
          id,
        } = data;

        var powers = [];
        for (i of types) {
          let type = i.type.name;
          powers.push(type);
        }
        weight = weight / 10;
        height = height / 10;
        const pokemonName = name;
        // Energy to catch the pokemon
        const energy = Math.floor(base_experience + weight / height);
        // console.log(energy);

        if (credits <= energy) {
          var energylvlmsg = `⚠️Low Energy Level: ${credits}.\nIt's a risk to catch the pokémon now!`;
        } else {
          energylvlmsg = `You're Energy Level: ${credits}.\nTry to catch this pokémon!`;
        }

        embed
          .setAuthor(
            '⚡Poké Ball Ready!⚡',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
          )
          .setImage(sprites.front_default)
          .setTitle('Found one pokémon near you!!!')
          .setDescription(
            `Name: **${name.toUpperCase()}**\nBase Experience: **${base_experience}**\nBest-Ability: **${abilities[0].ability.name.toUpperCase()}**\nWeight: **${weight} lbs**\nHeight: **${height} m**\nType: **${powers
              .toString()
              .toUpperCase()}**\nEnergy Needed to Catch: **${energy}**`
          )
          .setColor(
            `#${Math.floor((Math.random() * 0xffffff) << 0)
              .toString(16)
              .padStart(6, '0')}`
          )
          .setFooter(`${energylvlmsg}`, msg.author.avatarURL());

        let seed = await msg.channel.send(embed);
        await seed.react('<:PokeBall:829788143796224020>');
        await seed.react('❌');
        // console.log(seed);
        var channelid = seed.channel.id;
        var messageid = seed.id;
        // console.log(channelid);
        // console.log(messageid);

        // ************ MAGIC Reaction Code ********
        client.on('messageReactionAdd', async (reaction, user) => {
          if (reaction.message.partial) await reaction.message.fetch();
          if (reaction.partial) await reaction.fetch();
          if (user.bot) return;
          if (user.id === msg.author.id) {
            // console.log(msg.author.id);
            // console.log(user.id);
            if (reaction.message.channel.id === channelid) {
              if (reaction.message.id === messageid) {
                if (reaction.emoji.name === 'PokeBall') {
                  const energize = async (info) => {
                    let result = await fetch(`${backendIp}/pokemon/energize`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(info),
                    });
                    const energizeRes = await result.json();
                    if (energizeRes.captured === false) {
                      embed
                        .setAuthor(
                          `⚠️Low Energy Level!`,
                          ''
                          // https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png
                        )
                        .setImage(sprites.front_default)
                        .setTitle('Catch failed!')
                        .setDescription(
                          `**<@${
                            user.id
                          }> Couldn't capture ${pokemonName.toUpperCase()}, It Escaped!!!\n\n Hint: Use \`?poke energy\` To grab a snack!!**`
                        )
                        .setColor(
                          `#${Math.floor(Math.random() * 16777215).toString(
                            16
                          )}`
                        )
                        .setFooter(
                          `pokémon Bot`,
                          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                        );
                    } else {
                      if (energizeRes.captured === true) {
                        embed
                          .setAuthor(
                            `⚡Nice Work ${user.username}⚡`,
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                          )
                          .setImage(sprites.front_default)
                          .setTitle(`${pokemonName.toUpperCase()} Captured`)
                          .setDescription(
                            `**You have captured ${pokemonName.toUpperCase()} successfully.\nSpent Energy: ${energy}\nRemaining Energy: ${
                              energizeRes.info.credits
                            }**`
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
                    }
                    msg.channel.send(embed);
                    reaction.message.delete({ timeout: 750 });
                  };
                  energize({ id, energy, userid, pokemonName });
                }
                if (reaction.emoji.name === '❌') {
                  reaction.message.delete();
                }
              }
            }
          } else {
            if (reaction.message.channel.id === channelid) {
              if (reaction.message.id === messageid) {
                // console.log(user.id);
                embed
                  .setAuthor(
                    // ${pokemonName} Attacked you!
                    `${pokemonName.toUpperCase()} Attacked you!!`,
                    sprites.front_default
                  )
                  .setImage(
                    'https://media.tenor.com/images/e5595f246f5b032e1e7d71ce537d8568/tenor.gif'
                  )
                  .setTitle(`⚠️ Trespasser Warned!`)
                  .setDescription(
                    `**<@${user.id}> It's not you're pokémon to catch!!!\nAre you one of the Team Rocker Fans! XD**`
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
                let seed = await msg.channel.send(embed);
                seed.delete({ timeout: 6000 });
              }
            }
          }
        });
      });
  };

  // SIGN UP
  if (args[0] === 'signup') {
    // SIGNUP command
    embed
      .setTitle('Sign Up - Pokémon Hunt')
      .setAuthor(
        `Welcome ${msg.author.username}!`,
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
      )
      .setColor(
        `#${Math.floor((Math.random() * 0xffffff) << 0)
          .toString(16)
          .padStart(6, '0')}`
      )
      .setDescription('React to Enter the Pokémon World');
    let seed = await msg.channel.send(embed);
    await seed.react('✅');
    // console.log(seed);
    var channelid = seed.channel.id;
    var messageid = seed.id;
    // console.log(channelid);
    // console.log(messageid);

    // // On https://cdn.discordapp.com/avatars/"+message.author.id+"/"+message.author.avatar+".jpeg

    client.on('messageReactionAdd', async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (user.id === msg.author.id) {
        // console.log(msg.author.id);
        // console.log(user.id);
        if (reaction.message.channel.id === channelid) {
          if (reaction.message.id === messageid) {
            if (reaction.emoji.name === '✅') {
              let userid = msg.author.id;
              let signinRes = await checkSignIn({ userid });

              if (signinRes.exists === true) {
                embed
                  .setAuthor(
                    `Hey ${user.username}!`,
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                  )
                  .setTitle('')
                  .setDescription(
                    '**You are already a member of the Pokémon Universe!\n If lost type `?poke help`**'
                  );
                msg.channel.send(embed);
              } else {
                let result = await fetch(`${backendIp}/pokemon/signup`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ userid }),
                });
                const signupRes = await result.json();

                reaction.message.delete({ timeout: 750 });
                embed
                  .setDescription(
                    "**`?poke search` Search for Pokémon near you & try to capture by spending Energy Currency.\n\n`?poke energy` 🛠️Search for food in the wild, Energy Currency is very important in you're quest to capture pokémon's.\n\n`?poke inv` 🛠️Get Information of Inventory,\ni.e. Energy LVL, Pokémon Collections, Supplies, etc.**"
                  )
                  .setColor(
                    `#${Math.floor((Math.random() * 0xffffff) << 0)
                      .toString(16)
                      .padStart(6, '0')}`
                  )
                  .setTitle(`Sign Up Success!`)
                  .setAuthor(
                    `Welcome ${msg.author.username}!`,
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                  )
                  .setFooter(
                    `Powered by JavaScript, Express-RESTful-API, MongoDB Cloud Cluster,\nDiscord.Js, PokéAPI, Hosted on - Repl.it`,
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
                  );
                msg.channel.send(embed);
              }
            }
          }
        }
      }
    });
  } else if (args[0] === 'search') {
    // RANDOM POKEMON TO COLLECT

    // check if the user is a member
    let userid = msg.author.id;
    let signinRes = await checkSignIn({ userid });
    // console.log(signinRes);

    if (signinRes.exists === true) {
      let credits = signinRes.info[0].credits;
      // console.log(credits);
      let PokemonName = Math.floor(Math.random() * (898 - 1 + 1)) + 1;
      getPokemon(PokemonName, credits);
      // console.log(PokemonName);
    } else {
      embed
        .setDescription(
          "**It seems you are lost in the wild.\nLet's get you you're Trainer ID.\nThis ID helps universe to know you're collections and credit Information\n Let's start by Sending.**\n`?poke signup`"
        )
        .setAuthor(
          `Welcome ${msg.author.username}!`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
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
      msg.channel.send(embed);
    }
  } else if (args[0] === 'help') {
    // HELP command
    let userid = msg.author.id;
    // check if the user is a member

    let signinRes = await checkSignIn({ userid });
    // console.log(signinRes);
    if (signinRes.exists === true) {
      // let credits = signinRes.info[0].credits;
      // console.log(credits);
      embed
        .setDescription(
          "**`?poke signup` Quickly Join the Pokémon Journey.\n\n`?poke search` Search for Pokémon near you & try to capture by spending Energy Currency.\n\n`?poke energy` 🛠️Search for food in the wild, Energy Currency is very important in you're quest to capture pokémon's.\n\n`?poke inv` 🛠️Get Information of Inventory,\ni.e. Energy LVL, Pokémon Collections, Supplies, etc.**"
        )
        .setColor(
          `#${Math.floor((Math.random() * 0xffffff) << 0)
            .toString(16)
            .padStart(6, '0')}`
        )
        .setTitle(`ℹ️ Help Section`)
        .setAuthor(
          `Hey ${msg.author.username}!`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        )
        .setFooter(
          `Powered by JavaScript, Express-RESTful-API, MongoDB Cloud Cluster,\nDiscord.Js, PokéAPI, Hosted on - Repl.it`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        );
    } else {
      embed
        .setDescription(
          "**It seems you are lost in the wild.\nLet's get you you're Trainer ID.\nThis ID helps universe to know you're collections and credit Information\n Let's start by Sending.**\n`?poke signup`"
        )
        .setAuthor(
          'Welcome Trainer!',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
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
    msg.channel.send(embed);
  } else if (args[0] === 'energy') {
    // ENERGY command

    let userid = msg.author.id;
    // check if the user is a member
    let rechargeEmbed = new MessageEmbed();
    let signinRes = await checkSignIn({ userid });
    // console.log(signinRes);
    if (signinRes.exists === true) {
      rechargeEmbed
        .setDescription(
          '**Snacks are important to regain energy.\nRecharging...**'
        )
        .setColor(
          `#${Math.floor((Math.random() * 0xffffff) << 0)
            .toString(16)
            .padStart(6, '0')}`
        )
        .setImage('https://i.gifer.com/Lc8U.gif')
        .setAuthor(
          `Hey ${msg.author.username}!`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        )
        .setFooter(
          `pokémon Bot`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        );
      let seed = await msg.channel.send(rechargeEmbed);
      // Energy Requested.
      const getEnergy = async (info) => {
        let result = await fetch(`${backendIp}/pokemon/getEnergy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(info),
        });
        let getEnergyRes = await result.json();
        // check for some ackn
        // console.log(getEnergyRes);
        if (getEnergyRes.recharged === true) {
          embed
            .setDescription('**Energy Gained!**')
            .setColor(
              `#${Math.floor((Math.random() * 0xffffff) << 0)
                .toString(16)
                .padStart(6, '0')}`
            )
            .setImage('')
            .setTitle(`Current Energy Level: ${getEnergyRes.info.credits}`)
            .setFooter(
              `pokémon Bot`,
              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
            );
        } else {
          embed
            .setDescription('Recharging Failed!')
            .setColor(
              `#${Math.floor((Math.random() * 0xffffff) << 0)
                .toString(16)
                .padStart(6, '0')}`
            )
            .setTitle('Try Again...')
            .setAuthor(
              `Sorry ${msg.author.username}!`,
              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
            );
        }
        setTimeout(async () => {
          seed.delete();
          let seed1 = await msg.channel.send(embed);
          seed1.delete({ timeout: 8000 });
        }, 5000);
      };
      getEnergy({ userid });
    } else {
      embed
        .setDescription(
          "**It seems you are lost in the wild.\nLet's get you you're Trainer ID.\nThis ID helps universe to know you're collections and credit Information\n Let's start by Sending.**\n`?poke signup`"
        )
        .setAuthor(
          'Welcome Trainer!',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
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
      msg.channel.send(embed);
    }
  } else {
    console.log('else triggered');
  }
  //   let userid = msg.author.id;
  //   // check if the user is a member
  //   const signin = async (info) => {
  //     let result = await fetch(`${backendIp}/pokemon/signin`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(info),
  //     });
  //     let signinRes = await result.json();
  //     // console.log(signinRes);
  //     if (signinRes.exists === true) {
  //       let credits = signinRes.info[0].credits;
  //       console.log(credits);
  //       var PokemonName;
  //       // The API says 898 count
  //       PokemonName = args[0];
  //       getPokemon(PokemonName, credits);
  //     } else {
  //       embed
  //         .setDescription(
  //           "**It seems you are lost in the wild.\nLet's get you you're Trainer ID.\nThis ID helps universe to know you're collections and credit Information\n Let's start by Sending.**\n`?poke signup`"
  //         )
  //         .setAuthor(
  //           'Welcome Trainer!',
  //           'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
  //         )
  //         .setColor(
  //           `#${Math.floor((Math.random() * 0xffffff) << 0)
  //             .toString(16)
  //             .padStart(6, '0')}`
  //         );
  //       msg.channel.send(embed);
  //     }
  //   };
  //   signin({ userid });
  // }

  //
};
module.exports.help = {
  name: 'pokemon',
  desc: 'Pokemon Information',
  aliases: 'poke',
};
