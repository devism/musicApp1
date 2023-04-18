export function synthSeq() {
    return new Nexus.Multislider('#synthSeq', {
      'size': [200,100],
      'numberOfSliders': 8,
      'min': 0,
      'max': 127,
      'step': 1,
      'candycane': 8,
      'values': [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1, 0, 0, 0, 0, 0, 0],
      'smoothing': 0,
      'mode': 'bar'  // 'bar' or 'line'
    });
  }

export function seqChangeListener(mySynthSeq){
    mySynthSeq.on('change', function(value){
       console.log(value) 
    })
}  