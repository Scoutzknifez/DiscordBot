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

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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
    ]
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', () => {
    console.log("The bot is ready...");


});

/*client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    let messageString = message.content;
    if (messageString.startsWith("!")) {
        await handleCommand(message);
    }
});*/

client.on('messageReactionAdd', async (reaction) => {
    if (reaction.partial) {
        await reaction.fetch();
    }

    // console.log(reaction);
});

client.on(Events.InteractionCreate, async (interaction) => {
    await handleCommand(interaction);

    /*if (interaction.isCommand() && !interaction.author.bot) {
        await handleCommand(interaction);
    }*/
});

async function main() {
    const commands = [
        infoCommand
    ];

    try {
        console.log("Sending up slash command information...");
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });

        client.login(TOKEN);
    } catch (err) {
        console.log(err);
    }
}

main();