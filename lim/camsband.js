'use strict';

var VideoDevices = [];
var AudioInputDevices = [];
var AudioOutputDevices = [];

var constraints = navigator.mediaDevices.getSupportedConstraints();
console.log('constraints are :', constraints);


var video1 = document.getElementById('video1');
var video2 = document.getElementById('video2');
var video1text = document.getElementById('video1text');
var video2text = document.getElementById('video2text');
var battu = document.getElementById('battu');
var battuCaps = document.getElementById('battuCaps');
battu.onclick = showCameras;
battu.disabled = false;

battuCaps.onclick = showCapabilities;
battuCaps.disabled = false;

video1.addEventListener('loadedmetadata', function() {
    // on loadedmetadata
    console.log('video1: width:' + this.videoWidth + '-px,height' + this.videoHeight + '-px');
    console.log('video1: The Meta Data is known and loaded');
});


video2.addEventListener('loadedmetadata', function() {
    // on loadedmetadata
    console.log('video2: width:' + this.videoWidth + '-px,height' + this.videoHeight + '-px');
    console.log('video2: The Meta Data is known and loaded');
});

video1.onresize = function() {
    console.log('Video1 size resized to ' + video1.videoWidth + 'x' + video1.videoHeight);
};

video2.onresize = function() {
    console.log('Video2 size resized to ' + video2.videoWidth + 'x' + video2.videoHeight);
};

console.log('video1', video1);
console.log('video2', video2);

navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
        console.log('Devices returned by enumerate Device Call');
        console.log(devices);
        devices.map(function(d) {
            if (d.deviceId === 'default') {
                return;
            }
            if (d.kind === 'videoinput') {
                console.log('Video Device:', d.label);
                VideoDevices.push(d.deviceId);
            } else if (d.kind === 'audioinput') {
                console.log('Microphone :', d.label);
                AudioInputDevices.push(d.deviceId);
            } else if (d.kind === 'audiooutput') {
                console.log('Speaker: ', d.label);
                AudioOutputDevices.push(d.deviceId);
            } else {
                console.log('Not Sure', d.label);
            }

        });
        window.VideoDevices = VideoDevices;
        window.AudioInputDevices = AudioInputDevices;
        window.AudioOutputDevices = AudioOutputDevices;

    })
    .catch(function(e) {
        console.log('Got an error in listing devices', e.toString());

    });


console.log('Video Devices', VideoDevices);
console.log('Audio inputs', AudioInputDevices);
console.log('Audio Outputs', AudioOutputDevices);

console.log('Further Stuff..............');

var strs = null;
var vi = 0;
window.strs = strs = null;
window.vi = vi = 0;

console.log('Video devices', VideoDevices);

function gotStream(x) {
    console.log('Got User MediaStream is ', x);
    x.getVideoTracks().map(function(vt) {
        console.log('--> VideoTracks is ', vt);

    });
    if (window.strs !== null) {
        console.log('Second Entry in strs');
        console.log('the vi is ', window.vi);
        window.strs.push(x);
        console.log('The video1.srcObject', video1.srcObject);
        console.log('The video2.srcObject', video2.srcObject);
        if (video2.srcObject === null) {
            console.log('setting video2 to x', x);
            video2.srcObject = x;
        } else {
            console.log('setting video1 to x', x);
            video1.srcObject = x;
        }
        vi += 1;
    } else {
        console.log('First entry in strs');
        console.log('the vi is ', window.vi);
        window.strs = [x];
        console.log('The video1.srcObject', video1.srcObject);
        console.log('The video2.srcObject', video2.srcObject);
        if (video1.srcObject === null) {
            console.log('setting video1 to x', x);
            video1.srcObject = x;
        } else {
            console.log('setting video2 to x', x);
            video2.srcObject = x;
        }
        vi += 1;

    }
    console.log('the list of videos are', window.strs);
    window.vi = vi;
}


function showCapabilities() {
    console.log('Showing the capabilities');
    video1.srcObject.getVideoTracks().map(function(m) {
        var mm = m.getCapabilities();
        console.log('Media Capabiltieis', mm);
        video1text.value = JSON.stringify(mm);
        var ss = m.getSettings();
        video1text.value = "Capabilities:" + video1text.value + "\nSettings:" + JSON.stringify(ss);
        console.log("settings", ss);
    });
    video2.srcObject.getVideoTracks().map(function(m) {
        var mm = m.getCapabilities();
        console.log('Media Capabiltieis', mm);
        video2text.value = JSON.stringify(mm);
        var ss = m.getSettings();
        video2text.value = "Capabilities:" + video2text.value + "\nSettings:" + JSON.stringify(ss);
        console.log("settings", ss);
    });
}



function showCameras() {
    console.log("showCamera is called");
    console.log('Before:strs is ', window.strs);

    VideoDevices.map(function(v) {
        console.log('doing for ID ', v);
        navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: v } } })
            .then(gotStream)
            .catch(function(e) {
                console.log('Got an error, the error details are ' + e.toString());

            });

        console.log('After:strs are now ', window.strs);

    });
}

console.log('videos are ', video1, video2);