import React from 'react';
import videojs from 'video.js'

export default class VideoPlayer extends React.Component {
  componentDidMount() {
    this.player = videojs(this.videoNode, this.props.videojs, function onPlayerReady() {
    });

    this.ignoreEvents = 1
    this.player.on('play', () => {
      if (this.ignoreEvents > 0) {
        this.ignoreEvents--
        return
      }
      this.props.onPlay(this.player.currentTime())
    })
    this.player.on('pause', () => {
      if (this.ignoreEvents > 0) {
        this.ignoreEvents--
        return
      }
      this.props.onPause(this.player.currentTime())
    })
    this.player.on('seeked', () => {
      if (this.ignoreEvents > 0) {
        this.ignoreEvents--
        return
      }
      this.props.onSeek(this.player.currentTime())
    })
  }

  play() {
    this.ignoreEvents++
    this.player.play()
  }

  pause() {
    this.ignoreEvents++
    this.player.pause()
  }

  currentSrc() {
    return this.player.currentSrc()
  }

  src(src) {
    this.player.src({type: "video/mp4", src: src})
  }

  paused() {
    return this.player.paused()
  }

  currentTime(time) {
    if (time !== undefined && time !== null) {
      this.ignoreEvents++
    }
    return this.player.currentTime(time)
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    const onRef = node => {
      this.videoNode = node
    }

    return (
      <div data-vjs-player className="videoPlayer">
        <video ref={ onRef } className="video-js"></video>
      </div>
    )
  }
}
