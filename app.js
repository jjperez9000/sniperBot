/** @format */
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let john = 261236642680012802;

client.on("ready", async () => {
  console.log("I am ready!");
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  let channels = await guild.channels.fetch();
});

client.on("messageCreate", (message) => {
  console.log(message);
  if (
    message.channel.name === "sniper" &&
    message.content.startsWith("!snipe") &&
    message.mentions.users.size == 1
  ) {
    handle_snipe(message);
  }
});

function handle_snipe(message) {
  const scoreData = require("./scores.json");
  if (!scoreData[message.guildId]) {
    scoreData[message.guildId] = {};
  }
  scoreData[message.guildId][message.author.id] = {
    score: scoreData[message.guildId][message.author.id]?.score
      ? scoreData[message.guildId][message.author.id].score + 2
      : 2,
    snipes: scoreData[message.guildId][message.author.id]?.snipes
      ? parseInt(scoreData[message.guildId][message.author.id].snipes) + 1
      : 1,
    sniped: scoreData[message.guildId][message.author.id]?.sniped
      ? parseInt(scoreData[message.guildId][message.author.id].sniped)
      : 0,
  };
  message.mentions.users.forEach((snipee) => {
    if (!scoreData[message.guildId][snipee.id]?.sniped) {
      scoreData[message.guildId][snipee.id] = {
        score: scoreData[message.guildId][snipee.id]?.score
          ? scoreData[message.guildId][snipee.id].score
          : 0,
        snipes: scoreData[message.guildId][snipee.id]?.snipes
          ? parseInt(scoreData[message.guildId][snipee.id].snipes)
          : 0,
        sniped: scoreData[message.guildId][snipee.id]?.sniped
          ? parseInt(scoreData[message.guildId][snipee.id].sniped) + 1
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
  message.react("✅");
}

client.login(process.env.DISCORD_TOKEN);
