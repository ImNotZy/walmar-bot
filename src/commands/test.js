const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const config = require('../../config.json');
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('CHANGE ME'),
    async execute(interaction) {
    
    //Check for enabled and required role
    if(!config.COMMAND_SETTINGS.ADD_STAFF.ENABLED) return await interaction.reply({ content: 'This command is disabled', ephemeral: true });
    if(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(config.COMMAND_SETTINGS.REQUIRED_ROLE_ID)) return await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });

    try {

			const text = "#eb4034"
			
			const embed = new EmbedBuilder()
			.setTitle('test')
			.setDescription('test')
			.setColor(parseInt(text.startsWith('#') ? text.slice(1) : text, 16));
        
      //log the command and reply
      console.log(interaction.user.globalName + ' Used the CHANGE ME command!');
      return interaction.reply({ embeds: [embed] });

    } catch(err) {
      console.log('There was an error executing the CHANGE ME command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}