const { FisherYates } = require("js-data-structs");

function numToAlpha(num) {
  var s = "",
    t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = ((num - t) / 26) | 0;
  }
  return s || undefined;
}

module.exports = {
  makeTeams(teamSize, userPreferences) {
    const preferences = {};

    userPreferences.forEach((user) => {
      user.preferences.forEach((pref) => {
        if (!preferences[pref]) {
          preferences[pref] = [];
        }
      });
    });

    for (const user of userPreferences) {
      for (const preference of user.preferences) {
        // if (preferences[preference].length < teamSize) {
        preferences[preference].push(user.name);
        // }
      }
    }

    Object.entries(preferences).forEach(([pref, teamMembers]) => {
      const extraTeamMembers = teamMembers.length - teamSize;

      if (extraTeamMembers > 0) {
        const extraRequiredTeams = Math.round(extraTeamMembers / teamSize);

        for (let i = 0; i < extraRequiredTeams; i++) {
          const start = teamSize + teamSize * i;
          let end = start + teamSize;
          if (end > teamMembers.length) {
            end = teamMembers.length;
          }

          preferences[`${pref}${i}`] = teamMembers.slice(start, end);

          // cleanup old array
          preferences[pref] = preferences[pref].slice(0, start);
        }
      }
    });

    return Object.values(preferences);

    // if() {

    // }
    // //If no prefences inputed or all prefences are taken
    // else {
    //   let random = FisherYates(users);
    //   let teams = [];
    //   for (let i = 0; i < numTeams; i++) {
    //     teams.push([]);
    //   }
    //   random.forEach((user, index) => {
    //     teams[index % numTeams].push(user);
    //   });
    // }
    // return teams;
  },
  createMessage(teams, params) {
    var fields = [];
    teams.forEach((team, index) => {
      fields.push({
        name: `__Team ${numToAlpha(index + 1)}__`,
        value: `**${team.join("\n")}**`,
      });
    });
    var hidden = {
      name: "React: 🔄",
      value: "```" + params + "\n Remake teams```",
    };
    fields.push(hidden);
    const exampleEmbed = {
      color: 0x0099ff,
      title: "Teams Generated",
      fields: fields,
    };

    return exampleEmbed;
  },
  getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);

      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }

      return mention;
    }
  },
};
