const key = "o";

exports.encript = function encript(content, round = 1, passcode = key) {
    content= JSON.stringify(content);
  var result = [];
  var passLen = passcode.length;
  for (var i = 0; i < content.length; i++) {
    var passOffset = i % passLen;
    var calAscii = content.charCodeAt(i) + passcode.charCodeAt(passOffset);
    result.push(calAscii);
  }

  if (round == 0) {
    return JSON.stringify(result);
  }

  return encript(JSON.stringify(result), round - 1);
};

exports.decript = function decript(content, round = 1, passcode = key) {
  var result = [];
  var str = "";
  var codesArr = JSON.parse(content);
  var passLen = passcode.length;
  for (var i = 0; i < codesArr.length; i++) {
    var passOffset = i % passLen;
    var calAscii = codesArr[i] - passcode.charCodeAt(passOffset);
    result.push(calAscii);
  }
  for (var i = 0; i < result.length; i++) {
    var ch = String.fromCharCode(result[i]);
    str += ch;
  }
  if (round == 0) {
    return str;
  }
  return decript(str, round - 1);
  // return str;
};