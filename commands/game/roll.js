const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

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
		.addIntegerOption(option => option
			.setName('regular_dice')
			.setDescription('Number of regular dice')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('bonus_dice')
			.setDescription('Number of regular dice'))
		.addIntegerOption(option => option
			.setName('static_bonus')
			.setDescription('Static bonus value'))
		.addBooleanOption(option => option
			.setName('whisper')
			.setDescription('Hide the results from everyone but you')),
	async execute(interaction) {
		const reg_dice_count = await interaction.options.getInteger('regular_dice');
		const bon_dice_count = await interaction.options.getInteger('bonus_dice') ?? 0;
		const static_bonus = await interaction.options.getInteger('static_bonus') ?? 0;
		const whisper = await interaction.options.getBoolean('whisper') ?? false;
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

		// sum regular dice and add boost
		let temp_sum = 0;
		reg_dice.forEach(die => temp_sum += die);
		sums.push(temp_sum);
		if (boost_die) {
			sums.push(temp_sum + boost_die);
		}

		for (let b = 0; b < bon_dice.length; b++) {
			bonus_die = bon_dice[b];
			for (let r = 0; r < reg_dice.length; r++) {
				temp_sum = sums[0] - reg_dice[r] + bon_dice[b];
				sums.push(temp_sum);
			}
		}

		if (static_bonus) {
			sums.push(...sums.map(total => total + static_bonus));
		}

		const embed = new EmbedBuilder()
			.setTitle(`Roll Results: ${Math.max(...sums)}`)
			.addFields(
				{ name: 'Regular Dice', value: `${sortArray(reg_dice).join(', ')}`, inline: true },
				{ name: '\u200b', value: '\u200b', inline: true },
				{ name: 'Bonus Dice', value: `${bon_dice.length > 0 ? sortArray(bon_dice).join(', ') : 'N/A'}`, inline: true },
				{ name: 'Boost Dice', value: `${ boost_die > 0 ? boost_die : 'N/A'}`, inline: true },
				{ name: '\u200b', value: '\u200b', inline: true },
				{ name: 'Static Bonus', value: `${static_bonus > 0 ? static_bonus : 'N/A'}`, inline: true },
				{ name: 'All Results', value: `${removeDuplicates(sortArray(sums)).join(', ')}` },
			);

		if (whisper) {
			await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ embeds: [embed] });
		}
	},
};