// delete_command.js
export async function deleteCommand(commandId, TOKEN, APPLICATION_ID) {
  if (!TOKEN || !APPLICATION_ID) {
    console.error("Discord token or application ID missing");
    return false;
  }

  // Wenn kein commandId angegeben wurde, den Standard aus dem ursprünglichen Skript verwenden
  if (!commandId) {
    commandId = "1353067795704840279";
  }

  // URL für den DELETE-Request erstellen
  const URL = `https://discord.com/api/v9/applications/${APPLICATION_ID}/commands/${commandId}`;

  // Header für den Request setzen
  const headers = {
    "Authorization": `Bot ${TOKEN}`,
    "Content-Type": "application/json"
  };

  try {
    // DELETE-Request senden
    const response = await fetch(URL, {
      method: 'DELETE',
      headers: headers
    });

    // Response-Status prüfen
    if (response.status === 204) {
      console.log("Command deleted successfully.");
      return true;
    } else {
      const text = await response.text();
      console.log(`Failed to delete command: ${response.status}, ${text}`);
      return false;
    }
  } catch (error) {
    console.error("Error deleting command:", error);
    return false;
  }
}