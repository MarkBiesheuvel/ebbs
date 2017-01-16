const audioCtx = new AudioContext()
/**
 *
 * @see {@link https://gist.github.com/marcgg/94e97def0e8694f906443ed5262e9cbb}
 */
const frequencyMap = {
  'C0': 16.35,
  'C#0': 17.32,
  'Db0': 17.32,
  'D0': 18.35,
  'D#0': 19.45,
  'Eb0': 19.45,
  'E0': 20.60,
  'F0': 21.83,
  'F#0': 23.12,
  'Gb0': 23.12,
  'G0': 24.50,
  'G#0': 25.96,
  'Ab0': 25.96,
  'A0': 27.50,
  'A#0': 29.14,
  'Bb0': 29.14,
  'B0': 30.87,
  'C1': 32.70,
  'C#1': 34.65,
  'Db1': 34.65,
  'D1': 36.71,
  'D#1': 38.89,
  'Eb1': 38.89,
  'E1': 41.20,
  'F1': 43.65,
  'F#1': 46.25,
  'Gb1': 46.25,
  'G1': 49.00,
  'G#1': 51.91,
  'Ab1': 51.91,
  'A1': 55.00,
  'A#1': 58.27,
  'Bb1': 58.27,
  'B1': 61.74,
  'C2': 65.41,
  'C#2': 69.30,
  'Db2': 69.30,
  'D2': 73.42,
  'D#2': 77.78,
  'Eb2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'Gb2': 92.50,
  'G2': 98.00,
  'G#2': 103.83,
  'Ab2': 103.83,
  'A2': 110.00,
  'A#2': 116.54,
  'Bb2': 116.54,
  'B2': 123.47,
  'C3': 130.81,
  'C#3': 138.59,
  'Db3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'Eb3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'Gb3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'Ab3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'Bb3': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C#4': 277.18,
  'Db4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'Eb4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'Gb4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'Ab4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'Bb4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,
  'Db5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'Eb5': 622.25,
  'E5': 659.26,
  'F5': 698.46,
  'F#5': 739.99,
  'Gb5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'Ab5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'Bb5': 932.33,
  'B5': 987.77,
  'C6': 1046.50,
  'C#6': 1108.73,
  'Db6': 1108.73,
  'D6': 1174.66,
  'D#6': 1244.51,
  'Eb6': 1244.51,
  'E6': 1318.51,
  'F6': 1396.91,
  'F#6': 1479.98,
  'Gb6': 1479.98,
  'G6': 1567.98,
  'G#6': 1661.22,
  'Ab6': 1661.22,
  'A6': 1760.00,
  'A#6': 1864.66,
  'Bb6': 1864.66,
  'B6': 1975.53,
  'C7': 2093.00,
  'C#7': 2217.46,
  'Db7': 2217.46,
  'D7': 2349.32,
  'D#7': 2489.02,
  'Eb7': 2489.02,
  'E7': 2637.02,
  'F7': 2793.83,
  'F#7': 2959.96,
  'Gb7': 2959.96,
  'G7': 3135.96,
  'G#7': 3322.44,
  'Ab7': 3322.44,
  'A7': 3520.00,
  'A#7': 3729.31,
  'Bb7': 3729.31,
  'B7': 3951.07,
  'C8': 4186.01
}
const urlMap = {
  bd: 'Dirt-Samples/bd/BT3AADA.wav',
  sn: 'Dirt-Samples/sn/ST3TAS3.wav',
  hh: 'Dirt-Samples/hh/000_hh3closedhh.wav',
  'numbers:0': 'Dirt-Samples/numbers/0.wav',
  'numbers:1': 'Dirt-Samples/numbers/1.wav',
  'numbers:2': 'Dirt-Samples/numbers/2.wav',
  'numbers:3': 'Dirt-Samples/numbers/3.wav',
  'numbers:4': 'Dirt-Samples/numbers/4.wav'
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
      if (isPlaying) {
        resolve()
      } else {
        reject()
      }
    }, timing)
  })
}


const preload = (key) => {

  if (!(key in urlMap)) {
    console.warn(`Invalid sample: ${key}`)
    return silence();
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
}

/**
 * @see {@link http://stackoverflow.com/a/22313408/825547}
 * @see {@link http://kevincennis.github.io/transfergraph/}
 * @param {Number} amount - The amount of distortion
 * @returns {Float32Array} - An array representing the distortion curve
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
 * @return {silence~inner} - The resulting sound function
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
 * @return {sample~inner} - The resulting sound function
 */
const sample = (key) => {

  preload(key)

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
 * @param {String} key - The key of the note to play
 * @param {string} type - The tyoeif wave function to use
 * @returns {note~inner} - The resulting sound function
 */
const note = (key, type = 'sine') => {

  if (!(key in frequencyMap)) {
    console.warn(`Invalid note: ${key}`)
    return silence();
  }

  const frequency = frequencyMap[key]

  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

    const p = promise(timing)

    const oscillatorNode = audioCtx.createOscillator()
    oscillatorNode.type = type
    oscillatorNode.frequency.value = frequency
    oscillatorNode.connect(destination)

    oscillatorNode.start()
    oscillatorNode.stop(audioCtx.currentTime + timing / 1000)
    return p
  }

  return inner
}

/**
 * @param {Number} value - The volume to play the sound at
 * @param {...Function} callbacks - The sound function to play
 * @return {volume~inner} - The resulting sound function
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
 * @return {distortion~inner} - The resulting sound function
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
 * @param {...Function} callbacks - The sound functions to alternate between
 * @return {alternate~inner} - The resulting sound function
 */
const alternate = (...callbacks) => {

  const N = callbacks.length

  if (N === 0) {
    return silence()
  }

  let i = 0

  /**
   * @param {Number} timing - The amount of milliseconds this sound may take
   * @param {AudioNode} destination - The audioNode to which the sound needs to be connected
   * @returns {Promise} - A promise that will be resolved when the sounds is done
   */
  const inner = (timing = defaultTiming, destination = defaultDestination) => {

    const p = callbacks[i](timing, destination)

    i = (i + 1) % N

    return p
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

    const p = callback(timing, destination)
      .then(() => {
        inner(timing, destination)
      })

    return p
  }

  return inner
}

// Start everything
let isPlaying = false

const play = (callback, bpm = 25, deplay = 2) => {

  if (isPlaying) {
    throw new Error('Can only one sound at a time')
  }
  isPlaying = true

  const timing = 60000 / bpm

  setTimeout(() => {
    callback(timing)
  }, deplay * 1000)
}

const stop = () => {
  isPlaying = false
}