import React, { useState } from 'react';
import { diff } from 'deep-diff';
import './App.css';

function App() {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [error, setError] = useState('');
  const [differences, setDifferences] = useState(null);

  const compareJson = () => {
    try {
      setError('');
      
      const left = leftJson ? JSON.parse(leftJson) : {};
      const right = rightJson ? JSON.parse(rightJson) : {};
      
      const diffs = diff(left, right);
      setDifferences(diffs);
      
      if (!diffs) {
        setError('JSON документы идентичны');
      }
    } catch (e) {
      setError(`Ошибка парсинга JSON: ${e.message}`);
      setDifferences(null);
    }
  };

  const renderDiff = () => {
    if (!differences) return null;

    return (
      <div className="diff-container">
        <h3>Различия:</h3>
        <pre className="diff-result">
          {differences.map((d, i) => {
            const path = d.path ? d.path.join('.') : 'root';
            let value = '';
            
            if (d.kind === 'E') {
              value = `[${path}]: "${d.lhs}" → "${d.rhs}"`;
              return <div key={i} className="diff-modified">{value}</div>;
            } else if (d.kind === 'A') {
              value = `[${path}] array change: ${JSON.stringify(d.item)}`;
              return <div key={i} className="diff-array">{value}</div>;
            } else if (d.kind === 'N') {
              value = `[${path}]: добавлено "${d.rhs}"`;
              return <div key={i} className="diff-added">{value}</div>;
            } else if (d.kind === 'D') {
              value = `[${path}]: удалено "${d.lhs}"`;
              return <div key={i} className="diff-removed">{value}</div>;
            }
            
            return <div key={i}>{value}</div>;
          })}
        </pre>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Сравнение JSON документов</h1>
      <div className="json-inputs">
        <div className="json-input">
          <h3>Исходный JSON</h3>
          <textarea
            value={leftJson}
            onChange={(e) => setLeftJson(e.target.value)}
            placeholder="Вставьте первый JSON здесь..."
          />
        </div>
        <div className="json-input">
          <h3>Изменённый JSON</h3>
          <textarea
            value={rightJson}
            onChange={(e) => setRightJson(e.target.value)}
            placeholder="Вставьте второй JSON здесь..."
          />
        </div>
      </div>
      <button onClick={compareJson}>Сравнить</button>
      {error && <div className="error">{error}</div>}
      {renderDiff()}
    </div>
  );
}

export default App;