import React from 'react';
import ReactDOM from 'react-dom'
import WaveSurfer from 'wavesurfer.js'
import { Button, Loader, Segment, Dimmer, Label } from 'semantic-ui-react'
import {API} from 'aws-amplify';
import moment from 'moment';

var fileDownload = require('js-file-download');
const axios = require('axios');
var Url = require('url-parse');

class Player extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playDisabled: false,
            pauseDisabled: true,
            loadedRecording: null,
            sessionId: null,
            isLoading: false,
            presignedURL: null,
            audioDuration: '0:00',
            audioCurrent: '0:00'
        }
    }

    handleMe() {
        this.wavesurfer.play()
    }

    componentDidUpdate() {
        const {sessionId} = this.props

        if (sessionId !== undefined && sessionId != null) {
            if (this.props.sessionId !== this.state.sessionId) {
                this.setState({sessionId: this.props.sessionId, isLoading: true})
                
                this.getRecordingURL(this.props.sessionId)
            }
        }
        else if (this.state.presignedURL != null) {
            let silence = window.location.protocol + '//' + window.location.host + "/silence.wav"
            
            this.wavesurfer.load(silence)
            this.setState({presignedURL: null})
        }
    }

    getRecordingURL = async (sessionId) => {
        var apiQS = {
            queryStringParameters: {
                id: sessionId
            }
        }

        await API.get('connectapi', '/url', apiQS)
        .then((response) => {
            if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
                console.log("Recording pre-signed URL: ", response)
            }

            this.wavesurfer.load(response)
            this.setState({presignedURL: response})
        })
    }

    componentDidMount() {
        var ctx = document.createElement('canvas').getContext('2d');
        var linGrad = ctx.createLinearGradient(0, 64, 0, 200);
        linGrad.addColorStop(0.5, 'rgba(150, 150, 150, 1.000)');
        linGrad.addColorStop(0.5, 'rgba(183, 183, 183, 1.000)');

        this.$el = ReactDOM.findDOMNode(this)
        this.$waveform = this.$el.querySelector('.wave')
        this.wavesurfer = WaveSurfer.create({
            container: this.$waveform,
            waveColor: linGrad,
            progressColor: 'hsla(200, 100%, 30%, 0.5)',
            cursorColor: '#fff',
            barWidth: 3,
            splitChannels: true
        })

        this.wavesurfer.on('play', () => this.setState({playDisabled: true, pauseDisabled: false}))
        this.wavesurfer.on('finish', () => this.setState({playDisabled: false, pauseDisabled: true}))
        this.wavesurfer.on('pause', () => this.setState({playDisabled: false, pauseDisabled: true}))
        this.wavesurfer.on('ready', () => this.updateCounters())
        this.wavesurfer.on('seek', () => this.updateCounters())

        this.wavesurfer.on('audioprocess', () => {
            if (this.wavesurfer.isPlaying) {
                var currentTime = this.wavesurfer.getCurrentTime()

                var cd = moment.duration(currentTime, 'seconds')
                var _cd = moment.utc(cd.asMilliseconds()).format('m:ss');

                if (_cd !== this.state.audioCurrent) {this.setState({audioCurrent: _cd})}
            }
        })
    }

    updateCounters() {
        var currentTime = this.wavesurfer.getCurrentTime(),
            totalTime = this.wavesurfer.getDuration()

        var cd = moment.duration(currentTime, 'seconds')
        var _cd = moment.utc(cd.asMilliseconds()).format('m:ss');

        var td = moment.duration(totalTime, 'seconds')
        var _td = moment.utc(td.asMilliseconds()).format('m:ss');

        if (_td !== this.state.audioDuration) {this.setState({audioDuration: _td})}
        if (_cd !== this.state.audioCurrent) {this.setState({audioCurrent: _cd})}

        this.setState({isLoading: false})
    }

    handleDownload(url) {
        var _url = new Url(url);
        var fileName = _url.pathname.substring(_url.pathname.lastIndexOf('/') + 1)

        axios.get(url, { responseType: 'arraybuffer' }).then((res) => { 
            fileDownload(res.data, fileName, "application/octet-stream");})
    }
    
    render() {
        const {isLoading} = this.state
        
        return (
            <Segment basic>
                <Dimmer active={isLoading}>
                    <Loader active={isLoading} inline='centered'>Loading audio...</Loader>
                </Dimmer>

                <div className='waveform'>
                    <div className='wave'></div>
                    <Segment basic floated='left'>
                        <Label content={this.state.audioCurrent} icon="clock outline"/>
                    </Segment>
                    <Segment basic floated='right' fluid='true'>
                        <Label content={this.state.audioDuration} icon="clock"/>
                    </Segment>
                </div>

                <Button.Group labeled icon fluid>
                    <Button icon='play' content='Play' color="green" disabled={this.state.playDisabled} onClick={() => {this.wavesurfer.play()}}/>
                    <Button icon='pause' content='Pause' color="red" style={{marginLeft: '1em'}} disabled={this.state.pauseDisabled} onClick={() => {this.wavesurfer.pause()}} />
                </Button.Group>
                <Button fluid icon='download' style={{marginTop: '1em'}} content='Download Recording' color="blue" onClick={() => this.handleDownload(this.state.presignedURL)} />
            </Segment>
        )
    }
}

export default Player