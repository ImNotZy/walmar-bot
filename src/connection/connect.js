const discord = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const svgCaptcha = require('svg-captcha');
const { REST } = require('@discordjs/rest');
const { readdirSync } = require("fs");
const { Routes } = require('discord-api-types/v10');
const { Employee, Server } = require('../database/database');
const { startGame } = require('../utility/aisleGame');


//#region Initialize Bot
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMembers, discord.GatewayIntentBits.GuildMessages ] });
client.commands = new discord.Collection();

const rest = new REST({ version: '10' }).setToken(config.BOT_SETTINGS.BOT_TOKEN);

const commands = [];
readdirSync('./src/commands').forEach(async file => {const command = require(`../commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
});

client.on('ready', async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.BOT_SETTINGS.GUILD_ID),
      { body: commands },
    );
  } catch (error) {
    console.error(error);
  }

  Employee.sync();
  Server.sync();

  console.log(`[ ${chalk.red(client.user.tag)} ] has successfully gone online!`);
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  } else if (interaction.isButton()) {     
      if(interaction.customId === 'clean-up') {
        const validTaskUser = await Server.findOne({ where: { userID: interaction.user.id } });
        const user = await Employee.findOne({ where: { userID: interaction.user.id } });

        if(!validTaskUser) return interaction.reply({ content: `**You currently have no tasks!**`, ephemeral: true });
        
        if(validTaskUser.isTimeUp === true) {
          validTaskUser.destroy();
          await user.update({ tasksFailed: user.tasksFailed + 1 });
          return interaction.reply({ content: `**Your to late! You have failed** ` + '`' + user.tasksFailed + '`** tasks!**', ephemeral: true }); 
        }

        validTaskUser.destroy();
        await user.update({ tasksCompleted: user.tasksCompleted + 1 });
        return interaction.reply({ content: `**Congrats on completing this task! You have now completed** ` + '`' + user.tasksCompleted + '`** tasks!**', ephemeral: true });
      }
  } else if (interaction.isStringSelectMenu()) {
    // respond to the select menu
  }
});

client.login(config.BOT_SETTINGS.BOT_TOKEN);
//#endregion

//#region Auto Role
client.on('guildMemberAdd', async(member) => {
  if(config.AUTO_ROLES.ENABLED) {
    const role = member.guild.roles.cache.get(config.AUTO_ROLES.ROLE_ID);
    try {
      member.roles.add(role);
    } catch(err) {
      console.log(err);
    }
  }
});
//#endregion

//#region aisle game
client.on('ready', async (client) => {
  if(config.AISLE_GAME.ENABLED) {

    setInterval(setupGame, 1000 * 60 * 30);
    
    async function setupGame() {
      try {
        // Get guild
        const guild = await client.guilds.fetch(config.BOT_SETTINGS.GUILD_ID);
    
        // Get members
        const membersCollection = await guild.members.fetch();
    
        // Convert collection to array
        const members = Array.from(membersCollection.values());
    
        // Create array to store members
        let candidates = [];
    
        // Define roles
        const JAN = guild.roles.cache.get(config.ROLES.JANITOR_ROLE);
        const STOCK = guild.roles.cache.get(config.ROLES.STOCKER_ROLE);
        const BAG = guild.roles.cache.get(config.ROLES.BAGGER_ROLE);
        const DELI = guild.roles.cache.get(config.ROLES.DELI_WORKER);
        const SUP = guild.roles.cache.get(config.ROLES.FLOOR_SUPERVIOR_ROLE);
        const MAG = guild.roles.cache.get(config.ROLES.FLOOR_MANAGER_ROLE);
    
        //check to make sure roles are valid
        if (!JAN || !STOCK || !BAG || !DELI || !SUP || !MAG) {
          console.error("One or more roles are undefined");
          return;
        }
    
        //add all roles to single variable
        const allRoles = [JAN.id, STOCK.id, BAG.id, DELI.id, SUP.id, MAG.id];
    
        // Loop through members
        for (const member of members) {
          // Ensure member is a valid GuildMember object
          if (!member || !member.roles || !member.roles.cache) {
            console.error("Invalid member or roles cache", member);
            continue;
          }
    
          // If janitor only, check for janitor role
          if (config.AISLE_GAME.JANITOR_ONLY) {
            if (member.roles.cache.has(JAN.id)) {
              candidates.push(member);
            }
          } else {
            // Check if member has any of the roles in allRoles
            if (allRoles.some(roleId => member.roles.cache.has(roleId))) {
              candidates.push(member);
            }
          }
        }

        //check to make sure at least one is clocked in
        if(Object.keys(candidates).length === 0) return console.log(chalk.red('ATTEMPTED TO START AISLE GAME, BUT NO ONE IS CLOCKED IN...'));
    
        //if there are candidaets, start game
        startGame(candidates, guild, client);
      } catch (error) {
        console.error("Error setting up aisle game:", error);
      }
    }    
  }
});
//#endregion