// register_commands.js
export async function registerCommands(TOKEN, APPLICATION_ID, commandsToRegister) {
  if (!TOKEN || !APPLICATION_ID) {
    console.error("Discord token or application ID missing");
    return false;
  }

  const URL = `https://discord.com/api/v9/applications/${APPLICATION_ID}/commands`;

  // Wenn keine Befehle übergeben wurden, versuche sie zu importieren
  if (!commandsToRegister) {
    try {
      const { commands } = await import('./commands.js');
      commandsToRegister = commands;
    } catch (error) {
      console.error("Failed to import commands:", error);
      return false;
    }
  }

  const headers = {
    "Authorization": `Bot ${TOKEN}`,
    "Content-Type": "application/json"
  };

  // Jeden Befehl per POST-Request registrieren
  for (const command of commandsToRegister) {
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(command)
      });

      const commandName = command.name;

      if (response.ok) {
        console.log(`Command ${commandName} created: ${response.status}`);
      } else {
        const errorText = await response.text();
        console.error(`Failed to create command ${commandName}: ${response.status}, ${errorText}`);
      }
    } catch (error) {
      console.error(`Error registering command ${command.name}:`, error);
    }
  }

  return true;
}