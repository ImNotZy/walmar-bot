const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fire')
    .setDescription('removes an employee from the list.')
    .addUserOption(option => option.setName('user').setDescription('User to fire').setRequired(true)),
    async execute(interaction) {
    
    //Check for enabled and required role
    if(!config.COMMAND_SETTINGS.FIRE.ENABLED) return await interaction.reply({ content: 'This command is disabled', ephemeral: true });
    if(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID)) return await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });

    //get user, channel, and create variable to check for employee
    const userToFire = interaction.options.getUser('user');
    const guildUser = await interaction.guild.members.fetch(userToFire.id);
    const channel = interaction.guild.channels.cache.get(config.COMMAND_SETTINGS.UPDATE_CHANNEL_ID);
    const employee = await Employee.findOne({ where: { userID: userToFire.id } });

    //check if already fired
    if(!employee) return interaction.reply({ content: userToFire.globalName + " was not on this list!", ephemeral: true });

    try {
    
      //destroy employee object
      await employee.destroy();

      //define roles
      const JAN = interaction.guild.roles.cache.get(config.ROLES.JANITOR_ROLE);
      const STOCK = interaction.guild.roles.cache.get(config.ROLES.STOCKER_ROLE);
      const BAG = interaction.guild.roles.cache.get(config.ROLES.BAGGER_ROLE);
      const DELI = interaction.guild.roles.cache.get(config.ROLES.DELI_WORKER);
      const SUP = interaction.guild.roles.cache.get(config.ROLES.FLOOR_SUPERVIOR_ROLE);
      const MAG = interaction.guild.roles.cache.get(config.ROLES.FLOOR_MANAGER_ROLE);
      const CIT = interaction.guild.roles.cache.get(config.AUTO_ROLES.ROLE_ID);
      const allRoles = [ JAN, STOCK, BAG, DELI, SUP, MAG ];
      
      //remove roles
      await guildUser.roles.remove(allRoles);

      //add citizen role
      await guildUser.roles.add(CIT);

      //log command usage
      console.log(interaction.user.globalName + ' Used the FIRE command!');

      //send to update channel and reply
      await channel.send( `**<@!${userToFire.id}> has been fired from walmar!**`);
      return await interaction.reply({ content: '`' + userToFire.globalName + '`' + ` **has been fired!**` });

    } catch(err) {
      console.log('There was an error executing the FIRE command:' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}