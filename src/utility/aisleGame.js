const { ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { Server } = require('../database/database');

//define variables
let allAisles = [];
let randomChannel;
let randomUser;

async function startGame(candidates, guild, client) {
  
  //get all aisle channel IDs from the config
  const aisleChannelIDs = Object.values(config.AISLE_GAME.AISLES);
  
  //fetch each channel object and add it to the allAisles array
  for (const channelId of aisleChannelIDs) {
    
    try {
      
      //get channel object
      const channel = await client.channels.fetch(channelId);
      
      //check to see if channel exists
      if (!channel) return console.log(chalk.red('CHANNEL ID IS INVALID! CHECK CONFIG!'));

      //push channel to array
      allAisles.push(channel);
        
    } catch (err) {
      console.error(`Error fetching channel with ID ${channelId}: ${err.message}`);
    }
  }

  //select random channel
  try { 

    //find random index
    let index = getRandomIndex(Object.keys(allAisles).length);
    
    //set random channel
    randomChannel = allAisles[index];

  } catch (err) {
    console.error(`Error selecting random channel`)
  }

  //select random user
  try {

    //find random index
    let index = getRandomIndex(Object.keys(candidates).length);

    //set random channel
    randomUser = candidates[index];

  } catch (err) {
    console.log(`Error selecting random user`);
  }

  //build embed
  const embed = new EmbedBuilder()
  .setTitle(`Clean up!`)
  .setDescription(`Click the button below to clean up the aisle!\n**You have 5 minutes!**`)
  .setFooter({ text: 'Walmar | Clean Up'})
  .setColor(parseInt('0071ce', 16));

  //build button
  const button = new ButtonBuilder()
  .setCustomId('clean-up')
  .setLabel('CLEAN UP')
  .setStyle(ButtonStyle.Primary);

  //build row
  const row = new ActionRowBuilder()
  .addComponents(button);

  //add user to database
  await Server.create({
    userID: randomUser.id,
    isTimeUp: false
  });

  //send messsage
  await randomChannel.send({ content: `<@!${randomUser.id}>`, embeds: [embed], components: [row] });

  //delete database after timeout
  setTimeout(timeoutDelete, 1000 * 60 * 5);

}

async function timeoutDelete() {

  //get user
  const dataUser = await Server.findOne({ where: { userID: randomUser.id } });

  //update time up
  dataUser.update({ isTimeUp: true });

}

function getRandomIndex(max) {
  return Math.floor(Math.random() * max); 
}

module.exports = {
  startGame
}
