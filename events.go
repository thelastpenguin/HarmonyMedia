package main

// ChannelLobbyList - the channel for receiving lists of lobbies
const ChannelLobbyList = "lobbylist"
// ChannelLobbyPrefix - the prefix to use for lobby channels
const ChannelLobbyPrefix = "lobby-"
// EventLobbyInfoUpdate - event sent when a lobby is either created or updated
const EventLobbyInfoUpdate = "lobbyUpdateInfo"
// EventVideoUpdate - event emitted when the video info gets updated (sent to all clients in the channel)
const EventVideoUpdate = "updateVideoInfo"
// RequestAuthenticate - request received when a user wants to update their username information
const RequestAuthenticate = "authenticate"
// RequestJoinLobby - request received when a user wants to join a lobby
const RequestJoinLobby = "joinLobby"
// RequestEnterLobbyList - request to subscribe to new lobbies & get a list of all the currently registered lobbies
const RequestEnterLobbyList = "enterLobbyList"
// RequestUpdateVideo - a request to update the video positon for the user's current lobby
const RequestUpdateVideo = "updateVideoInfo"
// RequestVideoInfo ask the server to dispatch an EventVideoUpdate packet to the sender
const RequestVideoInfo = "requestVideoInfo"
// RequestURLTransform
const RequestURLTransform = "requestURLTransform"
