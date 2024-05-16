const { SlashCommandBuilder } = require("@discordjs/builders");
const { Employee } = require('../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-position')
    .setDescription('See what position a user is!')
    .addUserOption(option => option.setName('user').setDescription('User to check positon of!').setRequired(true)),
    async execute(interaction) {

    //get user and variable to check database for user
    const user = interaction.options.getUser('user');
    const employee = await Employee.findOne({ where: { userID: user.id } });

    //check to see if employee dosnt exists
    if(!employee) return await interaction.reply({ content: `**${user.globalName}** is not apart of the employee list!`});

    try {
        
      //log the command and reply
      console.log(interaction.user.globalName + ' Used the CHECK POSITION command!');
      return interaction.reply(`**<@!${user.id}>'s position is ${employee.position}**`);

    } catch(err) {
      console.log('There was an error executing the CHECK POSITION command: ' + err);
      return interaction.reply({ content: 'There was an error processing this command, contact dev.', ephemeral: true });
    }
  }
}