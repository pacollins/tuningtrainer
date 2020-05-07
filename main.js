var audioCtx, source, buffer, inProgress, note, adjustment;
var count = 0;
var attempt = 0;
var difficulty = {
  'beginning': {'min': 25, 'max': 50},
  'intermediate': {'min': 15, 'max': 25},
  'mastery': {'min': 5, 'max': 15}
};
var notes = [
    ['B3', -600],
    ['C4', -500], ['C#/Db4', -400],
    ['D4', -300], ['D#/Eb4', -200],
    ['E4', -100],
    ['F4', 0], ['F#/Gb4', 100],
    ['G4', 200], ['G#/Ab4', 300],
    ['A4', 400], ['A#/Bb4', 500],
    ['B4', 600]
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
  source = audioCtx.createBufferSource();
  var request = new XMLHttpRequest();
  request.open('GET', 'piano-F4.mp3', true);
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
  source.connect(audioCtx.destination);
  source.start(0);
  inProgress = true;
  source.stop(audioCtx.currentTime + 2);
  // Adjusted Pitch
  source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.detune.value = notes[note][1] + adjustment;
  source.connect(audioCtx.destination);
  source.start(audioCtx.currentTime + 1.5);
  source.stop(audioCtx.currentTime + 4);
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
