import { SlashCommandBuilder } from '@discordjs/builders';

const infoCommand = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Information about the ScoutzDevBot")
    .toJSON();

async function handler(interaction) {
    sendReply(interaction);
}

async function sendReply(interaction) {
    const embed = {
        color: 0x880000,
        title: "ScoutzDevBot Information",
        url: "https://github.com/Scoutzknifez/DiscordBot",
        description: "This is a bot for Scoutzknifez and his development on Discord bots. \n\nIf you would like to see the code to this bot, go ahead and click the link below. \n\nGitHub Repository Link: https://github.com/Scoutzknifez/DiscordBot"
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

export { infoCommand, handler };