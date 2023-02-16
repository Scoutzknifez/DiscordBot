import { handler as infoHandler } from "./commands/info.js";

    /*console.log(message);
    const reply = await message.reply(message);
    reply.react("👍");
    reply.react("👎");*/

async function handleCommand(interaction) {
    if (interaction.commandName == "info") {
        await infoHandler(interaction);
    }
}

async function sendReply(message, response) {
    const reply = await message.reply(response);
    console.log("2");
}

export { handleCommand, sendReply };