import React, { useState } from "react";
import * as jsondiffpatch from "jsondiffpatch";
import * as htmlFormatter from "jsondiffpatch/formatters/html";
import 'jsondiffpatch/formatters/styles/html.css';
import "./App.css";

function App() {
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [error, setError] = useState("");
  const [delta, setDelta] = useState(null);

  const compareJson = () => {
    try {
      setError("");

      const left = leftJson ? JSON.parse(leftJson) : {};
      const right = rightJson ? JSON.parse(rightJson) : {};

      const diffpatcher = jsondiffpatch.create({
        objectHash: (obj, idx) => {
          if (obj && typeof obj === "object") {
            if ("id" in obj) {
              return obj.id;
            }
            if ("_id" in obj) {
              return obj._id;
            }
            if ("key" in obj) {
              return obj.key;
            }
            if ("name" in obj) {
              return obj.name;
            }
          }

          return `#index: ${idx}`;
        },
      });

      const delta = diffpatcher.diff(left, right);
      setDelta(delta);

      if (!delta) {
        setError("JSON документы идентичны");
      }
    } catch (e) {
      setError(`Ошибка парсинга JSON: ${e.message}`);
      setDelta(null);
    }
  };

  const renderDiff = () => {
    if (!delta) return null;
    const format = htmlFormatter.format(delta);

    return (
      <div className="diff-container">
        <h3>Различия (с учётом id):</h3>
        <div dangerouslySetInnerHTML={{ __html: format }} />
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
