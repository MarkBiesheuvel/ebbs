var audioCtx = new AudioContext()
var urlMap = {
  'bd': 'Dirt-Samples/bd/BT3AADA.wav',
  'sn': 'Dirt-Samples/sn/ST3TAS3.wav'
}
var bufferMap = {}

var silence = function () {
  return function () {

  }
}

var sample = function (key) {

  if (!(key in urlMap)) {
    console.warn('Invalid sample: ' + key)
    return silence;
  }
  if (!(key in bufferMap)) {
    var url = urlMap[key]

    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      audioCtx.decodeAudioData(request.response, function (buffer) {
        bufferMap[key] = buffer
      }, function (err) {
        console.error(err)
      })
    }
    request.send()
  }

  return function () {
    // Still check if buffer is already loaded
    if (key in bufferMap) {
      var source = audioCtx.createBufferSource()
      source.buffer = bufferMap[key]
      source.connect(audioCtx.destination)
      source.start(0)
    }
  }
}

var sequence = function () {

  var callbacks = arguments
  var n = callbacks.length

  return function () {
    for (var i = 0; i < n; i++) {
      setTimeout(callbacks[i], i * 500)
    }
  }
}

var parallel = function () {

  var callbacks = arguments
  var n = callbacks.length

  return function () {
    for (var i = 0; i < n; i++) {
      setTimeout(callbacks[i], i * 500)
    }
  }
}

var loop = function (interval, callback) {
  setInterval(callback, interval)
}

