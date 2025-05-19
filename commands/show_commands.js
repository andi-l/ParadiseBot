// show_commands.js
export async function showCommands(TOKEN, APPLICATION_ID) {
  if (!TOKEN || !APPLICATION_ID) {
    console.error("Discord token or application ID missing");
    return null;
  }

  const URL = `https://discord.com/api/v9/applications/${APPLICATION_ID}/commands`;

  const headers = {
    "Authorization": `Bot ${TOKEN}`,
    "Content-Type": "application/json"
  };

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch commands: ${response.status}, ${errorText}`);
      return null;
    }

    const commands = await response.json();

    for (const command of commands) {
      console.log(`Command Name: ${command.name}, Command ID: ${command.id}`);
    }

    return commands;
  } catch (error) {
    console.error("Error fetching commands:", error);
    return null;
  }
}