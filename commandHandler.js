import { handler as infoHandler } from "./commands/info.js";
import { handler as remindHandler } from "./commands/remind.js";
import { handler as ctaHandler } from "./commands/cta.js";

async function handleCommand(interaction) {
    if (interaction.commandName == "info") {
        await infoHandler(interaction);
    }
    else if (interaction.commandName == "remind") {
        await remindHandler(interaction);
    }
    else if (interaction.commandName == "cta") {
        await ctaHandler(interaction);
    }
}

export { handleCommand };