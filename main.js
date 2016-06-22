const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = require('electron');
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