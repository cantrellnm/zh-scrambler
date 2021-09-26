import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Sentence from './components/Sentence';
import './App.scss';
import * as Realm from "realm-web";

const db = new Realm.App({ id: 'zh-scrambler-wzrrc' });

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const level = useRef(1);
  const inclusive = useRef(false);
  const [sentences, setSentences] = useState([]);
  const [hanzi, setHanzi] = useState({});
  const [open, setOpen] = useState(null);

  const sentence = sentences[0];

  async function login() {
    await db.logIn(Realm.Credentials.anonymous());
    setUser(db.currentUser);
  }

  function fetchSentences() {
    try {
      user.functions.getSentences(level.current, inclusive.current).then(response => {
        if (response.length) {
          setSentences(response);
          fetchHanzi(response);
        }
      }).catch(err => {
        console.error(err);
        setError(err);
      });
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  function fetchHanzi(sentences) {
    const chars = [...new Set(sentences.map(s => s.zh).join('').split(''))];
    try {
      user.functions.getHanzi(chars).then(response => {
        setHanzi(response.reduce((acc, h) => {
          acc[h.char] = h;
          return acc;
        }, {}));
      }).catch(console.error);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    login();
    document.addEventListener('click', () => setOpen(null));
  }, []);

  useEffect(() => {
    if (user && !error && !sentences.length) {
      fetchSentences();
    }
  }, [user, error, sentences]);

  const nextSentence = () => {
    setSentences(sentences => sentences.slice(1));
  };

  const openHanzi = (e, char) => {
    e.preventDefault();
    setOpen({ char, x: e.pageX, y: e.pageY });
  };

  return (
    <>
      <menu>
        <label>
          *Level
          <select value={level.current} onChange={e => {
            level.current = parseInt(e.target.value);
            fetchSentences();
          }}>
            <option value="1">HSK 1</option>
            <option value="2">HSK 2</option>
            <option value="3">HSK 3</option>
            <option value="4">HSK 4</option>
            <option value="5">HSK 5</option>
            <option value="6">HSK 6</option>
            <option value="9">HSK 7+</option>
          </select>
        </label>
        { level.current > 1 && (
          <label>
            <input type="checkbox" checked={inclusive.current}
              onChange={e => {
                inclusive.current = e.target.checked;
                fetchSentences();
              }} />
            Include lower level sentences
          </label>
        ) }
      </menu>
      { sentence ? (
        <Sentence key={sentence._id} sentence={sentence}
                  onNext={nextSentence}
                  onOpen={openHanzi} />
      ) : (
        error ? (<p>{error.toString()}</p>) : (<div className="sentence"></div>)
      ) }
      <footer>
        <small>*The <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">HSK</a> level at which all hanzi (characters) in the sentence have been used in official HSK 3.0 vocab.</small>
        <p style={{textAlign:'center', fontSize:'.7rem'}}>
          Sentences and translations sourced from <a href="https://tatoeba.org">Tatoeba</a>.
          Dictionary information from <a href="https://www.mdbg.net/chinese/dictionary?page=cedict">CC-CEDICT</a>.
          Site created by <a href="https://cantrellnm.dev">cantrellnm</a>, open source <a href="https://github.com/cantrellnm/zh-scrambler">on GitHub</a>.
        </p>
      </footer>
      { open && open.char && hanzi[open.char] ? (
        <div className="hanzi-info" style={{ top: open.y, left: open.x }}>
          <h4 lang="zh-CN">{open.char}</h4>
          { hanzi[open.char].defs.map((def, i) => (
            <React.Fragment key={i}>
              <p>{ def.pinyin }</p>
              <ul>
              { def.defs.map((d, j) => (
                <li key={j}>{d}</li>
              )) }
              </ul>
            </React.Fragment>
          )) }
        </div>
      ) : null }
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('app'));
