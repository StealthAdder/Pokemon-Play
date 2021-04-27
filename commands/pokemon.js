module.exports.run = async (client, message, args, messageArray) => {
  const prefix = require('../prefix.json');
  const { MessageEmbed } = require('discord.js');
  const fetch = require('node-fetch');
  const embed = new MessageEmbed();

  // Import Services
  const SearchBerrySVC = require('./services/SearchBerrySVC');
  const SearchPokeBallSVC = require('./services/SearchPokeBallSVC');
  const GetPokemonSVC = require('./services/GetPokemonSVC');
  const SSOCheck = require('./services/SSOCheck');
  const SignUpSVC = require('./services/SignUpSVC');
  // console.log(args);
  // console.log(messageArray);
  const msg = message;
  const backendIp = process.env.backendIp;
  // setTimeout(() => message.delete(), 5000);

  if (args[0] === 'search') {
    if (args[1] === 'item') {
      // console.log(`Pinged`);
      SearchPokeBallSVC(client, msg, args, messageArray);
    }
    if (args[1] === 'berry') {
      SearchBerrySVC(client, msg, args, messageArray);
    }
    if (args[1] === 'pokemon') {
      // Check if user exists.
      let userid = msg.author.id;
      let signinRes = await SSOCheck({ userid });

      if (signinRes.exists === false) {
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
      } else {
        if (signinRes.exists === true) {
          let _id = signinRes.info[0]._id;
          let userid = signinRes.info[0].userid;

          let payload = {
            _id: _id,
            userid: userid,
          };
          GetPokemonSVC(client, msg, args, messageArray, payload);
        }
      }
    }
  }

  // SIGN UP
  if (args[0] === 'signup') {
    // check if signed up.
    // Check if user exists.
    let userid = msg.author.id;
    let signinRes = await SSOCheck({ userid });

    if (signinRes.exists === true) {
      embed
        .setAuthor(
          `Hey ${msg.author.username}!`,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1026px-Pok%C3%A9_Ball_icon.svg.png'
        )
        .setDescription(
          '**You are already a member of the Pokémon Universe!\n If lost type `?poke help`**'
        );
      msg.channel.send(embed);
    }

    if (signinRes.exists === false) {
      let userid = msg.author.id;
      let payload = {
        userid: userid,
      };
      SignUpSVC(client, msg, args, messageArray, payload);
    }
  }

  if (args[0] === 'help') {
    // HELP command
    let userid = msg.author.id;
    // check if the user is a member

    let signinRes = await SSOCheck({ userid });
    // console.log(signinRes);
    if (signinRes.exists === true) {
      // let credits = signinRes.info[0].credits;
      // console.log(credits);
      embed
        .setDescription(
          "**`?poke signup` Quickly Join the Pokémon Journey.\n\n`?poke search pokemon` Search for Pokémon near you & try to capture by using PokéBall.\n\n`?poke search item` 🛠️Search for pokéball in the wild, PokéBall is very important in you're quest to capture pokémon's.\n\n`?poke inv` 🛠️Get Information of Inventory,\ni.e. Pokéball count, Pokémon Collections, Supplies, etc.**"
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
  }
};
module.exports.help = {
  name: 'pokemon',
  desc: 'Pokemon Information',
  aliases: 'poke',
};
