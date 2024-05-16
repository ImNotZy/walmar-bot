const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hire')
    .setDescription('Add a user not on the staff list!')
    .addUserOption(option => option.setName('user').setDescription('User to employee').setRequired(true)),
    async execute(interaction) {
    
    //Check for enabled and required role
    if(!config.COMMAND_SETTINGS.ADD_STAFF.ENABLED) return await interaction.reply({ content: 'This command is disabled', ephemeral: true });
    if(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID)) return await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });

    try {

      //get variables
      const user = interaction.options.getUser('user');
      const channel = interaction.guild.channels.cache.get(config.COMMAND_SETTINGS.UPDATE_CHANNEL_ID);
      const employed = await Employee.findOne({ where: { userID: user.id } });
      
      if(employed) return await interaction.reply({ content: `**<@!${user.id}> is already employed!**`});

      await Employee.create({
        name: user.globalName,
        userID: user.id,
        position: "JANITOR",
        tasksCompleted: 0,
        tasksFailed: 0
      });

      //log use of command
      console.log(interaction.user.globalName + ' Used the HIRE command!');

      //send to updates channel and reply
      await channel.send(`**<@!${user.id}> has been employed to walmar!**`);
      return await interaction.reply({content:'`' + user.globalName + '`** has been employed!**' });

    } catch(err) {
      console.log('There was an error processing the HIRE command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}