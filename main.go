package main

import (
  "log"
  "net/http"
  "encoding/json"
  "strings"

  "github.com/googollee/go-socket.io"
)

// Lobbies foobar.
var Lobbies map[string]*Lobby
// Users users
var Users map[string]*UserSession
// Server the socketio server connection. Use to broadcast to the whole app.
var Server *socketio.Server

func main() {
  var err error
  Server, err = socketio.NewServer(nil)
  if err != nil {
    log.Fatal(err)
  }

  Lobbies = make(map[string]*Lobby)
  Users = make(map[string]*UserSession)

  Server.On("connection", func(so socketio.Socket) {
    log.Println("on connection")

    var userSession *UserSession

    // handle request to initialize connection
    so.On(RequestAuthenticate, func(authenticateReqStr string) string {
      if userSession != nil {
        return JSONStringify((StatusMessage {Status: "error", Message: "Already authenticated. Close and reinitialize your connection to change username."}))
      }

      type AuthenticateReq struct {
        Name string `json:"name"`
      }

      authenticateReq := AuthenticateReq {}
      if err := json.Unmarshal([]byte(authenticateReqStr), &authenticateReq); err != nil {
        log.Println("bad request.")
        return JSONStringify(StatusMessage {Status: "error", Message: "Malformatted JSON Object."})
      }

      authenticateReq.Name = strings.TrimSpace(authenticateReq.Name)
      if (len(authenticateReq.Name) < 3 || len(authenticateReq.Name) > 25) {
        return JSONStringify(StatusMessage {Status: "error", Message: "Name must be more than 3 characters and less than 25."})
      }

      if _, found := Users[authenticateReq.Name]; found {
        return JSONStringify(StatusMessage {Status: "error", Message: "oops. This name is taken."})
      }

      newUserSession := newUserSession(authenticateReq.Name, &so)
      userSession = &newUserSession
      Users[userSession.Name] = userSession

      log.Printf("Authenticated %v\n", authenticateReq)

      return JSONStringify(StatusMessage {Status: "ok", Message: "successfully updated profile."})
    })

    // handle request to join a lobby
    so.On(RequestJoinLobby, func(requestStr string) string {
      if userSession == nil {
        return JSONStringify(StatusMessage {Status: "error", Message:"please authenticate before trying to join a lobby."})
      }

      type JoinLobbyReq struct {
        LobbyName string `json:"lobbyName"`
      }
      request := JoinLobbyReq {}
      if err := json.Unmarshal([]byte(requestStr), &request); err != nil {
        return JSONStringify(StatusMessage {Status: "error", Message: "Malformatted JSON Object."})
      }

      request.LobbyName = strings.TrimSpace(request.LobbyName)

      // check lobby name is valid
      if len(request.LobbyName) < 3 && len(request.LobbyName) < 25 {
        return JSONStringify(StatusMessage {Status: "error", Message: "lobby name must be longer than 3 characters and less than 25."})
      }

      // create the lobby if it does not exist.
      if _, found := Lobbies[request.LobbyName]; !found {
        log.Printf("Lobby %v did not exist. Creating lobby %v.\n", request.LobbyName, request.LobbyName)
        newLobby := NewLobby(request.LobbyName)
        Lobbies[request.LobbyName] = &newLobby
      }

      // join the lobby
      lobby := Lobbies[request.LobbyName]
      log.Printf("User %v joined lobby %v\n", userSession.Name, lobby.Name)

      lobby.AddUser(userSession)
      lobby.BroadcastChange()

      // leave the lobby list channel since we are no longer looking for a new lobby!
      so.Leave(ChannelLobbyList)

      return JSONStringify(lobby)
    })

    so.On(RequestEnterLobbyList, func(payload string) {
      // now we send a list of the lobbies to the newly authenticated client.
      so.Join(ChannelLobbyList)
      for _, lby := range Lobbies {
        if lby.IsPublic {
          so.Emit(EventLobbyInfoUpdate, JSONStringify(lby))
        }
      }
    })

    so.On("disconnection", func() {
      log.Println("disconnected.")
      if userSession != nil {
        userSession.cleanup()
      }
    })
  })

  Server.On("error", func(so socketio.Socket, err error) {
    log.Println("error:", err)
  })

  http.HandleFunc("/socket.io/", func(w http.ResponseWriter, req *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", req.Header.Get("Origin"))
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, X-CSRF-Token")
    w.Header().Set("Access-Control-Allow-Credentials", "true")
    Server.ServeHTTP(w, req)
  })
  // http.Handle("/socket.io/", Server)
  http.Handle("/", http.FileServer(http.Dir("./asset")))
  log.Println("Serving at localhost:5000...")
  log.Fatal(http.ListenAndServe(":5000", nil))
}
