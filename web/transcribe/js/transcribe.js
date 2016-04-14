var player;

var dialogStart = -1;
var dialogStartKeycode = '';
var seeking = false;
var lastUpdateTrackPosition = 0;
var current = {
  isPlaying: false
};

var stub = {};

function bootstrap() {
  player = document.getElementById('player');
  current = {
    isPlaying: false,
    duration: player.duration,
    position: player.currentTime
  };

  $('#progress-end').text(player.duration.toMMSS());

  $('#player').bind('timeupdate', function() {
    var player = $(this);
    current.position = this.currentTime;
  });

  $('.focus').focusin(function() {
    $('#focus-notification').css('background-color', '#A1D490');
  });

  $('.focus').focusout(function() {
    $('#focus-notification').css('background-color', 'white');
  });

  $('.focus').keydown(function(event) {
    if (dialogStart == -1) {
      dialogStart = player.currentTime;
      dialogStartKeycode = event.keyCode;
    }
  });

  $('.focus').keyup(function(event) {
    if (dialogStart >= 0 && event.keyCode == dialogStartKeycode) {
      if (stub !== undefined && stub.transcription !== undefined && stub.transcription.dialog !== undefined) {
        var part = String.fromCharCode(dialogStartKeycode).toLowerCase();
        var start = parseInt(dialogStart * 1000, 10);
        var stop = parseInt(player.currentTime * 1000, 10);
        stub.transcription.dialog.push({part: part, start: start, stop: stop, text: ''});
        stub.transcription.dialog.sort(function(a, b) {
          a.start - b.start;
        });

        renderStub();
      }

      dialogStart = -1;
      dialogStartKeycode = '';
    }
  });

  $('#progress').on('mousedown', function() {
    seeking = true;
  });

  $('#progress').on('mouseup', function() {
    seeking = false;
    var seekToPercentage = $('#progress').val();
    var seekTo = current.duration * seekToPercentage / 100;
    player.currentTime = seekTo;
  });

  $('#track-title').on('blur', function() {
    stub.name = $('#track-title').val();
    renderStub();
  });

  $('#album-name').on('blur', function() {
    stub.albumName = $('#album-name').val();
    renderStub();
  });

  $('#spotify-uri').on('blur', function() {
    stub.spotifyUri = $('#spotify-uri').val();
    renderStub();
  });

  $('#track-index').on('blur', function() {
    stub.trackIndex = Number($('#track-index').val());
    renderStub();
  });

  $('#load-url').on('blur', function() {
    loadStubDataFromUrl($('#load-url').val());
  });

  $('#stub').on('blur', function() {
    stub = JSON.parse($('#stub').val());
    renderStub();
  });

  setInterval(updateProgress, 81);
}

function play() {
  player.play();
  current.isPlaying = true;
}

function pause() {
  player.pause();
  current.isPlaying = false;
}

function loadStubDataFromUrl(url) {
  $.ajax({
    type: 'GET',
    dataType: 'text',
    crossDomain: true,
    url: url,
    success: function(responseData, textStatus, jqXHR) {
      var existingDialog = [];
      if (stub !== undefined && stub.transcription !== undefined && stub.transcription.dialog != undefined) {
        existingDialog = stub.transcription.dialog;
      }
      stub = JSON.parse(responseData);
      delete stub.transcription.dialog;
      stub.transcription.dialog = existingDialog;
      renderStub();
    },

    error: function(responseData, textStatus, errorThrown) {
      console.log('Could not retrieve transcriptions', errorThrown);
    }
  });
}

function renderStub() {
  var pretty = JSON.stringify(stub, undefined, 4);
  $('#stub').val(pretty);
}

function updateProgress() {
  var t = (new Date()).getTime();
  if (lastUpdateTrackPosition == 0) {
    lastUpdateTrackPosition = t;
  }

  var dt = t - lastUpdateTrackPosition;
  lastUpdateTrackPosition = t;
  if (current.isPlaying) {
    current.position += dt / 1000;
  }
  if (!seeking) { // Do not move handler if user is currently dragging it
    $('#progress').val(current.position / current.duration * 100);
  }
}

Number.prototype.toMMSS = function() {
  var secNum = parseInt(this, 10); // don't forget the second param
  var minutes = Math.floor(secNum / 60);
  var seconds = secNum - (minutes * 60);

  if (seconds < 10) {seconds = '0' + seconds;}
  var time    = minutes + ':' + seconds;
  return time;
}
