import { SlashCommandBuilder } from '@discordjs/builders';

const infoCommand = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Information about the ScoutzDevBot.").toJSON();

async function handler(interaction) {
    const embed = {
        color: 0x000000,
        title: "ScoutzDevBot Information",
        url: "https://github.com/Scoutzknifez",
        description: "This is just some information regarding the bot."
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

export { infoCommand, handler };