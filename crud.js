const {ipcRenderer} = require('electron');
let divResp = document.getElementById('found-docs');

// insert a document
let btnSaveUser = document.getElementById('save-user');

btnSaveUser.addEventListener('click', () => {
  let user = {};
  user.name = document.getElementById('name').value;
  user.age = document.getElementById('age').value;
  ipcRenderer.send('save-user-request', user);
});

// get the response from the main process
ipcRenderer.on('save-user-error', (event, err) => {
  alert(err);
});

ipcRenderer.on('save-user-success', (event, doc) => {
  alert(`User inserted: ${doc._id}`);
});

// find documents by field name
let btnFindUsers = document.getElementById('find-users');

btnFindUsers.addEventListener('click', () => {
  let searchedName = document.getElementById('search').value;
  ipcRenderer.send('find-users-request', searchedName);
});

// get the response from the main process
ipcRenderer.on('find-users-error', (event, err) => {
  alert(err);
});

ipcRenderer.on('find-users-success', (event, docs) => {
  divResp.textContent = '';
  if(docs.length) {
    docs.forEach(function(doc) {
      let divDoc = document.createElement('div');

      // insert a doc in an individual div
      let p = document.createElement('p');
      p.textContent = JSON.stringify(doc);
      divDoc.appendChild(p);

      // insert doc and buttons in the view
      divResp.appendChild(divDoc);
    });
  }
  else {
    divResp.textContent = 'No documents found';
  }
});

// update a document by id
let btnUpdateUser = document.getElementById('update-user');

btnUpdateUser.addEventListener('click', () => {
  let user = {};
  user._id = document.getElementById('user-id').value;
  user.newName = document.getElementById('new-name').value;
  user.newAge = document.getElementById('new-age').value;
  ipcRenderer.send('update-user-request', user);
});

ipcRenderer.on('update-user-error', (event, err) => {
  alert(err);
});

ipcRenderer.on('update-user-success', (event, msg) => {
  alert(msg);
});

// remove a document by id
let btnRemoveUser = document.getElementById('remove-user');

btnRemoveUser.addEventListener('click', () => {
  let id = document.getElementById('remove-id').value;
  ipcRenderer.send('remove-user-request', id);
});

ipcRenderer.on('remove-user-error', (event, err) => {
  alert(err);
});

ipcRenderer.on('remove-user-success', (event, msg) => {
  alert(msg);
});

// Upload a media file
let btnUploadMedia = document.getElementById('upload-media');

btnUploadMedia.addEventListener('click', () => {
  let mediaPath = document.getElementById('media').value;
  console.log(mediaPath);
  ipcRenderer.send('upload-media-request', mediaPath);
});
