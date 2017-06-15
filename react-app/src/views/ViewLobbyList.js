import React, { Component } from 'react';

import {socket, lobbies} from '../state'

class NewLobbyWidget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      password: ""
    }
  }

  onTextChangeName(event) {
    this.setState({
      name: event.target.value,
      password: this.state.password
    })
  }

  onTextChangePassword(event) {
    this.setState({
      name: this.state.name,
      password: event.target.value
    })
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-lg-offset-2 col-lg-4">
            <div className="input-group">
              <span className="input-group-addon">New Lobby Name</span>
              <input type="text" className="form-control input-sm" onChange={this.onTextChangeName.bind(this)} value={this.state.name} placeholder="Lobby name..."/>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="input-group">
              <span className="input-group-addon">Password</span>
              <input type="text" className="form-control input-sm" onChange={this.onTextChangePassword.bind(this)} value={this.state.password} placeholder="<blank for no lock>"/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-offset-2 col-lg-8">
            <button style={{float: 'right', marginTop: '5px'}} className="btn btn-sm btn-primary" type="button" onClick={this.props.createNewLobby.bind(null, this.state.name, this.state.password)}>Create!</button>
          </div>
        </div>
      </div>
    )
  }

}

class ViewLobbyList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      lobbies: lobbies,
    }

    this.lobbyUpdateInfoListener = () => {
      this.setState({
        lobbies: lobbies,
      })
    }
    socket.on("lobbyUpdateInfo", this.lobbyUpdateInfoListener)
  }

  componentWillUnmount() {
    socket.removeListener("lobbyUpdateInfo", this.lobbyUpdateInfoListener)
  }

  createNewLobby(lobbyName, shouldBePrivate) {
    this.props.createNewLobby(lobbyName, shouldBePrivate)
  }

  render() {
    let lobbies = Object.keys(this.state.lobbies)
    lobbies.sort()
    lobbies = lobbies.map((lobbyName) => {
      const lobby = this.state.lobbies[lobbyName]
      return (
        // TODO: add password support here
        <a className="list-group-item" key={lobbyName} href="#" onClick={this.props.onPickLobby.bind(null, lobbyName, "")}>
          <span className="badge">{lobby.users.length}</span>
          {lobbyName}
        </a>
      )
    })

    return (
      <div>
        <div className="well">
          Welcome! You will appear as <strong>{this.props.username}</strong> to
          your friends. Please select a lobby to join or click 'Create Lobby'
          to create a new media lobby.
        </div>

        <NewLobbyWidget
          createNewLobby={this.createNewLobby.bind(this)}
          />

        <div className="list-group">
          {lobbies}
        </div>

      </div>
    )
  }
}

export default ViewLobbyList
