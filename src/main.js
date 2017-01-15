const audioCtx = new AudioContext()
const urlMap = {
  bd: 'Dirt-Samples/bd/BT3AADA.wav',
  sn: 'Dirt-Samples/sn/ST3TAS3.wav',
  hh: 'Dirt-Samples/hh/000_hh3closedhh.wav'
}
let bufferMap = {}

const defaultTiming = 1000
const defaultDestination = audioCtx.destination

// Helper functions

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

// @source http://stackoverflow.com/a/22313408/825547
// @see http://kevincennis.github.io/transfergraph/
const curve = (amount = 50) => {

  const N = 44100
  const curve = new Float32Array(N)
  const deg = Math.PI / 180

  for (let i = 0; i < N; i++) {
    const x = (i * 2 / N) - 1
    curve[i] = (3 + amount) * x * 20 * deg / ( Math.PI + amount * Math.abs(x) )
  }

  return curve
}

// Play functions

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

  const gainNode = audioCtx.createGain()
  gainNode.gain.value = value

  return (timing = defaultTiming, destination = defaultDestination) => {
    gainNode.connect(destination)
    return callback(timing, gainNode)
  }
}

const distortion = (value, callback) => {

  const waveShaperNode = audioCtx.createWaveShaper()

  waveShaperNode.curve = curve(value)
  waveShaperNode.oversample = '4x'

  return (timing = defaultTiming, destination = defaultDestination) => {
    waveShaperNode.connect(destination)
    return callback(timing, waveShaperNode)
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

// Loop function

const loop = (timing, callback) => {
  callback(timing, defaultDestination)
    .then(() => {
      loop(timing, callback)
    })
}

