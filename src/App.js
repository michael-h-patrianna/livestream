import './App.css';
import React, { useEffect, useRef } from "react";
import { Stream } from "@cloudflare/stream-react";

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log('Environment variables:');
    console.log('STREAM_RTMP_URL:', process.env.REACT_APP_STREAM_RTMP_URL);
    console.log('STREAM_RTMP_PLAYBACK_KEY:', process.env.REACT_APP_STREAM_RTMP_PLAYBACK_KEY);

    // WebRTC implementation
    const WHEPURL = process.env.REACT_APP_STREAM_WEBRTC_PLAYBACK_URL;
   
    class WHEPClient {
      constructor(endpoint, videoElement) {
        this.endpoint = endpoint;
        this.videoElement = videoElement;
        this.stream = new MediaStream();
        this.peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.cloudflare.com:3478" },
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
      
          ],
          bundlePolicy: "max-bundle",
          iceCandidatePoolSize: 1
        });

        this.peerConnection.addTransceiver("video", { direction: "recvonly" });
        this.peerConnection.addTransceiver("audio", { direction: "recvonly" });

        window.addEventListener('beforeunload', () => {
          if (this.peerConnection) {
            this.peerConnection.close();
          }
        });

        this.peerConnection.ontrack = (event) => {
          const track = event.track;
          const currentTracks = this.stream.getTracks();
          const streamAlreadyHasVideoTrack = currentTracks.some(
            (track) => track.kind === "video"
          );
          const streamAlreadyHasAudioTrack = currentTracks.some(
            (track) => track.kind === "audio"
          );

          if ((track.kind === "video" && !streamAlreadyHasVideoTrack) ||
              (track.kind === "audio" && !streamAlreadyHasAudioTrack)) {
            this.stream.addTrack(track);
          }
        };

        this.peerConnection.addEventListener("connectionstatechange", () => {
          if (this.peerConnection.connectionState === "connected" && !this.videoElement.srcObject) {
            this.videoElement.srcObject = this.stream;
          }
        });

        this.peerConnection.addEventListener("negotiationneeded", () => {
          this.negotiateConnectionWithClientOffer();
        });

        this.negotiateConnectionWithClientOffer();
      }

      async negotiateConnectionWithClientOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        const ofr = await this.waitToCompleteICEGathering();
        
        if (!ofr) {
          throw Error("failed to gather ICE candidates for offer");
        }

        while (this.peerConnection.connectionState !== "closed") {
          try {
            const response = await this.postSDPOffer(ofr.sdp);
            if (response.status === 201) {
              const answerSDP = await response.text();
              await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription({ type: "answer", sdp: answerSDP })
              );
              return;
            } else if (response.status === 405) {
              console.error("Update the URL passed into the WHIP or WHEP client");
            } else {
              const errorMessage = await response.text();
              console.error(errorMessage);
            }
          } catch (error) {
            console.error("Error during negotiation:", error);
          }
          await new Promise((r) => setTimeout(r, 5000));
        }
      }

      async postSDPOffer(data) {
        return fetch(this.endpoint, {
          method: "POST",
          mode: "cors",
          headers: { "content-type": "application/sdp" },
          body: data,
        });
      }

      async waitToCompleteICEGathering() {
        return new Promise((resolve) => {
          setTimeout(() => resolve(this.peerConnection.localDescription), 1000);
          this.peerConnection.onicegatheringstatechange = () => {
            if (this.peerConnection.iceGatheringState === "complete") {
              resolve(this.peerConnection.localDescription);
            }
          };
        });
      }
    }

    if (videoRef.current && WHEPURL) {
      new WHEPClient(WHEPURL, videoRef.current);
    }
  }, []);

  // RTMP
  const videoIdOrSignedToken = process.env.REACT_APP_STREAM_RTMP_LIVE_INPUT_ID;
  const iframeURL = "https://customer-" + process.env.REACT_APP_STREAM_CUSTOMER_ID + ".cloudflarestream.com/" + process.env.REACT_APP_STREAM_RTMP_LIVE_INPUT_ID + "/iframe";
 const placeholderImageUrl = "https://via.placeholder.com/960x540.png?text=Stream+Not+Started";

  if (!videoIdOrSignedToken) {
    return <div className="App">Error: Stream Playback Key not found in environment variables.</div>;
  }

  return (
    <div className="App">
      <h2>Iframe RTMP</h2>
      <div style={{position: 'relative', paddingTop: '56.25%'}}>
        <iframe
          title='Iframe RTMP'
          src={iframeURL}
          style={{
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%'
          }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <h2>React RTMP Player</h2>
      <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
        <Stream
          controls
          src={videoIdOrSignedToken}
          responsive={true}
          aspectRatio="16:9"
          poster={placeholderImageUrl}
        />
      </div>

      <h2>WebRTC Stream</h2>
      <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
        <video ref={videoRef} controls autoPlay muted style={{ width: '100%' }}></video>
      </div>
    </div>
  );
}

export default App;