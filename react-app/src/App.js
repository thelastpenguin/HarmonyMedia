import React, { Component } from 'react';

import logo from './logo.svg';
import {
  VIEW_LOGIN,
  VIEW_LOBBY,
  VIEW_LOBBY_LIST
} from "./constants"

import ViewLogin from './views/ViewLogin'
import ViewLobbyList from './views/ViewLobbyList'

import {socket, lobbies} from './state'

const PageTemplate = (props) => {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Harmony TV <small> a lastpenguin production</small></h1>
      </div>
      <div>
        {props.children}
      </div>
    </div>
  )
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: null,
      currentView: VIEW_LOGIN,
    }
  }

  changeView(newView) {
    this.state.currentView = newView
    if (newView !== VIEW_LOGIN)
      this.state.lobbies = null
    else
      this.state.lobbies = lobbies

    this.setState(this.state)
  }

  renderLogin() {
    // HANDLE THE LOGIN VIEW
    const onLogin = (username) => {
      socket.emit("authenticate", JSON.stringify({
        name: username,
      }), (resp) => {
        const respObj = JSON.parse(resp)
        if (respObj.status === "error") {
          alert(respObj.message)
        } else {
          this.state.authenticated = {
            status: "ok",
            username: username
          }
          this.changeView(VIEW_LOBBY_LIST)
        }
        this.setState(this.state)
      })
    }

    const view = (
        <ViewLogin
          onLogin={onLogin}
          />
      )
    return (
      <PageTemplate> {view} </PageTemplate>
    )
  }

  renderLobbyList() {
    const onPickLobby = (lobbyName) => {
      console.log(lobbyName)
    }

    const createNewLobby = (lobbyName, isPrivate) => {
      socket.emit("joinLobby", JSON.stringify({
        lobbyName: lobbyName,
        isPrivate: isPrivate
      }), (respTxt) => {
        const respObj = JSON.parse(respTxt)
        if (respObj.status === "error") {
          return alert(respObj.message)
        }
        this.state.inLobby = respObj.lobbyName
        this.setState(this.state)
        this.changeView(VIEW_LOBBY)
      })
    }

    return (
      <PageTemplate>
        <ViewLobbyList
          onPickLobby={onPickLobby}
          createNewLobby={createNewLobby}
          username={this.state.authenticated.username}/>
      </PageTemplate>
    )
  }

  render() {
    if (this.state.currentView === VIEW_LOGIN) {
      return this.renderLogin()
    } else if (this.state.currentView === VIEW_LOBBY_LIST) {
      return this.renderLobbyList()
    }

    return (
      <h1>Unknown State: {this.state.currentView}</h1>
    )
  }
}

export default App;
