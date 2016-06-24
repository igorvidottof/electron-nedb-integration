const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = require('electron');
const fs = require('fs-extra');
const Datastore = require('nedb');

const db = new Datastore({
  filename: 'test.db', autoload: true, timestampData: true 
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
  db.insert(newUser, (err, newDoc) => {
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
  db.find(query, (err, docs) => {
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
  db.update(query, changes, (err, numAffected) => {
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
  db.remove({_id: id}, (err, numRemoved) => {
    if(err)  
      event.sender.send('remove-user-error', `An error occurred\n${err}`);
    else if(numRemoved === 0) 
      event.sender.send('remove-user-error', 'User not found!');
    else 
      event.sender.send('remove-user-success', 'User removed!');
  });
});

// upload a media file
ipcMain.on('upload-media-request', (event, mediaPath) => {
  console.log(mediaPath);
  // fs.copy(mediaPath, './', (err) => {
  //   if(err)
  //     return console.error(err);
  //   else 
  //     console.log('success');
  // });
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