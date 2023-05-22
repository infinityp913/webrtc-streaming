// TODO: pipe remote_stream to file IN THE CALLING LOGIC
const mediaRecorder = new MediaRecorder(remote_stream, {
  audioBitsPerSecond: 16000, // whisper neeeds 16K samplerate
});
mediaRecorder.ondataavailable = handleDataAvailable;
mediaRecorder.start();
showConnectedContent();
setTimeout((event) => {
  console.log("stopping");
  mediaRecorder.stop();
}, 15000);

// helper to capture the remote_stream and call download() helper func
function handleDataAvailable(event) {
  console.log("data-available");
  if (event.data.size > 0) {
    console.log("Event.data is more than zero!");
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();
  } else {
    console.log("Event.datasize <= 0");
  }
}

// helper fucntion to download stream
function download() {
  const blob = new Blob(recordedChunks);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test.wav";
  a.click();
  window.URL.revokeObjectURL(url);
}
