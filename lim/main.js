'use strict';


var startButton = document.getElementById('startButton');
var connectButton = document.getElementById('connectButton');
var disconnectButton = document.getElementById('disconnectButton');

startButton.onclick = onStart;
startButton.disabled = false;

connectButton.onclick = onConnect;
connectButton.disabled = true;

disconnectButton.onclick = onDisconnect;
disconnectButton.disabled = true;

var startTime;

var video = document.querySelector('video');
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
    // on loadedmetadata
    trace('LocalVideo: width:' + this.videoWidth + '-px,height' + this.videoHeight + '-px');
    console.log('video(Local): The Meta Data is known and loaded');
});


remoteVideo.addEventListener('loadedmetadata', function() {
    // on loadedmetadata
    trace('remoteVideo: width:' + this.videoWidth + '-px,height' + this.videoHeight + '-px');
    console.log('video(remote): The Meta Data is known and loaded');
});

remoteVideo.onresize = function() {
    trace('RemoteVideo size resized to ' + remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
    if (startTime) {
        var elapsedTime = window.performance.now() - startTime;
        trace('Setup Time: ' + elapsedTime.toFixed(3) + 'MilliSeconds');
        startTime = null;
    }

};

var localStream;
var connectionSelf;
var connectionPeer1;

var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

//---------------------------------------------
// Utility functions
//


function getName(x) {
    if (x === connectionSelf) {
        return 'Self';
    } else {
        return 'Peer1';
    }
}


function getPeerEndPoint(rtcpc) {
    if (rtcpc === connectionSelf) {
        return connectionPeer1;
    } else {
        return connectionSelf;
    }
}


function gotStream(s) {
    trace('Start(): Received Local Stream');
    localVideo.srcObject = s;
    window.localStream = localStream = s;
    connectButton.disabled = false;
}




//====================================================
//
//  Top Level Function : On pressing 'start' button
//
//








function onStart() {
    trace('Showing the LocalStream');
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(gotStream)
        .catch(function(e) {
            // Error Function
            console.log('Browser: getUserMedia:Error', e.name);
            navigator.alert('getUserMedia():Error', e.name);
        });

}









//  On Connect  Eco System

function onIceCandidate(rtcpc, iceEvent) {
    console.log('Connect(3):Storing ice candidate in RTCPC:', getName(rtcpc), rtcpc, iceEvent);
    if (iceEvent.candidate) {
        console.log('Event is Candidate');
        let otherEnd = getPeerEndPoint(rtcpc);
        trace('OnIceCandidate():CB -- The LocalEnd:' + getName(rtcpc) + ',the remoteEnd:' + getName(otherEnd));
        otherEnd.addIceCandidate(new RTCIceCandidate(iceEvent.candidate))
            .then(function() {
                onAddIceCandidateSuccess(rtcpc);
            }, function(err) {
                onAddIceCandidateError(rtcpc, err);
            });
        trace('OnIceCandidate(): CB:[' + getName(rtcpc) + '] ICE Candidate: \n' + iceEvent.candidate.candidate);
    }
    trace("------------------------ connect(3) on  onIceCandidate attempted ---------");

}

function onAddIceCandidateSuccess(rtcpc) {
    trace('Connect(10): onAddIceCandidate:Success: ' + getName(rtcpc));
}

function onAddIceCandidateError(rtcpc, err) {
    trace('Connect(10): onAddIceCandidate:Failure: ' + getName(rtcpc), err.toString());
}


function onIceStateChange(rtcpc, ice) {
    console.log('Connect(x):Ice State is changing for', getName(rtcpc), rtcpc, ice);
    if (rtcpc) {
        trace('Connect(x): ICE State for ' + getName(rtcpc) + "ConnectionState: " + rtcpc.iceConnectionState);
        trace('ICE Change Event:' + ice.toString());
    }
    trace("------------------------ connect(x) iceStateChanged processed --------- ");

}




//====================================================
//
//  Top Level Function : On pressing 'connect' button
//
//


function onConnect() {

    trace('Connect. started......................... .........');

    connectButton.disabled = true;
    disconnectButton.disabled = false;
    startButton.disabled = true;

    startTime = window.performance.now();

    var vidTracks = localStream.getVideoTracks();
    var audTracks = localStream.getAudioTracks();

    console.log('VideoTracks:', vidTracks);
    console.log('AudioTracks:', audTracks);

    vidTracks.map(function(v) {
        console.log("videoStreamTrack:", v.label);
    });

    audTracks.map(function(a) {
        console.log("audioStreamTrack:", a.label);
    });





    trace('Connect(2) Creating a RTCPeerConnection(Self) .........');
    // Create a RTCPeerConnection Object for self. 

    var servers = null;

    // RTC Connection for local
    //

    window.connectionSelf = connectionSelf = new RTCPeerConnection(servers);
    console.log('Connect():created a selfconnection object', connectionSelf);
    console.log('name of self connection object', getName(connectionSelf));
    trace('connect(2) Self RTCPC created');

    trace('Connect(2): attaching fx onicecandate');
    connectionSelf.onicecandidate = function(ice) {
        console.log('callback(Self): OnIceCandidate event');
        onIceCandidate(connectionSelf, ice);
        console.log('callback(self): processed onicecandidate call back');
    };


    // RTC Peer for remote 
    //

    trace('Connect(2.1) Creating a RTCPeerConnection(Peer) .........');

    window.connectionPeer1 = connectionPeer1 = new RTCPeerConnection(servers);
    console.log('created a remote Peer connection object', connectionPeer1);
    console.log('name of peer connection object', getName(connectionPeer1));

    trace('Connect(2.1): attaching fx onicecandate');
    connectionPeer1.onicecandidate = function(ice) {
        console.log('callback(Peer1): OnIceCandidate event');
        onIceCandidate(connectionPeer1, ice);
        console.log('callback(Peer1): processed onicecandidate call back');
    };


    // Stick oniceconnectionstatus functions
    //

    trace('Connect(4): ---- Setting function ofr oniceconnectionstatechange');

    connectionSelf.oniceconnectionstatechange = function(ice) {
        console.log('Callback(self): iceconnection state changed', ice);
        onIceStateChange(connectionSelf, ice);
        console.log('Callback(self): iceconnection state changed processed', ice);
    };
    connectionPeer1.oniceconnectionstatechange = function(ice) {
        console.log('Callback(Peer): iceconnection state changed', ice);
        onIceStateChange(connectionPeer1, ice);
        console.log('Callback(Peer): iceconnection state changed processed', ice);
    };


    // Stick gotRemoteStream function
    //


    console.log('Connect(5): attached call back for onaddstream for remote RTCPC');
    connectionPeer1.onaddstream = gotRemoteStream;

    // add local stream 
    //

    console.log('Connect(6): Adding local stream in local RTCPC');
    connectionSelf.addStream(localStream);

    console.log('Connect(6) added local stream to connection self', connectionSelf);



    // Connecting: Providing Offer 



    trace('---------------------------------------------');
    trace('self:Connect(7) ....... creating Offer to remote');

    connectionSelf.createOffer({ offerToRecieveAudio: 1, offerToReceiveVideo: 1 })
        .then(createOfferSuccess, createsdpError);

    trace('**************** Connection Established and SDP exchanged ==============');
    trace('TBD now handle onIceCandidate properly');
    trace('Stopping before connectionRemote setting description');


}

function onSetSessionDescriptionError(e) {
    trace('connection Self/remote: Can not set SDP, the error', e.toString());
}

function createOfferSuccess(offer) {
    trace('Connect(7):Callback: creating Offer Successful');
    console.log('----> offer.SDP from Self', offer.sdp);
    trace('Connect(7): Callback: Self: setting local descriptor ....');
    connectionSelf.setLocalDescription(offer).then(
        function() {
            trace('Connect(7): LocalDescriptionSDP successful CB');
            onSetLocalSuccess(connectionSelf);
        },
        onSetSessionDescriptionError
    );

    // explicitely send and make remote accepts the offer
    trace('Connect(8):transferring SDP to remote guy...............................');
    connectionPeer1.setRemoteDescription(offer).then(function() {
        onSetRemoteSuccess(connectionPeer1);
    }, onSetSessionDescriptionError);

    connectionPeer1.createAnswer().then(onCreateAnswerSuccess, onSetSessionDescriptionError);
    // Remote should send an answer back to me..



    trace('Connect(7):Callback: COmpleted Connect(8) of transferring to remote and generating answer');
    trace('Connect(7):Callback: creatingOfferSuccess callback returning');

}

function onSetRemoteSuccess(rtcpc) {
    trace('Connect(9):SetRemoteSuccess:CB ----------call---------');
    console.log('remote SDP is set to source', getName(rtcpc));
    trace('Connect(9):SetRemoteSuccess:CB ---------return--------');

}

function onCreateAnswerSuccess(answerSDP) {
    trace('===========================================================');
    trace('Connect(9):onCreateAnswerSuccess:CB ----------call---------');
    console.log('remote SDP which is offered is same as Mine');
    connectionPeer1.setLocalDescription(answerSDP).then(function() {
        onSetLocalSuccess(connectionPeer1);

    }, onSetSessionDescriptionError);
    trace('ConnectionSelf will set the setRemoteDescription to accept the answer');
    connectionSelf.setRemoteDescription(answerSDP).then(function() {
        onSetRemoteSuccess(connectionSelf);

    }, onSetSessionDescriptionError);
    trace('Connect(9):onCreateAnswerSuccess:CB ---------return--------');
    trace('===========================================================');

}


function onSetLocalSuccess(conn) {
    console.log('Connect(7:CB):Self: create offer successful');
    trace(getName(conn) + ' setLocalDescriptionComplete');
}

function createsdpError(e) {
    console.log('Connect(7:CB):Self: create offer failed with ', e.toString());

}

function onDisconnect() {
    trace("Disconnecting .........");
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    connectionSelf.close();
    connectionPeer1.close();
    connectionSelf = null;
    connectionPeer1 = null;
}


function gotRemoteStream(eventE) {
    // adding remote stream coming from Peer1 into current windows

    trace('---------=============>>     gotRemoteStream:CB: Event came');
    console.log('Event came : + ' + eventE.stream.toString());
    window.remoteStream = remoteVideo.srcObject = eventE.stream;
    trace('gotRemoteStream:CB: Over');
    console.log('gotRemoteStream:CB: Finished');
}


function trace(t) {
    if (t[t.length - 1] === '\n') {
        t = t.substring(0, t.length - 1);
    }
    if (window.performance) {
        var tNow = (window.performance.now() / 1000).toFixed(3);
        console.log(tNow + ':' + t);
    } else {
        console.log('Now:' + t);
    }

}





//--------------------------------------------------
// Junk Function - Older generation Junk Function



console.log('Step1:  old Fashion of doing the things ignore');
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

console.log('set the navigator getUsermedia', navigator.getUserMedia);
console.log(video);


console.log(connectButton, startButton, disconnectButton);

console.log(localVideo, remoteVideo);
console.log("Current State: ", connectButton, startButton, disconnectButton);




navigator.getUserMedia({ audio: false, video: true }, function(s) {
    // Okay function with stream s
    window.stream = s;
    if (window.URL) {
        console.log('windows url was set', window.URL);
        video.src = window.URL.createObjectURL(s);
        //video.srcObject = s;

    } else {
        console.log('windows URl was not set');
        video.src = s;
        //video.srcObject = s;
    }

    console.log('Browser:got user media and showing also');


}, function(e) {
    // Error Function
    console.log('Browser: getUserMedia:Error', e);
    navigator.alert('getUserMedia():Error', e.name);
});





console.log("================ START OF GOOD CODE ==========");