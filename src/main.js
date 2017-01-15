const audioCtx = new AudioContext()
const urlMap = {
  bd: 'Dirt-Samples/bd/BT3AADA.wav',
  sn: 'Dirt-Samples/sn/ST3TAS3.wav',
  hh: 'Dirt-Samples/hh/000_hh3closedhh.wav',
  'numbers:0': 'Dirt-Samples/numbers/0.wav',
  'numbers:1': 'Dirt-Samples/numbers/1.wav'
}
let bufferMap = {}

const defaultTiming = 1000
const defaultDestination = audioCtx.destination

// Helper functions

/**
 * @param {Number} timing - The amount of milliseconds to wait
 * @returns {Promise} - A promise
 */
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


/**
 * @see {@link http://stackoverflow.com/a/22313408/825547}
 * @see {@link http://kevincennis.github.io/transfergraph/}
 * @param {Number} amount
 * @returns {Float32Array}
 */
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

/**
 *
 * @returns {function(Number=, AudioNode=)}
 */
const silence = () => {
  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {
    return promise(timing)
  }

  return inner
}

/**
 * @param {String} - The key of the sound to play
 * @return {sequence~inner} - The resulting sound function
 */
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

  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

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

  return inner
}

/**
 * @param {Number} value - The volume to play the sound at
 * @param {...Function} callbacks - The sound function to play
 * @return {sequence~inner} - The resulting sound function
 */
const volume = (value, callback) => {

  const gainNode = audioCtx.createGain()
  gainNode.gain.value = value

  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {
    gainNode.connect(destination)
    return callback(timing, gainNode)
  }

  return inner
}

/**
 * @param {Number} value - The amount of distortion
 * @param {...Function} callbacks - The sound function to play
 * @return {sequence~inner} - The resulting sound function
 */
const distortion = (value, callback) => {

  const waveShaperNode = audioCtx.createWaveShaper()

  waveShaperNode.curve = curve(value)
  waveShaperNode.oversample = '4x'

  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {
    waveShaperNode.connect(destination)
    return callback(timing, waveShaperNode)
  }

  return inner
}

/**
 *
 * @param {...Function} callbacks - The sound functions to play in sequence
 * @return {sequence~inner} - The resulting sound function
 */
const sequence = (...callbacks) => {
  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

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

  return inner
}

/**
 *
 * @param {...Function} callbacks - The sound functions to play in parallel
 * @return {parallel~inner} - The resulting sound function
 */
const parallel = (...callbacks) => {
  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

    const p = callbacks.map((callback) => {
      return callback(timing, destination)
    })

    return Promise.all(p)
  }

  return inner
}

/**
 * @param {Function} - The sound function that needs to be looped
 * @return {loop~inner} - The resulting sound function
 */
const loop = (callback) => {
  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

    callback(timing, destination)
      .then(() => {
        inner(timing, destination)
      })

    return new Promise()
  }

  return inner
}

// Start everything

const play = (callback, bpm = 60, deplay = 4) => {

  const timing = 60000 / bpm

  setTimeout(() => {
    callback(timing)
  }, deplay * 1000)
}
