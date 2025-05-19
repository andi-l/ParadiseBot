import { showCommands } from '../commands/show_commands.js';

// Read environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

console.log('Fetching registered Discord slash commands...');
showCommands(TOKEN, APPLICATION_ID)
  .then(commands => {
    if (commands) {
      console.log(`Retrieved ${commands.length} commands.`);
      console.log('Command details:');
      commands.forEach(cmd => {
        console.log(`- ${cmd.name} (ID: ${cmd.id})`);
      });
    } else {
      console.error('Failed to fetch commands.');
    }
  })
  .catch(error => {
    console.error('Error fetching commands:', error);
  });