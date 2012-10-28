function output(inp) {
    document.getElementById("transcription").innerHTML = inp;
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


function parse() {
  var replies = [];
  var parts = [];
  var lines = $("#rawtrans").val().split("\n");
  $.each(lines, function(n, elem) {
    var i = elem.indexOf(':');
    if(i != -1) {
      var replyComponents = [elem.slice(0,i), elem.slice(i+1)];
      var part = replyComponents[0];
      var texta = replyComponents[1];
      var isUncertain = [texta.slice(0,1)] == "?";
      if(isUncertain) {
        texta = texta.slice(1);
        replies.push({"part" : part, "text" : $.trim(texta), "uncertain" : true});
      } else {
        replies.push({"part" : part, "text" : $.trim(texta)});
      }
    } else {
      var i = elem.indexOf("=");
      if(i != -1) {
        var partComponents = [elem.slice(0,i), elem.slice(i+1)];
        parts.push({"shortCode" : partComponents[0], "name" : partComponents[1]});
      }
    }
  });
  var str = JSON.stringify({"parts" : parts, "dialog" : replies}, undefined, 4);
  output(syntaxHighlight(str));
}

