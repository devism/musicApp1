export function initAdsr() {
  return new Nexus.Multislider('#adsr', {
    'size': [200,100],
    'numberOfSliders': 4,
    'min': 0,
    'max': 1,
    'step': 0,
    'candycane': 4,
    'values': [0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1],
    'smoothing': 0,
    'mode': 'line'  // 'bar' or 'line'
  });
}



export function addOnChangeListener(adsr, synth) {
  adsr.on('change', function (values) {
    console.log(values);
    const envelopeValues = mapMultisliderToEnvelopeValues(values);
  
    synth.set({
      envelope: {
        attack: envelopeValues.attack,
        decay: envelopeValues.decay,
        sustain: envelopeValues.sustain,
        release: envelopeValues.release,
      },
      modulationEnvelope: {
        attack: envelopeValues.attack,
        decay: envelopeValues.decay,
        sustain: envelopeValues.sustain,
        release: envelopeValues.release,
      },
    });
  });
}

export function mapMultisliderToEnvelopeValues(values) {
    const attack = values[0] * 2; // Map to range 0-2
    const decay = values[1] * 2; // Map to range 0-2
    const sustain = values[2]; // Keep the range 0-1
    const release = values[3] * 4; // Map to range 0-4
  
    return { attack, decay, sustain, release };
  }


