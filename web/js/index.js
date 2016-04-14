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
  if (typeof currentTranscription.dialog !== 'undefined' && currentTranscription.dialog.length < currentTransIndex + 1) {
    return;
  }

  if (typeof currentTranscription.dialog[currentTransIndex] !== 'undefined') {
    if (trackPosition < currentTranscription.dialog[currentTransIndex].stop) {
      return;
    }

    currentTransIndex++;

    var transid = 'transid-' + currentTransIndex;
    if (currentTranscription.dialog[currentTransIndex].part == '1') {
      $('#dialog').append('<li id="' + transid + '" class="left"><div class="speech"><p>' + currentTranscription.dialog[currentTransIndex].text + '</p></div></li>');
    } else {
      $('#dialog').append('<li id="' + transid + '" class="right"><div class="speech"><p>' + currentTranscription.dialog[currentTransIndex].text + '</p></div></li>');
    }

    var fixedSpeechString = splitString($('#' + transid + ' p'), 400);
    $('#transid-' + currentTransIndex + ' p').html(fixedSpeechString);
    fadeIn(transid);
    scrollToBottom();
  }
}

function fadeIn(transid) {
  $('#' + transid).fadeTo(600, 1);
}

function scrollToBottom() {
  $('html, body').animate({ scrollTop: $(document).height() }, 500);
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
  $('#cover-art').append('<img onclick="scrollToBottom();" id="cover-art-image" src="https://i.scdn.co/image/a8954e81a8dd946388b2d745acd1f2dd24dbf7c2" width="300" height="300" />');
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

function getWidth(el, txt) {
  el.html(txt);
  return el.css('width').replace('px', '');
}

function splitString(el, maxWidth) {
  var txtArr;
  var presentTxt = '';
  var futureTxt = '';
  var finalTxt = '';
  if (getWidth(el, el.html()) >= maxWidth) {
    txtArr = el.html().split(' ');
    for (var i in txtArr) {
      futureTxt += txtArr[i] + ' ';
      if (getWidth(el, futureTxt) > maxWidth) {
        finalTxt += presentTxt.substring(0, presentTxt.length - 1) + '<br />';
        futureTxt = presentTxt = txtArr[i] + ' ';
      } else {
        presentTxt = futureTxt;
      }
    }
  } else {
    finalTxt = el.html();
  }

  if (futureTxt != '') {
    finalTxt += futureTxt;
  }

  return finalTxt;
}
