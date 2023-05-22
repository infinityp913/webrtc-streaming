// Node JS code to accept the stream

const { ExpressPeerServer } = require("peer");
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || "8000";
server = app.listen(port, () => {
  console.log("server listening at " + port);
});

const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/webrtc-test",
  ssl: {}, // pass in key and cert to ssl dictionary
});

app.use("/peerjs", peerServer);

app.use(express.static(path.join(__dirname)));

app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/webrtc-demo.html`);
});

// OBSOLETE: now using PeerJS
// let peerConfiguration = {};

// (async () => {
//   const response = await fetch(
//     "https://matherium.metered.live/api/v1/turn/credentials?apiKey=138fc64d454a71ed6ba214fdca0ce0fcf5b0"
//   );
//   const iceServers = await response.json();
//   peerConfiguration.iceServers = iceServers;
// })();

// const myPeerConnection = new RTCPeerConnection(peerConfiguration);

/**
 *
 * @param {MediaStream} stream
 * Buffering incoming WebRTC stream using WebAudio API (AudioContext, AudioBuffer, MediaStreamSource)
 */
// source: https://stackoverflow.com/questions/48975585/how-to-process-the-audio-from-webrtc
SAMPLE_RATE = 16000;
BUFF_LENGTH = 30; // create a buffer to store 30s of audio

// function to start buffering the remote stream

const startBuffer = function (audioCtx, audioBuffer, source) {
  // source.connect(audioBuffer); // connect() didin't work (overload resolution failure)
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination); // this sends the audio to speakers (the default destination)
  // const floatBufferArr = audioBuffer.getChannelData(0);
  // return floatBufferArr;

  // TODO: send audio stream to buffer and switch when it fills
  // when you swithc, change the global buffer index
};

const bufferStream = async function (stream) {
  resolved_stream = await stream;
  if (resolved_stream.getAudioTracks().length > 0) {
    console.log("TEST: audio tracks > 0!");
    // If voice is detected start buffering

    const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE }); //Specify sample rate, otherwise "the new context's output device's preferred sample rate is used by default."

    const buffer1 = audioCtx.createBuffer(
      2,
      BUFF_LENGTH * SAMPLE_RATE,
      SAMPLE_RATE
    ); //createBuffer(numOfChannels, length, sampleRate)

    const buffer2 = audioCtx.createBuffer(
      2,
      BUFF_LENGTH * SAMPLE_RATE,
      SAMPLE_RATE
    ); //createBuffer(numOfChannels, length, sampleRate)

    let curr_buffer_idx = 1;
    let curr_buffer = null;
    // typeof(src) = MediaStreamAudioSourceNode (a type of AudioNode which operates as an audio source whose media is received from a MediaStream obtained using the WebRTC API)
    // not using AudioBufferSourceNode as in AudioBuffer mdn doc's example, because MediaStreamSource is for WebRTC
    const mediaStreamSource = audioCtx.createMediaStreamSource(stream); // not using createMediaStreamTrackSource because it's not supported on most browsers (error said X is not a function)

    let floatBufferArr = [];
    const VAD = require("vad").VAD;
    const vad = new VAD(VAD.MODE_NORMAL);

    // check for voice (speech) in the stream
    vad.on("voice", function () {
      console.log("Voice detected!");
      curr_buffer = curr_buffer_idx == 1 ? buffer1 : buffer2; // determine which buffer to use based on the index
      startBuffer(audioCtx, curr_buffer, mediaStreamSource);
    });

    //TODO: poll for buffer filling, is there an event to listen for?
    // there's an onend event with callback. thats for when the buffer stops playing

    // check for a silence break in speech, if so stop buffering
    vad.on("silence", function () {
      console.log("Silence detected!");
      // Check if a 3s silence period is hit, if so stop buffering and pass on to processing function

      setTimeout(() => {
        console.log("Silence detected after 3s!");
        curr_buffer_idx = curr_buffer_idx == 1 ? 2 : 1; //
        floatBufferArr = curr_buffer.getChannelData(0);
      }, 3000);

      // commented the following out since we'd have to keep calling it in loop until 3s were hit
      // var start = process.hrtime();
      // var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    });

    // if needed, try out downloading the buffer: (in download-wav-buffer.js)

    // audioBuffer.connect(audioCtx.destination);
    // TODO: change createMediatStreamSource to constructor
  }
};

// If we need to execute whisper cpp via bash, how to execute bash commands in js: https://stackoverflow.com/questions/1880198/how-to-execute-shell-command-in-javascript

// Processing function: takes audio stream input, passes to whisper,
// then the text output of whisper is passed to dialogflow (this contains the FAQNet
//  and the TTS Net).
// output is response in audio form (TODO: determine what format)

function process_stream() {
  return;
}
