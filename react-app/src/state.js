import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000/socket.io/')
const lobbies = {}
socket.on("lobbyUpdateInfo", function(data) {
  const obj = JSON.parse(data)
  if (obj.users.length === 0) {
    delete lobbies[obj.lobbyName]
  } else {
    lobbies[obj.lobbyName] = obj
  }
})
socket.emit("enterLobbyList")

export {
  lobbies,
  socket
}
