const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('employ-all')
    .setDescription('Add all users not on the staff list.'),
    async execute(interaction) {
    
    //Check for enabled and required role
    if(!config.COMMAND_SETTINGS.ADD_STAFF.ENABLED) return await interaction.reply({ content: 'This command is disabled', ephemeral: true });
    if(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID)) return await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });

    try {

      //get members and update channel
      const members = await interaction.guild.members.fetch();
      const channel = interaction.guild.channels.cache.get(config.COMMAND_SETTINGS.UPDATE_CHANNEL_ID);
      
      //loop through all members
      members.forEach(async (member) => {
        //define a variable to check if they are in the database
        const employed = await Employee.findOne({ where: { userID: member.id } });

        //check if they are in the database, if not add them
        if(!employed) {
          await Employee.create({
            name: member.displayName,
            userID: member.id,
            position: "JANITOR",
            tasksCompleted: 0,
            tasksFailed: 0
          });
        }
      });

      //log use of command
      console.log(interaction.user.globalName + ' Used the EMPLOYALL command!');

      //send to updates channel and reply
      await channel.send('**Everyone has been employed to walmar!**');
      return await interaction.reply({content: 'Everyone has been employed', ephemeral: true });

    } catch(err) {
      console.log('There was an error processing the EMPLOYALL command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}