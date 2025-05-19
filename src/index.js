import { Client, GatewayIntentBits } from 'discord.js';
import { commands } from './commands/discord_commands.js';
import { handleDiscordInteraction } from './src/discord.js';

// Read environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// Check if required environment variables are set
if (!TOKEN || !APPLICATION_ID || !DISCORD_PUBLIC_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// When the client is ready, run this code
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is ready and serving ${client.guilds.cache.size} servers`);
});

// Handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  try {
    const commandName = interaction.commandName;

    // Handle commands directly here instead of using the mock request approach
    switch(commandName) {
      case "info":
        await interaction.reply("This bot was created by <@637803920340549633>");
        break;
      case "spreadsheet":
        await interaction.reply("<https://tinyurl.com/repparadise>");
        break;
      case "register":
        await interaction.reply("Register here <https://www.cssbuy.com/paradise>");
        break;
      case "convert":
        const taobaoLink = interaction.options.getString('link');
        const convertedTaobaoLink = convertTaobaoLink(taobaoLink);
        await interaction.reply({ content: convertedTaobaoLink, ephemeral: true });
        break;
      case "decode":
        const agentLink = interaction.options.getString('link');
        const decodedLink = decodeLink(agentLink);
        await interaction.reply({ content: decodedLink, ephemeral: true });
        break;
      case "yuan":
        const yuanAmount = interaction.options.getNumber('amount');
        const euroAmount = yuanAmount * YUAN_TO_EURO_RATE;
        await interaction.reply({
          content: `¥${yuanAmount.toFixed(2)} = €${euroAmount.toFixed(2)}`,
          ephemeral: true
        });
        break;
      case "yupoo":
        const yupooLink = interaction.options.getString('link');
        const convertedYupooLink = convertYupooLink(yupooLink);
        await interaction.reply({ content: convertedYupooLink, ephemeral: true });
        break;
      default:
        await interaction.reply("Command not recognized.");
    }
  } catch (error) {
    console.error('Error handling interaction:', error);

    // Reply with an error message if interaction hasn't been replied to
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error processing your command.',
        ephemeral: true
      });
    }
  }
});

// Import utility functions
import { decodeLink, convertTaobaoLink, convertYupooLink } from './src/utils.js';
import { YUAN_TO_EURO_RATE } from './src/config.js';

// Login to Discord with the bot token
client.login(TOKEN);

// Handle exit signals
process.on('SIGINT', () => {
  console.log('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});