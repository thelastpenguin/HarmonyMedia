package main

// Video is a struct representing a video object
type Video struct {
  URL string `json:"url"`
  Paused bool `json:"paused"`
  LastUpdated int64 `json:"lastUpdated"`
  LastPosition int64 `json:"lastPosition"`
}

// Lobby is a class defining a lobby
type Lobby struct {
  Name string `json:"lobbyName"`
  Users []*UserSession `json:"users"`
  Password string `json:"-"`
  PlayingVideo *Video `json:"-"`
}

// NewLobby - create a new lobby with the given name
func NewLobby(name string, password string) Lobby {
  return Lobby {
    Name: name,
    Users: []*UserSession {},
    Password: password,
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

  // notify the user where we are in the video
  if lobby.PlayingVideo != nil {
    (*user.Socket).Emit(EventVideoUpdate, JSONStringify(lobby.PlayingVideo))
  }
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

  if len(lobby.Users) == 0 {
    // cleanup the lobby and tear down
    lobby.Cleanup()
  }
}

// UpdateVideo update the video yep yep
func (lobby *Lobby) UpdateVideo(video Video) {
  lobby.PlayingVideo = &video
  // log.Printf("Broadcasting to %v values: %v\n", lobby.ChannelName(), JSONStringify(video))
  Server.BroadcastTo(lobby.ChannelName(), EventVideoUpdate, JSONStringify(video))
}

// BroadcastChange the changes to the channel's state
func (lobby *Lobby) BroadcastChange() {
  Server.BroadcastTo(ChannelLobbyList, EventLobbyInfoUpdate, JSONStringify(lobby))
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
