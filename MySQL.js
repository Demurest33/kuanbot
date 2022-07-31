const mysql = require('mysql');


async function mysqlCommands(name,url,discord_id,commandName){
    const connection = mysql.createConnection({
        host: 'localhost',
        user:'Jara',
        password:'toor',
        database:'wallpapersdb'
    })
    
    connection.connect((error)=>{
       if(error) throw error
       //console.log("La coneccion funciona"); 
    });

    //como se repite tanto lo de llamar a la funcion de getUserID entonces abria que llamarla para una variable glabal aqui.
    //pero esa funcion tambien sirve para validar si el usuario esta registrado asi que habria de crear otra para esa funcion.

    switch (commandName) {
        case "signin":
            const user_id = await verifyUser(connection,discord_id);
            if(user_id.length == 0) {
                const registerResult = await register(connection,name,discord_id);
                connection.end();
                return registerResult;
            }
            connection.end();
            return "This user is already registered with ID " + user_id[0].ID;
            break;
        
        case "newfolder":
            //checar que el usuario este registrado
            const user_id_f = await verifyUser(connection,discord_id);
            if(user_id_f.length != 0) {
                const repeatRes = await checkFolderRepeat(connection,user_id_f[0].ID,name.name);
                if(repeatRes.length == 0){
                    let validmsg ="";
                    const valid = await isValidHttpUrl(name.new_img_url);
                    if(!valid){
                        name.cover_url = "https://cdn.akamai.steamstatic.com/steam/apps/431960/capsule_616x353.jpg?t=1637933048";
                        validmsg= "\nThe cover URL is not valid. Default was placed instead."
                    }
                    const newFolder = await createFolder(connection,name,user_id_f[0].ID);
                    connection.end();
                    return newFolder + validmsg;
                }
                connection.end();
                return "There is already" + repeatRes.length + " folder with the name " + name.name; 
            }
            connection.end();
            return "You need an acount to acess to commands. Create sign in using /signin"
            break;

        case "addwallpaper":
            const user_id_addwal = await verifyUser(connection,discord_id);
            if(user_id_addwal.length != 0) {
                //con su ID de usuario buscar que tenga un folder con el nombre que esta dando (idea: hacer un comando para ver tus folders y cuantos elementos tienen y las etiquetas?)
                const folderExists = await checkFolderRepeat(connection,user_id_addwal[0].ID,name);
                if(folderExists.length > 0){
                    const folder_id = folderExists[0].ID;
                    const wallpaperExists = await getWallpaperID(connection,url);
                    if(wallpaperExists.length > 0){
                        const wallpaperID = wallpaperExists[0].ID;
                        const addwall = await addwallpapertoFolder(connection,folder_id,wallpaperID);
                        connection.end();
                        if(addwall == 0){return "Repeated wallpapers are not allowed in the same folder"}
                        return addwall;
                    }else{
                        //tenemos que insertar el wallpaper a partir de la url en la tabla de wallpapers
                        const wallp = require('./wallpapers.js');
                        const wallpaper = await wallp.scrapeWorkshop(url);
                        if(wallpaper == 0){return "URL is not valid"};
                        const createdWallpaperID = await addwallpaper(connection,wallpaper);
                        console.log(createdWallpaperID);
                        const addwall = await addwallpapertoFolder(connection,folder_id,createdWallpaperID);
                        connection.end();
                        if(addwall == 0){return "Repeated wallpapers are not allowed in the same folder"}
                        return addwall;
                    }
                }
                connection.end();
                return "El folder " + name + " no existe";
            }
            connection.end();
            return "You need an acount to acess to commands. Create sign in using /signin"
            break;
        
        case "lookforuser":
            const user = await getUser(connection,name);
            if(user.length != 0){
                const userFolders = await getFolders(connection,user[0].ID);
                const userObj = {
                    username: user[0].name,
                    ID: user[0].ID,
                    folders: userFolders
                };
                connection.end();
                
                return userObj;
            }
            connection.end();
            //El username no es valido
            return 0;
            break;
        
        case "self":
            const user_id_self = await verifyUser(connection,discord_id);
            if(user_id_self.length != 0) {
                const userFolders = await getFolders(connection,user_id_self[0].ID);
                const userObj = {
                    username: user_id_self[0].name,
                    ID: user_id_self[0].ID,
                    folders: userFolders
                };
                connection.end();
                return userObj;
            }
            connection.end();
            return 0;
            break;

        case "lookforfolder":
            const userFolders_lookf = await getFolderByName(connection,name);

            let usernameList = [];
            for (let i = 0; i < userFolders_lookf.length; i++) {
                let tempResult = await getUsernameByID(connection,userFolders_lookf[i].user_ID);
                usernameList[i] = {folderName: userFolders_lookf[i].name,
                     username :tempResult[0].name,
                     folderDescription: userFolders_lookf[i].description,
                     folderCover: userFolders_lookf[i].cover_url,
                     folderID: userFolders_lookf[i].ID,
                    };
            }
            connection.end();
            return usernameList;
            break;
        
        case "editfolder":
            const user_editfolder = await verifyUser(connection,discord_id);
            if(user_editfolder.length != 0) {
                //verificar que tenga un folder con el nombre que me dio
                const repeatRes = await checkFolderRepeat(connection,user_editfolder[0].ID,name.folderName);
                if(repeatRes.length != 0){
                    
                    if(name.delete_folder){
                        const update = await deleteFolder(connection,repeatRes[0].ID);
                        return update;
                    }
                    let resultString = "";
                    if (name.new_description != " ") {
                        const update = await updateFolder(connection,"description",name.new_description,user_editfolder[0].ID,name.folderName);
                        resultString = resultString +   "\n description: " + update;
                    }
                    if (name.new_img_url != " ") {
                        const valid = await isValidHttpUrl(name.new_img_url);
                        if (valid) {
                            const update = await updateFolder(connection,"cover_url",name.new_img_url,user_editfolder[0].ID,name.folderName);
                            resultString = resultString + "\n cover: " + update;
                        }else{resultString = resultString + "\n URL is not valid";}
                        
                    }
                    if (name.new_name != " ") {
                        const update = await updateFolder(connection,"name",name.new_name,user_editfolder[0].ID,name.folderName);
                        resultString = resultString + "\n name: " + update;
                    }
                    return resultString;
                }
                connection.end();
                return "You dont have a folder named " + name.folderName;
            }
            connection.end();
            return "You need an acount to acess to commands. Create sign in using /signin"
            break;
        
        default:
            connection.end();
            return "El nombre del comnado no coincide.";
            break;
    };
}

async function wallpapers(folder){
    const connection = mysql.createConnection({
        host: 'localhost',
        user:'Jara',
        password:'toor',
        database:'wallpapersdb'
    })
    
    connection.connect((error)=>{
        if(error) throw error
        //console.log("La coneccion funciona"); 
    });
    
    const userFolders = await folders_Wallpapers_ByFolderID(connection,folder.folderID);
    if(userFolders.length != 0){
        let wallpaperArray = [];
        for (let i = 0; i < userFolders.length; i++) {
            let tmpArray = await getWallpapersByID(connection,userFolders[i].wallpaper_ID);
            wallpaperArray[i] = tmpArray[0];
        }
        connection.end();
        //console.log(wallpaperArray);
        return wallpaperArray;
    }
    connection.end();
    return 1;
}

async function verifyUser (connection,discord_id) { 
    return new Promise((resolve,reject)=>{ 
        const getUserIDQuery = `SELECT * FROM users WHERE discord_id = "${discord_id}"`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(0);
            } else {
                //console.log(rows);
                resolve(rows);
            }
        });
    })
}

async function getUser (connection,username) { 
    return new Promise((resolve,reject)=>{ 
        const getUserIDQuery = `SELECT ID FROM users WHERE name = "${username}"`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(0);
            } else {
                //console.log(rows);
                resolve(rows);
            }
        });
    })
}

async function getFolders (connection,user_id) { 
    return new Promise((resolve,reject)=>{
        const getUserIDQuery = `SELECT * FROM folders WHERE user_ID = ${user_id};`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(0);
            } else {
                //console.log(rows);
                resolve(rows);
            }
        });
    })
}

async function getFolderByName (connection,folderName) { 
    return new Promise((resolve,reject)=>{
        const getFolderByNameQuery = `SELECT * FROM folders WHERE name = "${folderName}";`;
        connection.query(getFolderByNameQuery,(error,rows)=>{
            if (error) {
                resolve(0);
            } else {
                resolve(rows);
            }
        });
    })
}

async function getUsernameByID (connection,user_id) { 
    return new Promise((resolve,reject)=>{
        const getUsernameQuery = `SELECT name FROM users WHERE ID = "${user_id}";`;
        connection.query(getUsernameQuery,(error,rows)=>{
            if (error) {
                resolve(0);
            } else {
                resolve(rows);
            }
        });
    })
}

async function folders_Wallpapers_ByFolderID (connection,folderID) { 
    return new Promise((resolve,reject)=>{
        const getUserIDQuery = `SELECT * FROM folders_wallpapers WHERE folder_ID = ${folderID};`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve(rows);
            }
        });
    })
}

async function getWallpapersByID (connection,wallpaperID) { 
    return new Promise((resolve,reject)=>{
        const getUserIDQuery = `SELECT * FROM wallpapers WHERE ID = ${wallpaperID}`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve(rows);
            }
        });
    })
}

async function register (connection,name,discord_id){
    return new Promise((resolve,reject)=>{
        //'INSERT INTO users(name,discord_id) VALUES("test","401926376392753164")';
        const newUserQuery = `INSERT INTO users(name,discord_id) VALUES("${name}","${discord_id}");`;
        connection.query(newUserQuery,(error,rows)=>{
            if (error) {
                reject(error.sqlMessage)
            } else {
                resolve("Successfully registered as: " + name);
            }
        });
    })
}

async function checkFolderRepeat (connection,user_id,name){
    return new Promise((resolve,reject)=>{
        const getUserIDQuery = `SELECT * FROM folders WHERE user_id = "${user_id}" AND name = "${name}";`;
        connection.query(getUserIDQuery,(error,rows)=>{
            if (error) {
                resolve(error+" ");
            }else{
                resolve(rows);
            }
        });
    })
}

async function createFolder(connection,folderItems,user_id){
    return new Promise((resolve,reject)=>{
        const newFolderQuery = `INSERT INTO folders(name,user_ID,description,cover_url) VALUES("${folderItems.name}","${user_id}","${folderItems.description}","${folderItems.cover_url}");`;
        connection.query(newFolderQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve("Folder " + folderItems.name + " has been created");
            }
        });
    })
}

async function getWallpaperID(connection,url){
    return new Promise((resolve,reject)=>{
        //ver si tenemos el wallpaper en la tabla de wallpapers, si no entonces lo sacamos con el scrapping.
        const getWallpaperIDQuery = `SELECT * FROM wallpapers WHERE url = "${url}"`;
        connection.query(getWallpaperIDQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve(rows);
            }
        });
    })
}

async function addwallpaper(connection,wallpaper){
    return new Promise((resolve,reject)=>{
        const addwallpaperQuery = `INSERT INTO wallpapers(ID,url,title,img_url) VALUES("${wallpaper.id}","${wallpaper.url}","${wallpaper.title}","${wallpaper.imgSrc}");`;
        connection.query(addwallpaperQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve(wallpaper.id);
            }
        });
    })
}

async function addwallpapertoFolder(connection,folder_id,wallpaperID){
    return new Promise((resolve,reject)=>{
        const combinedID = wallpaperID.toString() + folder_id.toString();
        console.log("combined id: " + combinedID);
        const addwallpapertoFolderQuery = `INSERT INTO folders_wallpapers(ID,folder_ID,wallpaper_ID) VALUES("${combinedID}","${folder_id}","${wallpaperID}");`;
        connection.query(addwallpapertoFolderQuery,(error,rows)=>{
            if (error) {
                console.log(error.sqlMessage);
                resolve(0);
            } else {
                resolve("Wallpaper added to folder");
            }
        });
    })
}

async function updateFolder(connection,field,value,user_ID,foldername){
    return new Promise((resolve,reject)=>{
        const addwallpapertoFolderQuery = `UPDATE folders SET ${field} = "${value}" WHERE name = "${foldername}" AND user_ID = ${user_ID}`;
        connection.query(addwallpapertoFolderQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve("changes made successfully");
            }
        });
    })
}

async function deleteFolder(connection,folderID){
    return new Promise((resolve,reject)=>{
        //DELETE FROM `folders` WHERE `folders`.`ID` = 8s
        const addwallpapertoFolderQuery = `DELETE FROM folders WHERE ID = ${folderID}`;
        connection.query(addwallpapertoFolderQuery,(error,rows)=>{
            if (error) {
                resolve(error.sqlMessage);
            } else {
                resolve("Folder deleted successfully");
            }
        });
    })
}

async function isValidHttpUrl(string) {
    return new Promise((resolve,reject)=>{
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      resolve(false);  
    }
    
    if(url.protocol === "http:" || url.protocol === "https:"){
        const lower= string.toLowerCase();
        if(lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".png")){
            resolve(true);
        }
        resolve(false);
    }
    resolve(false);
  })
}
module.exports = {
    mysqlCommands,
    wallpapers,
};
