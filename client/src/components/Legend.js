import React from 'react'
import './Legend.css'

function Legend() {
  return (
    <div className='Legend'>
      <div className='PositiveLabel'>
        <div className='LabelColorBox'/>
        <div className='LabelText'>
          <span>Positive</span>
        </div>
      </div>
      <div className='NegativeLabel'>
        <div className='LabelColorBox'/>
        <div className='LabelText'>
          <span>Negative</span>
        </div>
      </div>
      <div className='NeutralLabel'>
        <div className='LabelColorBox'/>
        <div className='LabelText'>
          <span>Neutral</span>
        </div>
      </div>
    </div>
  );
}

export default Legend;
