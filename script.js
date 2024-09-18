const settingsIcon = document.getElementById('settings-icon');
const settingsPanel = document.getElementById('settings-panel');
const backButton = document.getElementById('back-button');
const micIcon = document.getElementById('mic-icon');
const videoIcon = document.getElementById('video-icon');
const user1Video = document.getElementById('user1-video'); // Your video
const user2Video = document.getElementById('user2-video'); // Placeholder for User 2

// WebSocket connection
const socket = new WebSocket('wss://befitting-snowy-appliance.glitch.me');
const peerConnection = new RTCPeerConnection();

socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.send(JSON.stringify({ answer }));
    } else if (message.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    } else if (message.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
};

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.send(JSON.stringify({ candidate: event.candidate }));
    }
};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        user1Video.srcObject = stream; // Show your video feed
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    })
    .catch(error => {
        console.error("Error accessing media devices:", error);
    });

peerConnection.ontrack = (event) => {
    user2Video.srcObject = event.streams[0];
};

// Create and send an offer
peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => socket.send(JSON.stringify({ offer: peerConnection.localDescription })));

settingsIcon.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
});

backButton.addEventListener('click', () => {
    settingsPanel.classList.remove('open');
});

// Toggle mic icon
micIcon.addEventListener('click', () => {
    micIcon.classList.toggle('active'); // Toggles the active class
    if (micIcon.classList.contains('active')) {
        micIcon.classList.remove('fa-microphone'); // Change to muted icon
        micIcon.classList.add('fa-microphone-slash');
    } else {
        micIcon.classList.remove('fa-microphone-slash'); // Change back to unmuted icon
        micIcon.classList.add('fa-microphone');
    }
});

// Toggle video icon
videoIcon.addEventListener('click', () => {
    videoIcon.classList.toggle('active'); // Toggles the active class
    if (videoIcon.classList.contains('active')) {
        videoIcon.classList.remove('fa-video'); // Change to video off icon
        videoIcon.classList.add('fa-video-slash');
    } else {
        videoIcon.classList.remove('fa-video-slash'); // Change back to video on icon
        videoIcon.classList.add('fa-video');
    }
});
