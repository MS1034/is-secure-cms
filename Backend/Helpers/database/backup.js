const fs = require('fs');
const moment = require('moment');
const { exec } = require('child_process');
const path = require("path");


// Function to generate datetime stamp
function getDateTimeStamp() {
  return moment().format('YYYY-MM-DD_HH-mm-ss');
}

// Backup function with datetime stamp
function backup() {
  const dateTimeStamp = getDateTimeStamp();
  const backupPath = `./Backups/${dateTimeStamp}`;
  const backupCommand = `mongodump --uri=${process.env.MONGO_URI} --out=${backupPath}`;
  exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup process encountered an error: ${error}`);
    } else {
      console.log(`Backup process completed at ${dateTimeStamp}: ${stdout}`);
    }
  });
}

// Function to find and delete old backups
function deleteOldBackups() {
  const backupDir = './Backups';
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error(`Error reading backup directory: ${err}`);
      return;
    }

    const currentDateTime = moment();
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const fileStat = fs.statSync(filePath);
      const modifiedDateTime = moment(fileStat.mtime);

      // Check if the file is older than 7 days and delete it
      if (currentDateTime.diff(modifiedDateTime, 'days') > 7) {
        fs.rm(filePath, { recursive: true }, err => {
          if (err) {
            console.error(`Error deleting old backup: ${err}`);
          } else {
            console.log(`Deleted old backup: ${file}`);
          }
        });
      }
    });
  });
}

// Schedule backup (daily at midnight) and delete old backups



// Function to find the latest backup
function findLatestBackup() {
    const backupDir = './Backups';
    let latestBackup = null;
    let latestBackupDateTime = moment(0); // Initialize with a very old date
  
    fs.readdirSync(backupDir).forEach(file => {
      const filePath = path.join(backupDir, file);
      const fileStat = fs.statSync(filePath);
      const modifiedDateTime = moment(fileStat.mtime);
      
      if (modifiedDateTime.isAfter(latestBackupDateTime)) {
        latestBackupDateTime = modifiedDateTime;
        latestBackup = filePath;
      }
    });
  
    return latestBackup;
  }
  
  // Restore function
  function restore() {
    const latestBackup = findLatestBackup();
    if (!latestBackup) {
      console.log("No backups found for restore");
      return;
    }
  
    const restoreCommand = `mongorestore --uri=${process.env.MONGO_URI} ${latestBackup}`;
    exec(restoreCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Restore process encountered an error: ${error}`);
      } else {
        console.log(`Restore process completed from ${latestBackup}: ${stdout}`);
      }
    });
  }



  module.exports= {backup, deleteOldBackups, restore};