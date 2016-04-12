var accessToken = '';

var trackURI = '';
var albumURI = '';
var currentTranscription = {};
var trackPosition = 0;
var trackDuration = 0;
var lastUpdateTrackPosition = 0;
var trackPlaying = false;

var currentTransIndex = 0;

function loadTranscriptions() {
  var url = 'https://raw.githubusercontent.com/pakerfeldt/hassan/master/trans/live_at_budokan_vol_6/3_gay_goes_west.json';
  $.ajax({
    type: 'GET',
    dataType: 'text',
    crossDomain: true,
    url: url,
    success: function(responseData, textStatus, jqXHR) {
      //console.log('Trans', responseData);
      currentTranscription = JSON.parse(responseData).transcription;
      console.log('Parts', currentTranscription.parts);
    },

    error: function(responseData, textStatus, errorThrown) {
      console.log('Could not retrieve transcriptions', errorThrown);
    }
  });
}

function updateCurrentTranscription() {
  if (currentTranscription.dialog.length < currentTransIndex + 1) {
    return;
  }

  if (trackPosition < currentTranscription.dialog[currentTransIndex].stop) {
    return;
  }

  currentTransIndex++;

  if (currentTranscription.dialog[currentTransIndex].part == '1') {
    $('#dialog').append('<div class="dialog-left">' + currentTranscription.dialog[currentTransIndex].text + '</div');
  } else {
    $('#dialog').append('<div class="dialog-right">' + currentTranscription.dialog[currentTransIndex].text + '</div>');
  }
}

function updateTrackPosition() {
  var t = (new Date()).getTime();
  if (lastUpdateTrackPosition == 0) {
    lastUpdateTrackPosition = t;
  }

  var dt = t - lastUpdateTrackPosition;
  lastUpdateTrackPosition = t;

  if (trackPlaying) {
    trackPosition += dt;
  }

  $('#track-progress').text(trackPosition);
  updateCurrentTranscription();
}

function toast(s, s2) {
  if (s !== undefined) {
    console.log(s);
  }

  if (s2 !== undefined) {
    console.log(s2);
  }
}

function loadStatic() {
  $('#cover-art').empty();
  $('#cover-art').append('<img id="cover-art-image" src="https://i.scdn.co/image/a8954e81a8dd946388b2d745acd1f2dd24dbf7c2" width="500" height="500" />');
  $('#track-name').text('Gay goes west');
  trackPosition = 0;
  trackDuration = 60000;
  trackPlaying = true;
}

function bootstrap() {
  //connect();
  loadStatic();
  loadTranscriptions();
  setInterval(updateTrackPosition, 81);  
}
