import React, { Component } from 'react';

import {socket, lobbies} from '../state'

class NewLobbyWidget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: "",
      private: false
    }
  }

  onTextChange(event) {
    this.setState({
      text: event.target.value,
      private: this.state.private
    })
  }

  onCheckboxChange(event) {
    this.setState({
      text: this.state.text,
      private: event.target.checked
    })
  }

  render() {
    return (
      <div className="input-group">
        <span className="input-group-addon">New Lobby Name</span>

        <input type="text" className="form-control" onChange={this.onTextChange.bind(this)} value={this.state.text} placeholder="Lobby name..."/>

        <span className="input-group-addon">Private?</span>

        <span className="input-group-addon">
          <input type="checkbox" onChange={this.onCheckboxChange.bind(this)} value={this.state.private} aria-label="Visible"/>
        </span>

        <span className="input-group-btn">
          <button className="btn btn-primary" type="button" onClick={this.props.createNewLobby.bind(null, this.state.text, this.state.private)}>Create!</button>
        </span>
      </div>
    )
  }

}

class ViewLobbyList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      lobbies: lobbies,
      createLobbyName: "",
    }

    this.lobbyUpdateInfoListener = () => {
      this.setState({
        createLobbyName: this.state.createLobbyName,
        lobbies: lobbies,
      })
    }
    socket.on("lobbyUpdateInfo", this.lobbyUpdateInfoListener)
  }

  componentWillUnmount() {
    socket.removeListener("lobbyUpdateInfo", this.lobbyUpdateInfoListener)
  }

  createNewLobby(lobbyName, shouldBePrivate) {
    console.log(lobbyName, shouldBePrivate)
    this.props.createNewLobby(lobbyName, shouldBePrivate)
  }

  render() {
    let lobbies = Object.keys(this.state.lobbies)
    lobbies.sort()
    lobbies = lobbies.map((lobbyName) => {
      const lobby = this.state.lobbies[lobbyName]
      return (
        <li className="list-group-item" key={lobbyName}>
          <span className="badge">{lobby.users.length}</span>
          {lobbyName}
        </li>
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

        <ul className="list-group">
          {lobbies}
        </ul>

      </div>
    )
  }
}

export default ViewLobbyList
