
-- intentando crear la tabla de folders
-- https://www.youtube.com/watch?v=Npj0Z_PXklU

CREATE TABLE folders(
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_ID int NOT NULL,
    CONSTRAINT FK_userID FOREIGN KEY(user_ID) REFERENCES users(ID)
    
);

--resetear tabla
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT=1;

CREATE TABLE users(
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    discord_id varchar(255) NOT NULL UNIQUE
);

--En una tabla llamada WALLPAPERS. COLUMNAS: ID,url,title,img_url

CREATE TABLE wallpapers(
    ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    title VARCHAR(255),
    img_url VARCHAR(255)
);

--añadir elementos sin modificar weas

INSERT IGNORE INTO folders 
  (ID,name,user_ID) 
VALUES 
  (12,"lolis",1);

--buscar un folder junto con su creador
SELECT * FROM folders WHERE user_id = 1 AND name = "lolis";

--Hacer una tabla intermedia entre folders y wallapapers con una id combinada, que sera la wallpapers.id+folders.id.

CREATE TABLE folders_wallpapers(
    ID varchar(20) PRIMARY KEY,
    folder_ID int NOT NULL,
    wallpaper_ID int NOT NULL,
    CONSTRAINT FK_folderID FOREIGN KEY(folder_ID) REFERENCES folders(ID),
    CONSTRAINT FK_wallpaperID FOREIGN KEY(wallpaper_ID) REFERENCES wallpapers(ID)
);

--sacar el nombre de los wallpapers de un usuario

SELECT name FROM folders WHERE user_ID = 1;

--update el cover de los folders

UPDATE `folders` SET `cover_url` = 'https://images3.alphacoders.com/228/228075.jpg' WHERE `folders`.`ID` = 5;