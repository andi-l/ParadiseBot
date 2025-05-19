import { registerCommands } from '../commands/register_commands.js';
import { commands } from '../commands/discord_commands.js';

// Read environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

console.log('Registering Discord slash commands...');
registerCommands(TOKEN, APPLICATION_ID, commands)
  .then(success => {
    if (success) {
      console.log('Commands registered successfully!');
    } else {
      console.error('Failed to register commands.');
    }
  })
  .catch(error => {
    console.error('Error during command registration:', error);
  });