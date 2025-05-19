import { deleteCommand } from '../commands/delete_command.js';

// Read environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Get command ID from command line arguments
const commandId = process.argv[2];

if (!commandId) {
  console.error('Please provide a command ID to delete.');
  console.log('Usage: npm run delete-command <command_id>');
  console.log('You can get command IDs by running: npm run show-commands');
  process.exit(1);
}

console.log(`Attempting to delete command with ID: ${commandId}`);
deleteCommand(commandId, TOKEN, APPLICATION_ID)
  .then(success => {
    if (success) {
      console.log('Command deleted successfully!');
    } else {
      console.error('Failed to delete command.');
    }
  })
  .catch(error => {
    console.error('Error deleting command:', error);
  });