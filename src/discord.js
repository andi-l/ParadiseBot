import { verifyKey } from 'discord-interactions';
import { decodeLink, convertTaobaoLink, convertYupooLink } from './utils.js';
import { YUAN_TO_EURO_RATE } from './config.js';

/**
 * Process Discord interaction
 */
export async function handleDiscordInteraction(request, DISCORD_PUBLIC_KEY) {
  // Get the signature and timestamp from the headers
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');

  if (!signature || !timestamp) {
    return new Response('Missing signature or timestamp', { status: 401 });
  }

  // Get the request body as text
  const bodyText = await request.text();

  // Verify the signature
  const isValidRequest = verifyKey(
    bodyText,
    signature,
    timestamp,
    DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Parse the request body
  const rawRequest = JSON.parse(bodyText);

  // Handle the interaction
  let responseData;

  if (rawRequest.type === 1) {  // PING
    responseData = { type: 1 };  // PONG
  } else {
    const data = rawRequest.data;
    const commandName = data.name;
    let messageContent;
    let ephemeral = false;

    if (commandName === "info") {
      messageContent = "This bot was created by <@637803920340549633>";
      ephemeral = false;
    } else if (commandName === "spreadsheet") {
      messageContent = "<https://tinyurl.com/repparadise>";
      ephemeral = false;
    } else if (commandName === "register") {
      messageContent = "Register here <https://www.cssbuy.com/paradise>";
      ephemeral = false;
    } else if (commandName === "convert") {
      const taobaoLink = data.options[0].value;
      messageContent = convertTaobaoLink(taobaoLink);
      ephemeral = true;
    } else if (commandName === "decode") {
      const agentLink = data.options[0].value;
      messageContent = decodeLink(agentLink);
      ephemeral = true;
    } else if (commandName === "yuan") {
      const yuanAmount = parseFloat(data.options[0].value);
      const euroAmount = yuanAmount * YUAN_TO_EURO_RATE;
      messageContent = `¥${yuanAmount.toFixed(2)} = €${euroAmount.toFixed(2)}`;
      ephemeral = true;
    } else if (commandName === "yupoo") {
      const yupooLink = data.options[0].value;
      messageContent = convertYupooLink(yupooLink);
      ephemeral = true;
    } else {
      messageContent = "Command not recognized.";
      ephemeral = false;
    }

    responseData = {
      type: 4,
      data: {
        content: messageContent,
        flags: ephemeral ? 64 : 0  // Flag 64 means ephemeral
      }
    };
  }

  return new Response(JSON.stringify(responseData), {
    headers: { 'Content-Type': 'application/json' }
  });
}