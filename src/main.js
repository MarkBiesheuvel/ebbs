const audioCtx = new AudioContext()
const urlMap = {
  'bd': 'Dirt-Samples/bd/BT3AADA.wav',
  'sn': 'Dirt-Samples/sn/ST3TAS3.wav'
}
let bufferMap = {}

const silence = () => {
  return () => {
  }
}

const sample = (key) => {

  if (!(key in urlMap)) {
    console.warn(`Invalid sample: ${key}`)
    return silence;
  }
  if (!(key in bufferMap)) {

    fetch(urlMap[key])
      .then((response) => {
        return response.arrayBuffer()
      })
      .then((buffer) => {
        audioCtx.decodeAudioData(buffer, (buffer) => {
          bufferMap[key] = buffer
        }, (err) => {
          console.error(err)
        })
      })
  }

  return () => {
    // Still check if buffer is already loaded
    if (key in bufferMap) {
      let source = audioCtx.createBufferSource()
      source.buffer = bufferMap[key]
      source.connect(audioCtx.destination)
      source.start(0)
    }
  }
}

const sequence = (...callbacks) => {
  return () => {
    callbacks.forEach((callback, i) => {
      setTimeout(callback, i * 500)
    })
  }
}

const parallel = (...callbacks) => {
  return () => {
    callbacks.forEach((callback) => {
      callback()
    })
  }
}

const loop = (interval, callback) => {
  const tmp = setInterval(callback, interval)

  // Easy way to stop the loop
  document.addEventListener("click", () => {
    clearInterval(tmp)
  });
}

