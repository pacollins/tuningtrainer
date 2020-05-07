var audioCtx, gainNode, source, buffer, inProgress, note, adjustment;
var count = 0;
var attempt = 0;
var difficulty = {
  'beginning': {'min': 25, 'max': 50},
  'intermediate': {'min': 15, 'max': 25},
  'mastery': {'min': 5, 'max': 15}
};
var notes = [
    ['Eb4', -612], ['E4', -512],
    ['F4', -412],
    ['Gb4', -312], ['G4', -212],
    ['Ab4', -112], ['A4', -12],
    ['Bb4', 88], ['B4', 188],
    ['C5', 288],
    ['Db5', 388], ['D5', 488],
    ['Eb5', 588]
];

window.onload = function load() {
  UIkit.modal("#splash").show();
}

function startApp() {
  UIkit.modal("#splash").hide();
  startAudio();
}

function startAudio() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  gainNode = audioCtx.createGain();
  source = audioCtx.createBufferSource();
  var request = new XMLHttpRequest();
  request.open('GET', 'piano_A.mp3', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx.decodeAudioData(request.response, (decoded) => {
      buffer = decoded;
    }, function(e) {
      console.log('Audio error! ', e);
    });
  };
  request.send();
};

function newExercise() {
  var buttons = document.getElementsByTagName("button");
  if (buttons[1].disabled === true) {
    for (var i = 0; i < buttons.length; i++) {buttons[i].disabled = false;}
  }
  if (inProgress) {
    console.log("Please wait. Exercise in progress.");
    return true;
  }
  var level = document.getElementById("difficulty-level").value;
  var min = Math.ceil(difficulty[level].min);
  var max = Math.floor(difficulty[level].max);
  var cents = Math.floor(Math.random() * (max - min + 1)) + min;
  var num = Math.random();
  var plusOrMinus = num < 0.33 ? -1 : num < 0.67 ? 0 : 1;
  note = Math.floor(Math.random() * notes.length);
  adjustment = cents * plusOrMinus;
  playExercise();
}

function playExercise() {
  if (inProgress) {
    console.log("Please wait. Exercise in progress.");
    return true;
  }
  source = audioCtx.createBufferSource();
  // Reference Pitch
  source.buffer = buffer;
  try {source.detune.value = notes[note][1];}
  catch(err) {alert("Your browswer is not compatible with the function that allows the application to detune notes.");return false;}
  gainNode.gain.value = 1;
  gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.7, 0.3);
  gainNode.connect(audioCtx.destination);
  source.connect(gainNode);
  source.start(0, 0.4);
  inProgress = true;
  source.stop(audioCtx.currentTime + 1.1);
  // Adjusted Pitch
  source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.detune.value = notes[note][1] + adjustment;
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 1.9);
  gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 2.6, 0.3);
  gainNode.connect(audioCtx.destination);
  source.connect(gainNode);
  source.start(audioCtx.currentTime + 1.9, 0.4);
  source.stop(audioCtx.currentTime + 3);
  setTimeout(function() {
    inProgress = false;
  }, 3000);
}

function showAnswer(answer) {
  if (inProgress) {return false;}
  var results;
  var delay = 2000;
  var correct = false;
  attempt++;
  if (adjustment === 0) {
    if (answer === 0) {
      results = "You were correct, it was the same!";
      correct = true;
    } else {results = "You were incorrect, it was same. Listen again.";}
  } else if (adjustment > 0) {
    if (answer === 1) {
      results = "You were correct, it was sharp!";
      correct = true;
    } else {results = "You were incorrect, it was sharp. Listen again.";}
  } else if (adjustment < 0) {
    if (answer === -1) {
      results = "You were correct, it was flat!";
      correct = "true";
    } else {results = "You were incorrect, it was flat. Listen again.";}
  }
  if (!correct) {
    delay = 5000;
    playExercise();
  } else {count++;}
  document.getElementById("attempts").innerHTML = count + "/" + attempt + " | " + Math.round(count/attempt*100) + "%";
  document.getElementById("result").innerHTML = results;
  document.getElementById("answer").innerHTML = "<i>Previous Exercise:<\/i> " + notes[note][0] + " | " + adjustment + " cents";
  setTimeout(function() {
    document.getElementById("result").innerHTML = "Try Another!";
    newExercise();
  }, delay);
}
