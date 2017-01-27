var player;

var dialogStart = -1;
var dialogStartKeycode = '';
var seeking = false;
var lastUpdateTrackPosition = 0;
var current = {
  isPlaying: false
};

var stub = {};
var files = {};
var lastProgressStart;
var lastProgressEnd;

function bootstrap() {
  loadTrackNames();
  player = document.getElementById('player');

  $('#player').bind('timeupdate', function() {
    var player = $(this);
    current.position = this.currentTime;

//    if (lastProgressStart !== parseInt(current.position, 10)) {
      lastProgressStart = parseInt(current.position, 10);
      $('#progress-start').text(current.position.toMMSS() + ' (' + Math.round(current.position * 1000) + ')');
//    }

    var left = current.duration - current.position;
//    if (lastProgressEnd !== parseInt(left, 10)) {
      lastProgressEnd = parseInt(left, 10);
      $('#progress-end').text(left.toMMSS());
//    }
  });

  $('#player').bind('loadedmetadata', function() {
    $('#progress-end').text(player.duration.toMMSS());
    current = {
      isPlaying: false,
      duration: player.duration,
      position: player.currentTime
    };
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
    console.log('loading', $('#load-url').val());
    loadStubDataFromUrl($('#load-url').val());
  });

  $('#stub').on('blur', function() {
    stub = JSON.parse($('#stub').val());
    renderStub();
  });

  $('#volumes').change(function() {
    onVolumeChanged();
  });

  $('#tracks').change(function() {
    onTrackChanged();
  });

  $('#remove-part').click(function() {
    var shortCode = window.prompt('Remove all dialogs from part', 'shortCode');
    if (stub !== undefined && stub.transcription !== undefined && stub.transcription.dialog !== undefined) {
      stub.transcription.dialog = $.grep(stub.transcription.dialog, function(value) {
        return value.part !== shortCode;
      });
/*
      $.each(stub.transcription.dialog, function(key, value) {
        if (value.part === shortCode) {
          stub.transcription.dialog.splice(key, 1);
        }
      });
      */

      renderStub();
    }
  });

  setInterval(updateProgress, 81);
}

function onVolumeChanged() {
  var volume = $('#volumes option:selected').text();
  $('#tracks').empty();
  $.each(files[volume], function(key, value) {
    $('#tracks').append($('<option></option>').text(value));
  });

  onTrackChanged();
}

function onTrackChanged() {
  var comp = $('#volumes option:selected').text() + '/' + $('#tracks option:selected').text()
  $('#player').attr('src', 'media/' + comp);
}

function play() {
  if (current.isPlaying) {
    player.pause();
    current.isPlaying = false;
  } else {
    player.play();
    current.isPlaying = true;
  }
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
      console.log(responseData);
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
  var sortedDialog = stub.transcription.dialog.sort(function (a, b) {
    return a.start - b.start;
  });
  stub.transcription.dialog = sortedDialog;
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

function loadTrackNames() {
  $.ajax({
    type: 'GET',
    dataType: 'text',
    crossDomain: true,
    url: 'https://raw.githubusercontent.com/pakerfeldt/hassan/master/web/transcribe/js/files.json',
    success: function(responseData, textStatus, jqXHR) {
      files = JSON.parse(responseData);
      for (var key in files) {
        $('#volumes').append($('<option></option>').text(key));
      }

      onVolumeChanged();
    },

    error: function(responseData, textStatus, errorThrown) {
      console.log('Could not retrieve files', errorThrown);
    }
  });
}

Number.prototype.toMMSS = function() {
  var secNum = parseInt(this, 10); // don't forget the second param
  var minutes = Math.floor(secNum / 60);
  var seconds = secNum - (minutes * 60);

  if (seconds < 10) {seconds = '0' + seconds;}
  var time    = minutes + ':' + seconds;
  return time;
}
