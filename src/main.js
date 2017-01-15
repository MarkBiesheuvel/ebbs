const audioCtx = new AudioContext()
const urlMap = {
  bd: 'Dirt-Samples/bd/BT3AADA.wav',
  sn: 'Dirt-Samples/sn/ST3TAS3.wav',
  hh: 'Dirt-Samples/hh/000_hh3closedhh.wav'
}
let bufferMap = {}

const defaultTiming = 1000
const defaultDestination = audioCtx.destination

const promise = (timing) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (document.hasFocus()) {
        resolve()
      } else {
        reject()
      }
    }, timing)
  })
}

const silence = () => {
  return promise
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

  return (timing = defaultTiming, destination = defaultDestination) => {

    const p = promise(timing)

    // Still check if buffer is already loaded
    if (key in bufferMap) {
      let source = audioCtx.createBufferSource()
      source.buffer = bufferMap[key]
      source.connect(destination)
      source.start(0)
    }

    return p
  }
}

const volume = (value, callback) => {

  return (timing = defaultTiming, destination = defaultDestination) => {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = value;

    gainNode.connect(destination);

    return callback(timing, gainNode)
  }
}

const sequence = (...callbacks) => {

  return (timing = defaultTiming, destination = defaultDestination) => {

    // Cannot make a sequence without sounds
    if (callbacks.length === 0) {
      return promise(timing)
    }

    // Divide timing
    timing /= callbacks.length

    // Start with default promise
    let p = Promise.resolve()

    // Chain promises together
    callbacks.forEach((callback) => {
      p = p.then(() => {
        return callback(timing, destination)
      })
    })

    return p
  }
}

const parallel = (...callbacks) => {

  return (timing = defaultTiming, destination = defaultDestination) => {

    const p = callbacks.map((callback) => {
      return callback(timing, destination)
    })

    return Promise.all(p)
  }
}

const loop = (timing, callback) => {
  callback(timing, defaultDestination)
    .then(() => {
      loop(timing, callback)
    })
}

