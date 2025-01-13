const { SlashCommandBuilder } = require('discord.js');

function sortArray(array) {
	return array.slice().sort((a, b) => a - b);
}

function removeDuplicates(array) {
	return [...new Set(array)];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll dice')
		.addIntegerOption(option => option.setName('regular_dice')
			.setDescription('Number of regular dice')
			.setRequired(true))
		.addIntegerOption(option => option.setName('bonus_dice')
			.setDescription('Number of regular dice'))
		.addIntegerOption(option => option.setName('static_bonus')
			.setDescription('Static bonus value')),
	async execute(interaction) {
		const reg_dice_count = await interaction.options.getInteger('regular_dice');
		const bon_dice_count = await interaction.options.getInteger('bonus_dice') ?? 0;
		const static_bonus = await interaction.options.getInteger('static_bonus') ?? 0;
		const reg_dice = [];
		const bon_dice = [];
		const sums = [];
		let earned_boost = false;
		let boost_die = 0;

		// roll regular dice
		for (i = 0; i < reg_dice_count; i++) {
			const die = Math.ceil(Math.random() * 6);
			earned_boost = die === 6 ? true : earned_boost;
			reg_dice.push(die);
		}

		// roll bonus dice
		for (i = 0; i < bon_dice_count; i++) {
			const die = Math.ceil(Math.random() * 6);
			earned_boost = die === 6 ? true : earned_boost;
			bon_dice.push(die);
		}

		// roll boost die
		if (earned_boost) {
			boost_die = Math.ceil(Math.random() * 6);
		}

		// Calculate sums
		if (bon_dice.length > 0) {
			for (r = 0; r < reg_dice.length; r++) {
				for (const bonus_die of bon_dice) {
					const sum = reg_dice.reduce((acc, val, index) => acc + (index === r ? bonus_die : val));
					sums.push(sum + boost_die + static_bonus);
				}
			}
		}

		// sum regular dice and add boost
		let temp_sum = 0;
		reg_dice.forEach(die => temp_sum += die);
		if (boost_die) {
			temp_sum += boost_die + static_bonus;
		}
		sums.push(temp_sum);

		// Create the message
		const msg = `\`\`\`\nRegular Dice | ${sortArray(reg_dice).join(', ')}\nBonus Dice | ${bon_dice.length > 0 ? sortArray(bon_dice).join(', ') : 'N/A'}\nBoost Die | ${boost_die > 0 ? boost_die : 'N/A'}\nStatic Bonus | ${static_bonus > 0 ? static_bonus : 'N/A'}\nSums | ${removeDuplicates(sortArray(sums)).join(', ')}\n\`\`\``;

		await interaction.reply(msg);
	},
};