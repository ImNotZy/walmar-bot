const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clock-in')
    .setDescription('Clock in to your job!'),
    async execute(interaction) {

    //get channel and variables to set up user
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
      let isColockedIn = false;
      for(const role of allRoles) {
        if(interaction.member.roles.cache.has(role.id)) {
          isColockedIn = true;
          break;
        }
      }

      //check if they are already clocked in 
      if(isColockedIn) return await interaction.reply({ content: '**You are already clocked in!**' });

      //find role to add and add it
      if(employee.position === "JANITOR") {
        await guildUser.roles.add(JAN);
      } else if(employee.position === "STOCKER") {
        await guildUser.roles.add(STOCK);
      } else if(employee.position === "BAGGER") {
        await guildUser.roles.add(BAG);
      } else if(employee.position === "DELI WORKER") {
        await guildUser.roles.add(DELI);
      } else if(employee.position === "FLOOR SUPERVISOR") {
        await guildUser.roles.add(SUP);
      } else if(employee.position === "FLOOR MANAGER") {
        await guildUser.roles.add(MAG);
      }

      //remove citizen role
      await guildUser.roles.remove(CIT);

      //log the command and reply
      console.log(interaction.user.globalName + ' Used the CLOCK IN command!');
      return interaction.reply('**You have clocked in!**');

    } catch(err) {
      console.log('There was an error executing the CLOCK IN command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}