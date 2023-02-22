import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } from 'discord.js';
import { client } from "../app.js";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TEN_MINUTES = 10 * ONE_MINUTE;

const ctaCommand = new SlashCommandBuilder()
    .setName("cta")
    .setDescription("NA")
    .addStringOption(option => 
        option.setName("mass_location")
            .setDescription("Where everyone masses")
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("utc_mass_time")
            .setDescription("What time everyone masses")
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("set_count")
            .setDescription("How many sets everyone needs")
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("message")
            .setDescription("NA")
    )
    .toJSON();

async function handler(interaction) {
    let commandArgs = interaction.options._hoistedOptions;

    let argsMap = {};

    commandArgs.forEach(option => {
        argsMap[option.name] = option.value;
    });

    let currentDate = new Date();
    let iso = currentDate.toISOString();

    let currentSmallTime = iso.split('T')[1];
    let currentHourUTC = currentSmallTime.split(':')[0];
    let currentMinuteUTC = currentSmallTime.split(':')[1];

    let massTimeHour = Math.floor(argsMap.utc_mass_time / 100);
    let massTimeMinute = Math.floor(argsMap.utc_mass_time % 100);

    let hourDiff = massTimeHour - currentHourUTC;
    let minuteDiff = massTimeMinute - currentMinuteUTC;

    if (hourDiff < 0) {
        hourDiff += 24;
    }

    if (minuteDiff < 0) {
        hourDiff--;
        minuteDiff += 60;
    }

    sendReply(interaction, argsMap);

    let ctaMassTime = (hourDiff * 3600000) + (minuteDiff * 60000);

    // SEND OUT A 10 MIN REMINDER
    setTimeout(async () => {
        let channel = await client.channels.fetch(interaction.channelId);
        await channel.send(`@everyone\nWe are massing in **10 MINUTES** at **${argsMap.mass_location}** with **${argsMap.set_count}** sets!`);
    }, ctaMassTime - TEN_MINUTES);
}

async function sendReply(interaction, argsMap) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Sign Up Sheet')
                .setStyle(ButtonStyle.Link)
                .setURL("https://docs.google.com/spreadsheets/d/1CGVxMKTZKb3Qo39oeGFSq7IWn0WurYUjAVsS6AvXKqw/edit#gid=0")
    );

    const embed = {
        color: 0x387620,
        // TRY TO MAKE THIS FREE TEXT WITHIN THE /cta COMMAND
        description: `${argsMap.message}`,
        fields: [
            {   // BLANK SPACE
                name: '\u200B', 
                value: '\u200B' 
            },
            {
                name: "MASS LOCATION",
                value: `${argsMap.mass_location}`
            },
            {
                name: "MASS TIME",
                value: `${argsMap.utc_mass_time}`
            },
            {
                name: "SETS",
                value: `${argsMap.set_count}`
            }
        ],
        footer: {
            text: "MAKE SURE YOU SIGN UP ON THE CORRECT SHEET.  IF IT IS A ROAM, SIGN UP ON THE ROAM SECTION."
        }
    };

    if (!argsMap.message) {
        delete embed.description;
        
        for (let i = 0; i < embed.fields.length - 1; i++) {
            embed.fields[i] = embed.fields[i+1];
        }
        embed.fields.pop();
    }

    await interaction.reply({ content: `@everyone`, embeds: [embed], components: [row] });
}

export { ctaCommand, handler };