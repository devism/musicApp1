import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
// import { synth } from './synth.js';
import * as Tone from 'tone';
import { Reverb } from 'tone';
import { Sampler } from 'tone';
import { initAdsr, mapMultisliderToEnvelopeValues,addOnChangeListener } from './components/adsr.js'


document.addEventListener('DOMContentLoaded', () => {
  const adsr = initAdsr();

  addOnChangeListener(adsr, fmSynth);
});

document.querySelector('#app').innerHTML = `
<div id="adsr"></div>
<div id="sequence-controls-container">
    <h3>Custom Sequence:</h3>
  </div>
<button id="transposeUp">Transpose Up</button>
<button id="transposeDown">Transpose Down</button>
<button id="init">Initialize</button>
<button id="stop">Stop</button>
<button id="start">Start</button>
<div id="buttons-container">
</div>
  <div id="hormonicity">Harmonicity</div>
  <span id="numberHarmon"></span>
  <br>
  
  <div id="modulation">Modulation</div>
  <br>
  <div id="modIndex">ModIndex</div>

  
  <div>
    <label for="harmon">harmon: </label>
    <input type="range" id="harmon" name="harmon" min="0" max="20" step="0.1" value="0" >
  </div>
  <div>
    <label for="decay">Reverb Decay: </label>
    <input type="range" id="decay" name="decay" min="0.01" max="10" step="0.01" value="6">
  </div>
  <div>
    <label for="wet">Reverb Wet: </label>
    <input type="range" id="wet" name="wet" min="0" max="1" step="0.01" value="0.5">
  </div>
`;

///////



var hormonicitySlider = new Nexus.Slider("#hormonicity",{
  'mode': 'relative',  // 'relative' or 'absolute'
    'min': 0,
    'max': 4,
    'step': 0.01,
    'value': 0
})
var modulationSlider = new Nexus.Slider("#modulation", {
   'mode': 'relative',  // 'relative' or 'absolute'
    'min': 0,
    'max': 20,
    'step': 0.1,
    'value': 0
})

var numberHarmon = new Nexus.Number('#numberHarmon')
numberHarmon.link(hormonicitySlider)

const reverb = new Reverb().toDestination();

function initAudioContext() {
  Tone.start();
  console.log('Audio context initialized');
}

const buttonsContainer = document.querySelector('#buttons-container');
const synth = new Tone.Synth().toDestination();
const fmSynth = new Tone.PolySynth(Tone.FMSynth, {
  envelope: {
    attack: 0,
    decay: 3,
    sustain: 1,
    release: 5,
  },
  modulationEnvelope: {
    attack: 0,
    decay: 3,
    sustain: 1,
    release: 5,
  }
})
  .toDestination()
  .connect(reverb);

  


function updateModulationIndex(newValue) {
  fmSynth.set({ modulationIndex: newValue });
}

function updateHarmonicity(newValue){
  fmSynth.set({ harmonicity: newValue });
}

function updateModulation(newValue){
  fmSynth.set({ modulation: newValue });
}


let loop;

// Define your custom sequence using button indices
let customSequence = [0, 0, 0, 0, 0, 0, 0, 0];

const timeDivisions = ['4n', '2n', '4n', '8n'];

const sequenceControlsContainer = document.querySelector(
  '#sequence-controls-container'
);

customSequence.forEach((value, index) => {
  const sliderWrapper = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = `custom-sequence-${index}`;
  label.textContent = `Index ${index}: `;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = `custom-sequence-${index}`;
  slider.name = `custom-sequence-${index}`;
  slider.min = 0;
  slider.max = 100;
  slider.step = 1;
  slider.value = value;

  sliderWrapper.appendChild(label);
  sliderWrapper.appendChild(slider);
  sequenceControlsContainer.appendChild(sliderWrapper);
});

customSequence.forEach((value, index) => {
  document
    .querySelector(`#custom-sequence-${index}`)
    .addEventListener('input', (event) => {
      const newValue = parseInt(event.target.value, 10);
      console.log(newValue);
      customSequence[index] = newValue;
    });
});
///////////

function getRandomItem(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function phrygianScale(rootNote) {
  // I added 12
  const steps = [0, 1, 3, 5, 7, 8, 10, 11, 13, 15];
  return steps.map((step) => frequencyFromNoteNumber(rootNote + step));
}

const initialRootNote = 60;
const semitonesInOctave = 12;
let currentRootNote = initialRootNote;

let cPhrygianFrequencies = phrygianScale(55);

let randomTimeDivision;

function transposeUp() {
  currentRootNote += semitonesInOctave;
  updateScaleFrequencies();
}

function transposeDown() {
  currentRootNote -= semitonesInOctave;
  updateScaleFrequencies();
}

function updateScaleFrequencies() {
  cPhrygianFrequencies = phrygianScale(currentRootNote);
}
let randomRestDuration;
// Function to play buttons in a specific sequence
function playButtonsInSequence(sequence) {
  randomTimeDivision = getRandomItem(timeDivisions);
  let currentIndex = 0;

  

  Tone.Transport.scheduleRepeat((time) => {
    const buttonIndex = sequence[currentIndex];

    // const freq = 200 + buttonIndex * 50.3;
    const freq =
      cPhrygianFrequencies[buttonIndex % cPhrygianFrequencies.length];

    randomRestDuration = Tone.Time(getRandomItem(timeDivisions)).toSeconds();
    let velocity = Math.random();
    fmSynth.triggerAttackRelease(
      freq,
      '16n',
      time + randomRestDuration,
      velocity
    );

    // Change the button's background color when it is triggered
    // button.style.backgroundColor = 'red';

    // Stop the synth after the duration of an 8th note
    Tone.Draw.schedule(() => {
      // button.style.backgroundColor = '';
    }, time + Tone.Time(randomTimeDivision).toSeconds() + randomRestDuration);

    currentIndex = (currentIndex + 1) % sequence.length;
  }, '8n');
}

Tone.Transport.bpm.value = 155;

// Start playing the buttons in the custom sequence
playButtonsInSequence(customSequence);

function stopSeq() {
  Tone.Transport.stop();
}

function startSeq() {
  Tone.Transport.start();
  randomTimeDivision = getRandomItem(timeDivisions);
}

document.querySelector('#init').addEventListener('click', initAudioContext);
document.querySelector('#stop').addEventListener('click', stopSeq);
document.querySelector('#start').addEventListener('click', startSeq);
document.querySelector('#transposeUp').addEventListener('click', transposeUp);
document
  .querySelector('#transposeDown')
  .addEventListener('click', transposeDown);

 

modulationSlider.on('change', function(val){
  const modValue = parseFloat(val);

  updateModulationIndex(modValue)
})

hormonicitySlider.on('change', function(val){
  const harmonValue = parseFloat(val);
  console.log('Modulation index changed to', harmonValue);
  updateHarmonicity(harmonValue)
})

document.querySelector('#harmon').addEventListener('input', (event) => {
  const harmonValue = parseFloat(event.target.value);
  console.log('Modulation index changed to', harmonValue);
  
  updateHarmonicity(harmonValue)
});

document.querySelector('#decay').addEventListener('input', (event) => {
const decayValue = parseFloat(event.target.value);
reverb.decay = decayValue;
});

document.querySelector('#wet').addEventListener('input', (event) => {
  const wetValue = parseFloat(event.target.value);
  reverb.wet.value = wetValue;
});
