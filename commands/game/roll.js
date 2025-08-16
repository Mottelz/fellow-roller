const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

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
		const dice = [];
		let sum = 0;
		let earned_boost = false;
		let boost_die = 0;
		const total_dice = reg_dice_count + bon_dice_count;

		if (total_dice <= 0) {
			return interaction.reply({ content: 'You must roll at least one die.', ephemeral: true });
		}

		// roll dice
		for (let i = 0; i < total_dice; i++) {
			const die = Math.ceil(Math.random() * 6);
			earned_boost = die === 6 ? true : earned_boost;
			dice.push(die);
		}

		if (earned_boost) {
			boost_die = Math.ceil(Math.random() * 6);
		}

		dice.sort((a, b) => b - a);
		sum = dice.slice(0, reg_dice_count).reduce((acc, val) => acc + val, 0) + static_bonus + boost_die;

		const embed = new EmbedBuilder()
			.setTitle(`Roll Result: ${sum}`)
			.addFields(
				{ name: 'Rolled Dice', value: `${dice}`, inline: true },
				{ name: '\u200b', value: '\u200b', inline: true },
				{ name: 'Dice Count', value: `Reg: ${reg_dice_count}, Bon: ${bon_dice_count}`, inline: true },
				{ name: 'Boost Die', value: `${boost_die > 0 ? boost_die : 'N/A'}`, inline: true },
				{ name: '\u200b', value: '\u200b', inline: true },
				{ name: 'Static Bonus', value: `${static_bonus > 0 ? static_bonus : 'N/A'}`, inline: true },
			);

		await interaction.reply({
			embeds: [embed],
			flags: whisper ? MessageFlags.Ephemeral : 0,
		});
	},
};