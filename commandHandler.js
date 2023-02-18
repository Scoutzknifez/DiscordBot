import { handler as infoHandler } from "./commands/info.js";
import { handler as remindHandler } from "./commands/remind.js";

    /*console.log(message);
    const reply = await message.reply(message);
    reply.react("👍");
    reply.react("👎");*/

async function handleCommand(interaction) {
    if (interaction.commandName == "info") {
        await infoHandler(interaction);
    }
    else if (interaction.commandName == "remind") {
        await remindHandler(interaction);
    }
}

async function sendReply(message, response) {
    const reply = await message.reply(response);
    console.log("2");
}

export { handleCommand, sendReply };