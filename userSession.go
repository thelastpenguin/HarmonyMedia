package main

import (
  "github.com/googollee/go-socket.io"
)


// UserSession is a class defining a user session
type UserSession struct {
  Name string `json:"name"`
  Socket *socketio.Socket `json:"-"`
  Lobby *Lobby `json:"-"`
}

func newUserSession(name string, socket *socketio.Socket) UserSession {
  return UserSession {
    Name: name,
    Socket: socket,
    Lobby: nil,
  }
}

func (userSession* UserSession) cleanup() {
  if userSession.Lobby != nil {
    lby := userSession.Lobby
    userSession.Lobby.RemoveUser(userSession)
    lby.BroadcastChange()
  }
  delete(Users, userSession.Name)
}
