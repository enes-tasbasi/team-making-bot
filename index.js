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

const handleTeamCommand = (message, args) => {
  // separate the multiline text to get the command
  const [, ...namesAndPreferences] = message.content.split("\n");

  if (!args.length) {
    return message.channel.send(
      `You didn't provide any arguments, ${message.author}!`
    );
  } else if (!parseInt(args[0])) {
    return message.channel.send(`Please provide a number, ${message.author}!`);
  }

  // parse names and preferences
  const userPreferences = namesAndPreferences.map((line) => {
    const [name, preferenceString] = line.split(":");
    const preferences = preferenceString.split(",");

    return {
      name,
      preferences,
    };
  });

  console.log(userPreferences);

  const numTeams = Number.parseInt(args[0]);
  const teamSize = Math.round(userPreferences.length / numTeams);
  if (teamSize <= 1)
    return message.channel.send(
      `Not enough people for this team size, ${message.author}!`
    );
  var teams = makeTeams(teamSize, userPreferences); // works

  // construct the return message
  const text = teams
    .map((team, index) => {
      const teamStr = team.map((user) => user).join(", ");

      return `Team ${index + 1}: ${teamStr}`;
    })
    .join("\n");

  message.channel.send(text);

  // client.guilds.fetch(message.guildId).then((guild) => {
  //   guild.members.fetch({ withPresences: true }).then((fetchedMembers) => {
  //     const users = [];

  //     fetchedMembers.forEach((user) => {
  //       // filter out the bot user
  //       if (user.user.id !== client.user.id) {
  //         users.push(user);
  //       }
  //     });

  //     const ids = [];
  //     ids.unshift(args[0]);
  //     // var params = ids.join("-");

  //     let numTeams = parseInt(args[0]);
  // let teamSize = Math.round(users.length / numTeams);
  // if (teamSize <= 1)
  //   return message.channel.send(
  //     `Not enough people for this team size, ${message.author}!`
  //   );
  // var teams = makeTeams(users, numTeams, teamSize); // works

  // // construct the return message
  // const text = teams
  //   .map((team, index) => {
  //     const teamStr = team.map((user) => user.displayName).join(", ");
  //     member.roles.add(teamStr);
  //     return `Team ${index + 1}: ${teamStr}`;
  //   })
  //   .join("\n");

  // message.channel.send(text);
  //   });
  // });
};

const handleHelpCommand = (message) => {
  const helpText =
    "To use: send a message in the following format:\n" +
    "!teams <number of teams>\n" +
    "<name of person>:<list of preferences>\n" +
    "list of preferences has to be separated by commas\n" +
    "Make sure there are no spaces after the name and between the preferences.\n";

  message.channel.send(helpText);
};

client.on("messageCreate", (message) => {
  const [firstLine] = message.content.split("\n");
  if (
    firstLine.startsWith(prefix) &&
    /* message.author.id == client.user.id || */ !message.author.bot
  ) {
    const args = firstLine.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "teams") {
      handleTeamCommand(message, args);
    }
    if (command === "help") {
      handleHelpCommand(message);
    }
  }
});

client.login(token);
