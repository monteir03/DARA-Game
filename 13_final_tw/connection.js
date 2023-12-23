document.getElementById('login').addEventListener('click', function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  doRegister(username, password);
});

var serverUrl = "http://twserver.alunos.dcc.fc.up.pt:8008/";

function doRegister(username, password) {
  fetch(serverUrl + "register", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nick: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.status === 'success') {
      alert('Registration successful');
    } else {
      alert('Registration failed: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Problem connecting to the server');
  });
}