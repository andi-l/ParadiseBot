// index.js - Main entry point for the Discord bot
import 'dotenv/config';
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
    // Create a mock request object
    const mockRequest = {
      headers: new Map([
        ['x-signature-ed25519', interaction.signature],
        ['x-signature-timestamp', interaction.timestamp]
      ]),
      text: async () => JSON.stringify(interaction)
    };

    // Process the interaction
    const response = await handleDiscordInteraction(mockRequest, DISCORD_PUBLIC_KEY);

    // Parse the response
    const responseData = await response.json();

    // Reply to the interaction
    if (responseData.type === 4) { // Channel message
      await interaction.reply({
        content: responseData.data.content,
        ephemeral: responseData.data.flags === 64
      });
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