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

      // create buttons
      let btnUpdate = document.createElement('button');
      btnUpdate.textContent = 'Update';
      btnUpdate.setAttribute('class', 'update-user');
      // verify the best way to do this
      /*btnUpdate.addEventListener('click', () => {
        let divDoc = btnUpdate.parentNode;
        console.log(divDoc.firstChild.textContent);
      });*/

      let btnDelete = document.createElement('button');
      btnDelete.textContent = 'Delete';
      btnDelete.setAttribute('class', 'delete-user');

      // add buttons in the view
      divDoc.appendChild(btnUpdate);
      divDoc.appendChild(btnDelete);

      // insert doc and buttons in the view
      divResp.appendChild(divDoc);
    });
  }
  else {
    divResp.textContent = 'No documents found';
  }
});