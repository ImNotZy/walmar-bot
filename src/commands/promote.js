const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promotes a user!')
    .addUserOption(option => option.setName('user').setDescription('User to promote!').setRequired(true)),
    async execute(interaction) {
    
    //Check for enabled and required role
    if(!config.COMMAND_SETTINGS.PROMOTE.ENABLED) return await interaction.reply({ content: 'This command is disabled', ephemeral: true });
    if(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID)) return await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });

    //get user, guild user, update channel, and variable to check if user is in database
    const userToPromote = interaction.options.getUser('user');
    const guildUser = await interaction.guild.members.fetch(userToPromote.id);
    const channel = interaction.guild.channels.cache.get(config.COMMAND_SETTINGS.UPDATE_CHANNEL_ID);
    const employed = await Employee.findOne({ where: { userID: userToPromote.id } });

    //check if not in database
    if(!employed) return await interaction.reply({ content: userToPromote.globalName + ' is not apart of the employee list!' });

    try {

      //get all role ID's
      const JAN = interaction.guild.roles.cache.get(config.ROLES.JANITOR_ROLE);
      const STOCK = interaction.guild.roles.cache.get(config.ROLES.STOCKER_ROLE);
      const BAG = interaction.guild.roles.cache.get(config.ROLES.BAGGER_ROLE);
      const DELI = interaction.guild.roles.cache.get(config.ROLES.DELI_WORKER);
      const SUP = interaction.guild.roles.cache.get(config.ROLES.FLOOR_SUPERVIOR_ROLE);
      const MAG = interaction.guild.roles.cache.get(config.ROLES.FLOOR_MANAGER_ROLE);
      const CIT = interaction.guild.roles.cache.get(config.AUTO_ROLES.ROLE_ID);
      let roleToAdd;
      let roleToRemove;

      //identify what rank they deserve
      if(employed.position === "JANITOR") {
        roleToAdd = STOCK;
        roleToRemove = JAN;
      } else if(employed.position === "STOCKER") {
        roleToAdd = BAG;
        roleToRemove = STOCK;
      } else if(employed.position === "BAGGER") {
        roleToAdd = DELI;
        roleToRemove = BAG;
      } else if(employed.position === "DELI WORKER") {
        roleToAdd = SUP;
        roleToRemove = DELI;
      } else if(employed.position === "FLOOR SUPERVISOR") {
        roleToAdd = MAG;
        roleToRemove = SUP;
      } else if(employed.position === "FLOOR MANAGER") {
        return await interaction.reply({ content: '**' + userToPromote.globalName + '** is already at the highest position!' });
      }

      //check to see if they have citizen role
      if(guildUser.roles.cache.has(CIT.id)) {
        //update database
        employed.update({
          position: roleToAdd.name
        });

        //send update
        await channel.send(`**<@!${userToPromote.id}> has been promoted to** ` + '`' + roleToAdd.name + '`' + "**!**");

        //log the command and reply
        console.log(interaction.user.globalName + ' Used the PROMOTE command!');
        return interaction.reply({ content: `**${userToPromote.globalName}** has been promoted to ` + '`' + roleToAdd.name + '`' + '!' });
      }

      //update the user in the database
      employed.update({
        position: roleToAdd.name
      });

      //add and remove roles
      guildUser.roles.add(roleToAdd);
      guildUser.roles.remove(roleToRemove);

      //send update
      await channel.send(`**<@!${userToPromote.id}> has been promoted to** ` + '`' + roleToAdd.name + '`' + "**!**");

      //log the command and reply
      console.log(interaction.user.globalName + ' Used the PROMOTE command!');
      return interaction.reply({ content: `**${userToPromote.globalName}** has been promoted to ` + '`' + roleToAdd.name + '`' + '!' });

    } catch(err) {
      console.log('There was an error executing the PROMOTE command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}