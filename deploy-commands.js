const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('signin').setDescription('Register to create folders and upload wallpapers!')
	.addStringOption(option =>
		option.setName('name')
			.setDescription('your username for this application')
			.setRequired(true)),

	new SlashCommandBuilder().setName('newfolder').setDescription('Create a folder to share with your friends!')
	.addStringOption(option =>
		option.setName('name')
			.setDescription('How you want to name your folder')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('description')
			.setDescription('Describe whats your folder about for others to know about it')
			.setRequired(false))
	.addStringOption(option =>
		option.setName('coverimg')
			.setDescription('Insert the url of an image you want to use for your folder')
			.setRequired(false)),

	new SlashCommandBuilder().setName('addwallpaper').setDescription('Insert the url of a wallpaper and add it to your folder!')
	.addStringOption(option =>
		option.setName('folder')
			.setDescription('The name of your folder where you want to save the wallpaper')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('url')
			.setDescription('Insert the wallpaper URL from the workshop')
			.setRequired(true)),

	new SlashCommandBuilder().setName('lookforuser').setDescription('Look for someones profile')
	.addStringOption(option =>
		option.setName('username')
			.setDescription("The name of the user who's folder you want to see")
			.setRequired(true)),
	
	new SlashCommandBuilder().setName('lookforfolder').setDescription('Search for someones folder')
	.addStringOption(option =>
		option.setName('foldername')
			.setDescription('The name of your folder you want to see')
			.setRequired(true)),
	
	new SlashCommandBuilder().setName('self').setDescription('Look your own profile'),

	new SlashCommandBuilder().setName('editfolder').setDescription('Change the description or imgurl of one of your folders')
	.addStringOption(option =>
		option.setName('foldername')
			.setDescription('The name of your folder you want to see')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('new_name')
			.setDescription('Set a new description')
			.setRequired(false))
	.addStringOption(option =>
		option.setName('new_description')
			.setDescription('Set a new description')
			.setRequired(false))
	.addStringOption(option =>
		option.setName('new_cover_url')
			.setDescription('Give a new img url to change de cover of your folder')
			.setRequired(false))
	.addBooleanOption(option =>
		option.setName('delete_folder')
			.setDescription('This will automatically delete your folder')
			.setRequired(false)),
	
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);