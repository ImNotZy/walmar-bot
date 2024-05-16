const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clock-out')
    .setDescription('Clock out of your job!'),
    async execute(interaction) {

    //get variables
    const employee = await Employee.findOne({ where: { userID: interaction.user.id } });
    const guildUser = await interaction.guild.members.fetch(interaction.user.id);

    //check for employee not in list
    if(!employee) return await interaction.reply({ content: 'You are not apart of the employee list!' }); 

    try {

      //define roles
      const JAN = interaction.guild.roles.cache.get(config.ROLES.JANITOR_ROLE);
      const STOCK = interaction.guild.roles.cache.get(config.ROLES.STOCKER_ROLE);
      const BAG = interaction.guild.roles.cache.get(config.ROLES.BAGGER_ROLE);
      const DELI = interaction.guild.roles.cache.get(config.ROLES.DELI_WORKER);
      const SUP = interaction.guild.roles.cache.get(config.ROLES.FLOOR_SUPERVIOR_ROLE);
      const MAG = interaction.guild.roles.cache.get(config.ROLES.FLOOR_MANAGER_ROLE);
      const CIT = interaction.guild.roles.cache.get(config.AUTO_ROLES.ROLE_ID);
      const allRoles = [ JAN, STOCK, BAG, DELI, SUP, MAG ];
      
      //loop through roles
      let isColockedOut = true;
      for(const role of allRoles) {
        if(interaction.member.roles.cache.has(role.id)) {
          isColockedOut = false;
          break;
        }
      }

      //check if they are already clocked out
      if(isColockedOut) return await interaction.reply({ content: '**You are already clocked out!**' });

      //add citizen and remove all roles from user
      await guildUser.roles.add(CIT);
      await guildUser.roles.remove(allRoles);

      //log the command and reply
      console.log(interaction.user.globalName + ' Used the CLOCK OUT command!');
      return interaction.reply('**You have clocked out!**');

    } catch(err) {
      console.log('There was an error executing the CLOCK OUT command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}