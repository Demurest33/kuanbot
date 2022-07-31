const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MESSAGES]});
const sql = require('./MySQL.js');
const foldersImp = require('./folders.js');
const profile = require('./profiles.js');


client.once('ready', () => {console.log('Ready!');})
client.login(token);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const { commandName } = interaction;

	if (commandName === 'signin') {
		
		const name = interaction.options.getString('name')||" ";
		await interaction.reply({content: "Creating new user...",});
        const results = await sql.mysqlCommands(name," ",interaction.user.id,commandName);
		await interaction.editReply({content: " "+results,});

	}else if (commandName === 'newfolder') {

		const name = interaction.options.getString('name')||" ";
		const description = interaction.options.getString('description')||" ";
		const cover_url = interaction.options.getString('coverimg')||"https://cdn.akamai.steamstatic.com/steam/apps/431960/capsule_616x353.jpg?t=1637933048";
		let folderItems = {
			name: name,
			description : description,
			cover_url: cover_url
		}

		await interaction.reply({content: "Creating folder...",});
        const results = await sql.mysqlCommands(folderItems," ",interaction.user.id,commandName);
		await interaction.editReply({content: " "+results,});

	}else if (commandName === 'addwallpaper') {

		const folder = interaction.options.getString('folder')||" ";
		const url = interaction.options.getString('url')||" ";
		await interaction.reply({content: "Adding wallpaper...",});
		const results = await sql.mysqlCommands(folder,url,interaction.user.id,commandName);
		await interaction.editReply({content: " "+results,});

	}else if (commandName === 'lookforuser'){
	
		const username = interaction.options.getString('username')||" ";
		await interaction.reply({content: "Loading user...",});
		const results = await sql.mysqlCommands(username," ",interaction.user.id,commandName);

		if(results !=0){
			const profileEmbed = await profile.generateEmbed(results);
			await interaction.editReply({content: " ", embeds: [profileEmbed],});
		}else{await interaction.editReply({content: "The username is not valid",});}
		
	}else if (commandName === 'self'){

		await interaction.reply({content: "Loading user...",});
		//esta funcion deberia cambiar los parametros para que recoja un objeto con los inputs y la discord_id para evitar ir agregando mas campos
		const results = await sql.mysqlCommands(" "," ",interaction.user.id,commandName);
		
		if(results !=0){
			const profileEmbed = await profile.generateEmbed(results);
			await interaction.editReply({content: " ", embeds: [profileEmbed],});
		}else{await interaction.editReply({content: "You need an acount to acess to commands. Create sign in using /signin",});}

	}else if (commandName === 'lookforfolder'){

		const folder = interaction.options.getString('foldername')||" ";
		await interaction.reply({content: "Loading folder...",});
		
		const results = await sql.mysqlCommands(folder," ",interaction.user.id,commandName);
		if(results !=0 && results !=1){

			const foldersEmbed = await foldersImp.generateEmbed(1,results);
			const message = await interaction.editReply({content: " ", embeds: [foldersEmbed],});
			foldersImp.reactionCollect(message,interaction,results);

		}else if (results == 1){await interaction.editReply({content: "This folder does not have any wallpapers yet.",});
		}else{await interaction.editReply({content: "There isnt a folder with this name.",})};
	
	}else if (commandName === 'editfolder'){
		
		const folderName = interaction.options.getString('foldername')||" ";
		const new_name = interaction.options.getString('new_name')||" ";
		const new_description = interaction.options.getString('new_description')||" ";
		const new_img_url = interaction.options.getString('new_cover_url')||" ";
		const delete_folder = interaction.options.getBoolean('delete_folder')|| false;

		let folderChanges = {
			folderName: folderName,
			new_name: new_name,
			new_description: new_description,
			new_img_url: new_img_url,
			delete_folder: delete_folder
		}

		await interaction.reply({content: "Entering changes...",});
		const results = await sql.mysqlCommands(folderChanges," ",interaction.user.id,commandName);
		await interaction.editReply({content: " "+results,});
	}
});