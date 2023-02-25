import { config } from 'dotenv';
import { 
    ActionRowBuilder, 
    Client, 
    GatewayIntentBits, 
    InteractionType, 
    ModalBuilder, 
    Routes, 
    StringSelectMenuBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    Events, 
    Partials, 
    REST 
} from 'discord.js';
import { handleCommand } from "./commandHandler.js";
import { infoCommand } from './commands/info.js';
import { remindCommand, lastMessageSentIsCrucial } from './commands/remind.js';
import { ctaCommand } from "./commands/cta.js";

let isRateLimited = false;
let rateLimitResetTime = 0;

const commands = [
    infoCommand,
    remindCommand,
    ctaCommand
];

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction
    ],
    rest: {
        rejectOnRateLimit: (rateLimitInfo) => {
            isRateLimited = true;
            let currentTime = Date.now();
            rateLimitResetTime = currentTime + rateLimitInfo.timeToReset;

            return !lastMessageSentIsCrucial;
        }
    }
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on(Events.ClientReady, async () => {
    let promises = [];
    client.guilds.cache.map(guild => {
        console.log(`Sending up slash command information to ${guild.id}...`);
        promises.push(
            rest.put(Routes.applicationGuildCommands(CLIENT_ID, guild.id), {
                body: commands
            })
        );
    });

    await Promise.all(promises);

    console.log("The bot is ready...");
});

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    // Check if the member wasn't boosting before, but is now.
    if (!oldMember.premiumSince && newMember.premiumSince) {
        // Member started boosting.
        console.log(`${newMember.displayName} started boosting this server!`);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    await handleCommand(interaction);
});

async function main() {
    try {
        await client.login(TOKEN);
    } catch (err) {
        console.log(err);
    }
}

main();

process.on('uncaughtException', (err) => {
    if (err.timeToReset) {
        return;
    }

    console.log(err);
    process.exit();
});

export { client, isRateLimited, rateLimitResetTime };