import React, { useState, useRef } from 'react';
import Scrambler from './Scrambler';
import { ZH_TEST } from '../utils';
import './Sentence.scss';

const Sentence = ({ sentence, onNext, onOpen }) => {
  const { zh, en, tatoeba_id } = sentence;

  const [complete, setComplete] = useState(false);
  const [correct, setCorrect] = useState(false);

  const scrambled = useRef(
    zh.split('').filter(ch => ch.match(ZH_TEST)).sort((a, b) => 0.5 - Math.random())
  );

  const setStatus = (complete, correct) => {
    setComplete(complete);
    setCorrect(correct);
  };

  const classes = ['sentence'];
  if (complete) classes.push('complete');
  if (correct) classes.push('correct');
  return (
    <div className={classes.join(' ')}>
      <div className="links">
        <a href="https://github.com/cantrellnm/zh-scrambler/issues/new" target="_blank">
          Report Issue
        </a>
        <a href={`https://tatoeba.org/en/sentences/show/${tatoeba_id}`} target="_blank">
          Tatoeba #{tatoeba_id}
        </a>
        <small>Right-click hanzi for information!</small>
        <button onClick={onNext}>Next</button>
      </div>
      <p className="en-container">{ en }</p>
      <Scrambler zh={zh} scrambled={scrambled.current} complete={complete} correct={correct}
                 onNext={onNext} onChange={setStatus} onOpen={onOpen} />
    </div>
  );
};

export default Sentence;
