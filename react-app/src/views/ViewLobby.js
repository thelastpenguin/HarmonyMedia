import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {socket, lobbies} from '../state'

import VideoJS from './VideoJS'

import $ from "jquery";

const urlCache = {}

const processURL = (url, callback) => {
  // console.log(url)
  if (url.indexOf('https://drive.google.com/file/d/') !== -1) {
    return $.get('http://api.lastpengu.in/GdriveURL/api.php?url=' + encodeURIComponent(url), (data) => {
      callback(data)
    })
  }
  // NOTE: this is how to get the drive urls https://github.com/ArdiArtani/Google-Drive-Player-Scriptu
  callback(url)
}

const ChangeVideoWidget = (props) => {
  let url = ""
  const onChange = (event) => {
    url = event.target.value
  }

  return (
    <div className="videoPlayer">
      <div className="row" style={{marginTop: "100px"}}>
        <div className="col-lg-offset-3 col-lg-6">
          <div className="input-group">
            <span className="input-group-addon">URL</span>
            <input type="text" className="form-control" placeholder="http://youtube.com" onChange={onChange}/>
          </div>
          <br/>
          <div style={{float: 'right'}}>
          <button className="btn btn-primary" onClick={() => {processURL(url, props.setVideo)}}>Set Video</button>
          </div>
        </div>
      </div>
    </div>
  )
}

class ViewLobbyList extends Component {
  constructor(props) {
    super(props)

    // pseudo-state information
    this.lobby = lobbies[props.lobbyName]
    this.video = null

    this.state = {
      nosrc: true
    }

    const getSyncedTime = () => {
      if (this.video.paused)
        return this.video.lastPosition / 1000.0
      return ((new Date()).getTime() - this.video.lastUpdated + this.video.lastPosition) / 1000.0
    }

    const syncPlayer = () => {
      if (!this.video || !this.player) return

      if (this.video.paused !== this.player.paused()) {
        if (this.video.paused)
          this.player.pause()
        else
          this.player.play()
      }

      if (this.player.currentSrc() !== this.video.url) {
        this.player.src(this.video.url)
      }

      const time = getSyncedTime()
      if (Math.abs(this.player.currentTime() - time) > 0.2) {
        this.player.currentTime(time)
      }
    }

    this.lobbyUpdateInfoListener = () => {
      this.lobby = lobbies[props.lobbyName]
    }
    socket.on("lobbyUpdateInfo", this.lobbyUpdateInfoListener)

    this.canSendUpdate = true
    let timeoutCanSendUpdate = null
    this.videoUpdateInfoListener = (videoStr) => {
      this.canSendUpdate = false
      clearTimeout(timeoutCanSendUpdate)
      timeoutCanSendUpdate = setTimeout(() => {this.canSendUpdate = true}, 500)

      this.video = JSON.parse(videoStr)
      if (this.state.nosrc) {
        this.setState({
          nosrc: false
        })
      }
      syncPlayer()
      clearInterval(this.keepInSync)
      this.keepInSync = setInterval(syncPlayer, 2000)
    }
    socket.on("updateVideoInfo", this.videoUpdateInfoListener)

    socket.emit("requestVideoInfo")
  }

  componentWillUnmount() {
    socket.removeListener("lobbyUpdateInfo", this.lobbyUpdateInfoListener)
    socket.removeListener("updateVideoInfo", this.videoUpdateInfoListener)
    clearInterval(this.keepInSync)
  }

  render() {
    if (this.state.nosrc) {
      const setVideo = (url) => {
        socket.emit('updateVideoInfo', JSON.stringify({
          url: url,
          paused: false,
          lastUpdated: (new Date()).getTime(),
          lastPosition: 0
        }), (respStr) => {
          const respObj = JSON.parse(respStr)
          if (respObj.status === "error")
            alert(respObj.message)
        })
      }

      return (
        <ChangeVideoWidget
          setVideo={setVideo}
          />
      )
    }

    const videoJsOptions = {
      autoplay: true,
      controls: true,
    }

    let timeout = null

    const requestSync = () => {
      this.video = {
        url: this.player.currentSrc(),
        paused: this.player.paused(),
        lastUpdated: Math.round((new Date()).getTime()),
        lastPosition: Math.round(this.player.currentTime() * 1000),
      }
      socket.emit('updateVideoInfo', JSON.stringify(this.video), (respStr) => {
        const respObj = JSON.parse(respStr)
        if (respObj.status === "error") {
          alert(respObj.message)
        }
      })
    }

    const handler = (event) => {
      if (!this.canSendUpdate) return
      if(timeout)
        clearTimeout(timeout)
      timeout = setTimeout(() => {
        requestSync()
      }, 100)
    }

    const videoHooks = {
      onPlay: handler.bind(null, 'played'),
      onPause: handler.bind(null, 'paused'),
      onSeek: handler.bind(null, 'seek'),
    }

    return (
      <VideoJS ref={ node => { this.player = node }} videojs={videoJsOptions} {... videoHooks} />
    )
  }
}

export default ViewLobbyList
