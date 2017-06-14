package main

// Lobby is a class defining a lobby
type Lobby struct {
  Name string `json:"lobbyName"`
  Users []*UserSession `json:"users"`
  IsPublic bool `json:"isPublic"`
}

// NewLobby - create a new lobby with the given name
func NewLobby(name string) Lobby {
  return Lobby {
    Name: name,
    Users: []*UserSession {},
    IsPublic: true,
  }
}

// ChannelName - returns the socketio channel name for events pertaining to this lobby
func (lobby *Lobby) ChannelName() string {
  return ChannelLobbyPrefix + lobby.Name
}

// AddUser - adds the user to this channel
func (lobby *Lobby) AddUser(user *UserSession) {
  // add the user to the channel
  if user.Lobby != nil {
    user.Lobby.RemoveUser(user)
  }

  (*user.Socket).Join(lobby.ChannelName())
  lobby.Users = append(lobby.Users, user)
  user.Lobby = lobby
}

// RemoveUser - removes the user from this channel
func (lobby *Lobby) RemoveUser(toRemove *UserSession) {
  // unsubscribe the user from the channel
  (*toRemove.Socket).Leave(lobby.ChannelName())

  // remove the user from lobby.Users
  for index, user := range lobby.Users {
    if user == toRemove {
      lobby.Users[index] = lobby.Users[len(lobby.Users) - 1]
      lobby.Users = lobby.Users[:len(lobby.Users) - 1]
    }
  }

  toRemove.Lobby = nil

  if len(Users) == 0 {
    // cleanup the lobby and tear down
    lobby.Cleanup()
  }
}

// BroadcastChange the changes to the channel's state
func (lobby *Lobby) BroadcastChange() {
  if lobby.IsPublic {
    // notify public lobby listing that the channel info changed
    Server.BroadcastTo(ChannelLobbyList, EventLobbyInfoUpdate, JSONStringify(lobby))
  }
  Server.BroadcastTo(lobby.ChannelName(), EventLobbyInfoUpdate, JSONStringify(lobby))
}

// Cleanup the channel
func (lobby *Lobby) Cleanup() {
  // remove all users from the lobby
  for _, user := range lobby.Users {
    lobby.RemoveUser(user)
  }
  lobby.BroadcastChange()

  // delete the lobby from the global lobbies list.
  delete(Lobbies, lobby.Name)
}
