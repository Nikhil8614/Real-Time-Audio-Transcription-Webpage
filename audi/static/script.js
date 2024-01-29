
$(document).ready(function() {
    const audioInput = $('#transcription-text');
    const recordButton = $('#recordButton');
    const clearButton = $('#clearButton');
    const sendButton = $('#sendButton');
    const clearAllButton = $('#clearAllButton');
    const displayText = $('#displayText');
    const sentMessagesContainer = $('#sentMessagesContainer');
     // Toggle between day and night modes
    const toggleModeButton = $('#toggleModeButton');
    toggleModeButton.click(function() {
        $('body').toggleClass('night-mode');
    });

    let recognition;
    let isRecording = false;

    // Retrieve stored messages from local storage
    const storedMessages = JSON.parse(localStorage.getItem('sentMessages')) || [];

    // Display stored messages
    storedMessages.forEach(message => {
        appendMessage(message);
    });

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            const result = event.results[event.results.length - 1];
            const transcription = result[0].transcript;

            audioInput.val(transcription);
            displayText.text(transcription);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = function() {
            if (isRecording) {
                recognition.start();
            }
        };

        recordButton.click(function() {
            if (!isRecording) {
                isRecording = true;
                recognition.start();
                recordButton.text('Stop Recording');
                clearButton.prop('disabled', true);

                // Automatically stop recording after 90 seconds
                setTimeout(function() {
                    isRecording = false;
                    recognition.stop();
                    recordButton.text('Start Recording');
                    clearButton.prop('disabled', false);
                    
                    // Process the transcribed text and send the message
                    const transcribedText = audioInput.val();
                    const message = { text: transcribedText, timestamp: new Date().toLocaleString() };

                    // Append the message to the display and store it in local storage
                    appendMessage(message);
                    storedMessages.push(message);
                    localStorage.setItem('sentMessages', JSON.stringify(storedMessages));

                    // Clear the transcription area
                    audioInput.val('');
                    displayText.text('');
                }, 90000);
            } else {
                isRecording = false;
                recognition.stop();
                recordButton.text('Start Recording');
                clearButton.prop('disabled', false);
            }
        });

        sendButton.click(function() {
            // Process the transcribed text and send the message
            const transcribedText = audioInput.val();
            const message = { text: transcribedText, timestamp: new Date().toLocaleString() };

            // Append the message to the display and store it in local storage
            appendMessage(message);
            storedMessages.push(message);
            localStorage.setItem('sentMessages', JSON.stringify(storedMessages));

            // Clear the transcription area
            audioInput.val('');
            displayText.text('');
        });

        clearAllButton.click(function() {
            // Clear all stored messages
            localStorage.removeItem('sentMessages');

            // Clear the displayed messages
            sentMessagesContainer.empty();
        });

        clearButton.click(function() {
            audioInput.val('');
            displayText.text('');
        });
    } else {
        audioInput.val("Sorry, your browser doesn't support the Web Speech API. Please use a modern browser.");
    }

    // Function to append a single message with one timestamp to the sent messages container
    function appendMessage(message) {
        sentMessagesContainer.append(`
            <div class="sent-message">
                ${message.text}
                <span class="timestamp">${message.timestamp}</span>
            </div>`
        );
    }
});



const mic_btn = document.querySelector('#mic'); 
const playback= document.querySelector('.playback');
mic_btn.addEventListener('click', ToggleMic);
let can_record = false;
let is_recording = false;
let recorder = null;
let chunks = [];

function SetupAudio() {
    console.log("Setup");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
    .getUserMedia({
        audio: true
    })
    .then(SetupStream)
    .catch(err => {  
        console.error(err)
    });
    }
}
SetupAudio();

function SetupStream(stream) {
    recorder = new MediaRecorder(stream);  
    recorder.ondataavailable = e => { 
        chunks.push(e.data);
    }
    recorder.onstop = e => {
    const blob= new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    chunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    playback.src = audioURL;
    } 
    can_record = true;
    }
    
function ToggleMic() { 
if (!can_record) return;
is_recording = !is_recording;
if (is_recording) {
recorder.start();
mic_btn.classList.add("is-recording");
} else {
recorder.stop();
mic_btn.classList.remove("is-recording");
}
}
