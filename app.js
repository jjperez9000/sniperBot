/** @format */

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { platform } = require("os");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let john = "261236642680012802";

client.once("ready", async () => {
  console.log("ready");
});
const adminData = require("./admins.json");
client.on("messageCreate", (message) => {
  // console.log(message);
  if (
    message.channel.name === "sniper" &&
    message.content.startsWith("!snipe") &&
    message.mentions.users.size == 1
  ) {
    handle_snipe(message);
  } else if (
    message.channel.name === "sniper" &&
    (message.content.startsWith("!leaderboard") ||
      message.content.startsWith("!l"))
  ) {
    let text = message.content.split(" ");
    handle_leaderboard(message, text[1] === "weekly");
  } else if (
    message.channel.name === "sniper" &&
    message.content.startsWith("!admin") &&
    (message.author.id === john ||
      (adminData[message.guildId] !== undefined &&
        adminData[message.guildId][message.author.id] === 1))
  ) {
    let text = message.content.split(" ");
    handle_admin(message, text[1] === "add");
  } else if (
    message.channel.name === "sniper" &&
    message.content.startsWith("!admin") &&
    message.author.id !== john &&
    (adminData[message.guildId] === undefined ||
      adminData[message.guildId][message.author.id] !== 1)
  ) {
    message.channel.send("nice try");
  } else if (
    message.channel.name === "sniper" &&
    message.content.startsWith("!reset") &&
    (message.author.id === john ||
      (adminData[message.guildId] !== undefined &&
        adminData[message.guildId][message.author.id] === 1))
  ) {
  }
});

async function handle_admin(message, add) {
  const adminData = require("./admins.json");
  message.mentions.users.forEach((person) => {
    if (!adminData[message.guildId]) {
      adminData[message.guildId] = {};
    }
    adminData[message.guildId][person.id] = add ? 1 : 0;
  });
  const channel = message.channel;
  channel.send(add ? "admin added" : "admin removed");
  var fs = require("fs");
  fs.writeFile("admin.json", JSON.stringify(adminData), function (err) {
    if (err) throw err;
    console.log("complete");
  });
}

async function handle_snipe(message) {
  const scoreData = require("./scores.json");
  if (!scoreData[message.guildId]) {
    scoreData[message.guildId] = {};
  }
  scoreData[message.guildId][message.author.id] = {
    score: scoreData[message.guildId][message.author.id]?.score
      ? scoreData[message.guildId][message.author.id].score + 2
      : 2,
    weeklyScore: scoreData[message.guildId][message.author.id]?.weeklyScore
      ? scoreData[message.guildId][message.author.id].weeklyScore + 2
      : 2,
    snipes: scoreData[message.guildId][message.author.id]?.snipes
      ? parseInt(scoreData[message.guildId][message.author.id].snipes) + 1
      : 1,
    weeklySnipes: scoreData[message.guildId][message.author.id]?.weeklySnipes
      ? parseInt(scoreData[message.guildId][message.author.id].weeklySnipes) + 1
      : 1,
    sniped: scoreData[message.guildId][message.author.id]?.sniped
      ? parseInt(scoreData[message.guildId][message.author.id].sniped)
      : 0,
    weeklySniped: scoreData[message.guildId][message.author.id]?.weeklySniped
      ? parseInt(scoreData[message.guildId][message.author.id].weeklySniped)
      : 0,
  };
  message.mentions.users.forEach((snipee) => {
    if (!scoreData[message.guildId][snipee.id]?.sniped) {
      scoreData[message.guildId][snipee.id] = {
        score: scoreData[message.guildId][snipee.id]?.score
          ? scoreData[message.guildId][snipee.id].score
          : 0,
        weeklyScore: scoreData[message.guildId][snipee.id]?.weeklyScore
          ? scoreData[message.guildId][snipee.id].weeklyScore
          : 0,
        snipes: scoreData[message.guildId][snipee.id]?.snipes
          ? parseInt(scoreData[message.guildId][snipee.id].snipes)
          : 0,
        weeklySnipes: scoreData[message.guildId][snipee.id]?.weeklySnipes
          ? parseInt(scoreData[message.guildId][snipee.id].weeklySnipes)
          : 0,
        sniped: scoreData[message.guildId][snipee.id]?.sniped
          ? parseInt(scoreData[message.guildId][snipee.id].sniped) + 1
          : 1,
        weeklySniped: scoreData[message.guildId][snipee.id]?.weeklySniped
          ? parseInt(scoreData[message.guildId][snipee.id].weeklySniped) + 1
          : 1,
      };
    } else {
      scoreData[message.guildId][snipee.id].sniped =
        parseInt(scoreData[message.guildId][snipee.id].sniped) + 1;
    }
  });

  var fs = require("fs");
  fs.writeFile("scores.json", JSON.stringify(scoreData), function (err) {
    if (err) throw err;
    console.log("complete");
  });

  let topId = undefined;
  let topScore = 0;

  for (p in scoreData[message.guildId]) {
    console.log(p);
    if (scoreData[message.guildId][p].score > topScore) {
      topScore = scoreData[message.guildId][p].score;
      topId = p;
    }
  }
  console.log(topScore);
  console.log(topId);

  let role = await message.guild.roles.cache.find(
    (role) => role.name === "sniper master"
  );
  console.log(role);

  if (message.author.id === topId) {
    await message.guild.members.fetch();
    const users = await message.guild.roles.cache
      .get(role.id)
      .members.map((m) => m.user.id);

    for (userId in users) {
      member = await message.guild.members.fetch(users[userId]);
      member.roles.remove(role);
    }
    await message.member.roles.add(role);
  }
  message.react("✅");
}

async function handle_leaderboard(message, isWeekly = false) {
  const scoreData = require("./scores.json");

  if (!scoreData[message.guildId]) {
    const channel = message.channel;
    channel.send("no scores yet");
  } else {
    const serverScores = scoreData[message.guildId];
    let scoreTable = [];
    Object.entries(serverScores).forEach((entry) => {
      const [id, score, snipes, sniped] = entry;
      !isWeekly
        ? scoreTable.push([id, score.score, score.snipes, score.sniped])
        : scoreTable.push([
            id,
            score.weeklyScore,
            score.weeklySnipes,
            score.weeklySniped,
          ]);
    });

    scoreTable.sort(function (a, b) {
      return b[1] - a[1];
    });

    const maxName = 12;
    let leaderboard = "```\n";
    leaderboard += " ".repeat(maxName) + "| score | snipes | sniped |\n";
    for (let i = 0; i < 10 && i < Object.keys(scoreTable).length; i++) {
      let member = await getGuildMember(message.guildId, scoreTable[i][0]);

      leaderboard +=
        standardize(member.nickname ?? member.user.username, maxName, false) +
        "|";
      leaderboard += standardize(scoreTable[i][1].toString(), 6, true) + " |";
      leaderboard += standardize(scoreTable[i][2].toString(), 7, true) + " |";
      leaderboard += standardize(scoreTable[i][3].toString(), 7, true) + " |";
      leaderboard += "\n";
    }
    leaderboard += "```";
    const channel = message.channel;
    channel.send(leaderboard);
  }
}

function standardize(myString, myLength, front) {
  if (myString.length < myLength && !front) {
    return myString + " ".repeat(myLength - myString.length);
  } else if (myString.length > myLength) {
    return myString.substring(0, myLength);
  } else if (myString.length < myLength && front) {
    return " ".repeat(myLength - myString.length) + myString;
  }
}

async function getGuildMember(guildid, userid) {
  var guild = client.guilds.cache.get(guildid);
  if (!guild) {
    try {
      guild = await client.guilds.fetch(guildid);
    } catch (error) {
      return console.log(`Error while fetching the guild: `, error);
    }
  }
  var member = guild.members.cache.get(userid);
  if (!member) {
    try {
      member = await guild.members.fetch(userid);
    } catch (error) {
      return console.log(`Error while fetching the member: `, error);
    }
  }

  return member;
}

client.login(process.env.DISCORD_TOKEN);
