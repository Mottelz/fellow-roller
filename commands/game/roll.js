const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll dice')
		.addIntegerOption(option => option.setName('Regular Dice')
			.setDescription('Number of regular dice')
			.setRequired(true))
		.addIntegerOption(option => option.setName('Bonus Dice')
			.setDescription('Number of regular dice')),
	async execute(interaction) {
		await interaction.reply('You rolled dice. We\'re still getting the bot set up.');
	},
};