const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = require('electron');
const fs = require('fs-extra');
const Datastore = require('nedb');
const {dialog} = require('electron');
const os = require('os');

const homeDir = os.homedir();

const db = {};
db.users = new Datastore({
  filename: 'test.db', autoload: true, timestampData: true 
});
db.files = new Datastore({
  filename: 'files.db', autoload: true, timestampData: true 
});

let win;

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

// insert a document
ipcMain.on('save-user-request', (event, user) => {
  let newUser = {
    name: user.name,
    age: user.age
  };
  db.users.insert(newUser, (err, newDoc) => {
    if(err)
      event.sender.send('save-user-error', `An error occurred\n${err}`);
    else 
      event.sender.send('save-user-success', newDoc); 
  });
});

// find documents by field name
ipcMain.on('find-users-request', (event, searchedName) => {
  searchedName = new RegExp(searchedName);
  let query = {name: searchedName};
  db.users.find(query, (err, docs) => {
    if(err)
      event.sender.send('find-users-error', `An error occurred\n${err}`);
    else 
      event.sender.send('find-users-success', docs);
  });
});

// update a document by id
ipcMain.on('update-user-request', (event, user) => {
  let query = {_id: user._id};
  let changes = { $set: {name: user.newName, age: user.newAge} };
  db.users.update(query, changes, (err, numAffected) => {
    if(err)
      event.sender.send('update-user-error', `An error occurred\n${err}`);
    else if(numAffected === 0)
      event.sender.send('update-user-error', 'User not found!');
    else 
      event.sender.send('update-user-success', 'User updated!');
  });
});

// remove a document by id
ipcMain.on('remove-user-request', (event, id) => {
  db.users.remove({_id: id}, (err, numRemoved) => {
    if(err)  
      event.sender.send('remove-user-error', `An error occurred\n${err}`);
    else if(numRemoved === 0) 
      event.sender.send('remove-user-error', 'User not found!');
    else 
      event.sender.send('remove-user-success', 'User removed!');
  });
});

// upload a media file
ipcMain.on('select-audio-request', (event) => {
  let audioPath = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'Audios', extensions: ['wav', 'mp3', 'ogg']}
    ]
  });
  event.sender.send('select-audio-success', audioPath);
});

ipcMain.on('select-image-request', (event) => {
  let imagePath = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'gif']}
    ]
  });
  event.sender.send('select-image-success', imagePath);
});

ipcMain.on('upload-media-request', (event, originalPaths) => {
  let dir = `${homeDir}/test-nedb/files`;
  try {
    fs.ensureDirSync(dir);
  } catch (err) {
    event.sender.send('upload-media-error', `An error occurred\n${err}`);
  }

  newPaths = {audio: null, image: null};
  for(let key in originalPaths) {
    let fileName = originalPaths[key].split(/\//);
    fileName = fileName[fileName.length - 1];
    newPaths[key] = `${dir}/${fileName}`;
  }

  db.files.insert(newPaths, (err, newDoc) => {
    if(err) {
      event.sender.send('upload-media-error', `An error occurred\n${err}`);
    }
    else {
      for(let key in originalPaths) {
        fs.copy(originalPaths[key], newPaths[key], (err) => {
          if(err) 
            event.sender.send('upload-media-error', `Error while uploading file\n${err}`);
          else 
            event.sender.send('upload-media-success', newDoc, 'file uploaded!');
        });
      }
    }
  });
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if(win === null) {
    createWindow();
  }
});