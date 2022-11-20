const keep_alive = require("./keep_alive.js");
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.DirectMessages,
  ],
});
const dotenv = require("dotenv");
const { makeTeams, createMessage, getUserFromMention } = require("./utils.js");

dotenv.config();
const token = process.env.TOKEN;
const prefix = "!";

client.on("ready", () => {
  console.log(client.user.username, "is running");
});

client.on("messageCreate", (message) => {
  if (
    message.content.startsWith(prefix) &&
    /* message.author.id == client.user.id || */ !message.author.bot
  ) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "teams") {
      if (!args.length) {
        return message.channel.send(
          `You didn't provide any arguments, ${message.author}!`
        );
      } else if (!parseInt(args[0])) {
        return message.channel.send(
          `Please provide a number, ${message.author}!`
        );
      }
      // const channels = message.guild.channels.cache.filter(
      //   (c) => c.type === "voice"
      // );

      client.guilds.fetch(message.guildId).then((guild) => {
        guild.members.fetch({ withPresences: true }).then((fetchedMembers) => {
          console.log(fetchedMembers);

          const users = [];

          fetchedMembers.forEach((user) => users.push(user));

          console.log(users);

          const ids = [];
          ids.unshift(args[0]);
          var params = ids.join("-");

          let numTeams = parseInt(args[0]);
          let teamSize = Math.round(users.length / numTeams);
          if (teamSize <= 1)
            return message.channel.send(
              `Not enough people for this team size, ${message.author}!`
            );
          var teams = makeTeams(users, numTeams); // works

          const text = teams
            .map((team, index) => {
              const teamStr = team.map((user) => user.displayName).join(", ");

              return `Team ${index + 1}: ${teamStr}`;
            })
            .join("\n");

          // var msg = createMessage(teams, params);
          message.channel.send(text);
        });
      });

      // mentions has an array of arguments that correspond to the user id
      // !teams 2 @Enes
      // mentions will have the userId of @Enes in the above case
      // let mentions = args.slice(1);

      // if (mentions.length) {
      //   var exclude = [];
      //   mentions.forEach((ex) => {
      //     var id = getUserFromMention(ex);
      //     ids.push(id);
      //     var userObj = client.users.cache.get(id);
      //     if (userObj) exclude.push(userObj.username);
      //   });
      //   users = users.filter((i) => exclude.indexOf(i) === -1);
      // }

      // var ids = [];
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
    }
  }

  if (
    reaction.emoji.name === "🔄" &&
    reaction.message.author.id == client.user.id
  ) {
    var text = reaction.message.embeds[0].fields
      .pop()
      .value.match(/\`\`\`(.*?)\n/i)[1]
      .split("-");
    var numTeams = text[0];
    let mentions = text.slice(1);
    let command = ["!teams", numTeams];
    mentions = mentions.map((line) => `<@${line}>`);
    command.push(...mentions);

    reaction.message.channel.send(command.join(" "));
  }
  console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
});

client.login(token);
