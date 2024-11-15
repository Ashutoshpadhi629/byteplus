import VERTC, { MediaType, StreamIndex } from '@byteplus/rtc';

export default class RtcClient {
  constructor(props) {
    this.config = props.config;
    this.streamOptions = props.streamOptions;
    this.engine = VERTC.createEngine(props.config.appId);
    this.handleUserPublishStream = props.handleUserPublishStream;
    this.handleUserUnpublishStream = props.handleUserUnpublishStream;
    this.handleUserStartVideoCapture = props.handleUserStartVideoCapture;
    this.handleUserStopVideoCapture = props.handleUserStopVideoCapture;
    this.handleEventError = props.handleEventError;
    this.setRemoteVideoPlayer = this.setRemoteVideoPlayer.bind(this);
    this.handleUserJoin = props.handleUserJoin;
    this.handleUserLeave = props.handleUserLeave;
    this.handleAutoPlayFail = props.handleAutoPlayFail;
    this.handlePlayerEvent = props.handlePlayerEvent;
    this.bindEngineEvents();
  }
  SDKVERSION = VERTC.getSdkVersion();
  bindEngineEvents() {
    this.engine.on(VERTC.events.onUserPublishStream, this.handleUserPublishStream);
    this.engine.on(VERTC.events.onUserUnpublishStream, this.handleUserUnpublishStream);
    this.engine.on(VERTC.events.onUserStartVideoCapture, this.handleUserStartVideoCapture);
    this.engine.on(VERTC.events.onUserStopVideoCapture, this.handleUserStopVideoCapture);

    this.engine.on(VERTC.events.onUserJoined, this.handleUserJoin);
    this.engine.on(VERTC.events.onUserLeave, this.handleUserLeave);
    this.engine.on(VERTC.events.onAutoplayFailed, (events) => {
      console.log('VERTC.events.onAutoplayFailed', events.userId);
      this.handleAutoPlayFail(events);
    });
    this.engine.on(VERTC.events.onPlayerEvent, this.handlePlayerEvent);
    this.engine.on(VERTC.events.onError, (e) => this.handleEventError(e, VERTC));
  }
  async setRemoteVideoPlayer(remoteUserId, domId) {
    await this.engine.setRemoteVideoPlayer(StreamIndex.STREAM_INDEX_MAIN, {
      userId: remoteUserId,
      renderDom: domId,
    });
  }
  /**
   * remove the listeners when `createEngine`
   */
  removeEventListener() {
    this.engine.off(VERTC.events.onUserPublishStream, this.handleStreamAdd);
    this.engine.off(VERTC.events.onUserUnpublishStream, this.handleStreamRemove);
    this.engine.off(VERTC.events.onUserStartVideoCapture, this.handleUserStartVideoCapture);
    this.engine.off(VERTC.events.onUserStopVideoCapture, this.handleUserStopVideoCapture);
    this.engine.off(VERTC.events.onUserJoined, this.handleUserJoin);
    this.engine.off(VERTC.events.onUserLeave, this.handleUserLeave);
    this.engine.off(VERTC.events.onAutoplayFailed, this.handleAutoPlayFail);
    this.engine.off(VERTC.events.onPlayerEvent, this.handlePlayerEvent);
    this.engine.off(VERTC.events.onError, this.handleEventError);
  }
  join(token, roomId, uid) {
    return this.engine.joinRoom(
      token,
      roomId,
      {
        userId: uid,
      },
      {
        isAutoPublish: true,
        isAutoSubscribeAudio: true,
        isAutoSubscribeVideo: true,
      }
    );
  }
  // check permission of browser
  checkPermission() {
    return VERTC.enableDevices();
  }
  /**
   * get the devices
   * @returns
   */
  async getDevices() {
    const devices = await VERTC.enumerateDevices();

    return {
      audioInputs: devices.filter((i) => i.deviceId && i.kind === 'audioinput'),
      videoInputs: devices.filter((i) => i.deviceId && i.kind === 'videoinput'),
    };
  }
  /**
   * create the local stream with the config and publish the local stream
   * @param {*} callback
   */
  async createLocalStream(userId, callback) {
    const devices = await this.getDevices();
    const devicesStatus = {
      video: 1,
      audio: 1,
    };
    if (!devices.audioInputs.length && !devices.videoInputs.length) {
      callback({
        code: -1,
        msg: 'Failed to enumerate devices.',
        devicesStatus: {
          video: 0,
          audio: 0,
        },
      });
      return;
    }
    if (this.streamOptions.audio && devices.audioInputs.length) {
      await this.engine.startAudioCapture(devices.audioInputs[0].deviceId);
    } else {
      devicesStatus['video'] = 0;
      this.engine.unpublishStream(MediaType.AUDIO);
    }
    if (this.streamOptions.video && devices.videoInputs.length) {
      await this.engine.startVideoCapture(devices.videoInputs[0].deviceId);
    } else {
      devicesStatus['audio'] = 0;
      this.engine.unpublishStream(MediaType.VIDEO);
    }

    this.engine.setLocalVideoPlayer(StreamIndex.STREAM_INDEX_MAIN, {
      renderDom: 'local-player',
      userId,
    });

    this.engine.publishStream(MediaType.AUDIO_AND_VIDEO);

    callback &&
      callback({
        code: 0,
        msg: 'Failed to enumerate devices.',
        devicesStatus,
      });
  }

  async changeAudioState(isMicOn) {
    if (isMicOn) {
      await this.engine.publishStream(MediaType.AUDIO);
    } else {
      await this.engine.unpublishStream(MediaType.AUDIO);
    }
  }

  async changeVideoState(isVideoOn) {
    if (isVideoOn) {
      await this.engine.startVideoCapture();
    } else {
      await this.engine.stopVideoCapture();
    }
  }

  async leave() {
    this.engine.stopVideoCapture();
    this.engine.stopAudioCapture();
    this.engine.unpublishStream(MediaType.AUDIO);
    this.engine.leaveRoom();
    // VERTC.destroyEngine(this.engine);
  }
}
