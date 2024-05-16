const discord = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const svgCaptcha = require('svg-captcha');
const { REST } = require('@discordjs/rest');
const { readdirSync } = require("fs");
const { Routes } = require('discord-api-types/v10');
const { Employee, Server } = require('../database/database');


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
        // respond to the button
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