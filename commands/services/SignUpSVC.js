const SignUpSVC = async (client, msg, args, messageArray, payload) => {
  const { MessageEmbed } = require('discord.js');
  const fetch = require('node-fetch');
  const embed = new MessageEmbed();
  const backendIp = process.env.backendIp;

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

  // Reaction Check
  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (user.id === msg.author.id) {
      if (reaction.message.channel.id === channelid) {
        if (reaction.message.id === messageid) {
          if (reaction.emoji.name === '✅') {
            let userid = payload.userid;
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
                "**`?poke signup` Quickly Join the Pokémon Journey.\n\n`?poke search` Search for Pokémon near you & try to capture by using PokéBall.\n\n`?poke item` Search for pokéball & berries in the wild, PokéBall is very important in you're quest to capture pokémon's.\n\n`?poke inv` Get Information of Inventory,\ni.e. Pokéball count, Pokémon Collections, Supplies, etc.**"
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
  });
};

module.exports = SignUpSVC;
