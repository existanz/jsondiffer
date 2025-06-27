import React, { useState } from "react";
import * as jsondiffpatch from "jsondiffpatch/with-text-diffs";
import * as htmlFormatter from "jsondiffpatch/formatters/html";
import "jsondiffpatch/formatters/styles/annotated.css";
import 'jsondiffpatch/formatters/styles/html.css';
import "./App.css";

function extractIds(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const ids = [];
    function traverse(obj, level) {
      if (Array.isArray(obj) && level <= 3) {
        obj.forEach(item => {
          if (item && typeof item === "object" && "id" in item) {
            ids.push(item.id);
          }
          if (level < 3) traverse(item, level + 1);
        });
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach(value => traverse(value, level + 1));
      }
    }
    traverse(data, 1);
    return ids.join(",");
  } catch {
    return "";
  }
}

function CopyIdButton({ jsonString }) {
  const handleCopy = () => {
    const ids = extractIds(jsonString);
    if (ids) {
      navigator.clipboard.writeText(ids);
    }
  };
  return (
    <button
      type="button"
      className="copy-id-btn"
      title="Скопировать id"
      onClick={handleCopy}
      tabIndex={-1}
    >
      Спарсить id
    </button>
  );
}

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
            if ("id" in obj) return obj.id;
            if ("_id" in obj) return obj._id;
            if ("key" in obj) return obj.key;
            if ("name" in obj) return obj.name;
          }
          return `#index: ${idx}`;
        },
      });
      const delta = diffpatcher.diff(left, right);
      setDelta(delta);
      if (!delta) setError("JSON документы идентичны");
    } catch (e) {
      setError(`Ошибка парсинга JSON: ${e.message}`);
      setDelta(null);
    }
  };

  const runScriptTags = (htmlString) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => {
      const scriptContent = script.textContent;
      if (scriptContent.trim()) {
        try {
          eval(scriptContent);
        } catch (e) {
          console.error('Ошибка построения стрелок', e);
        }
      }
    });
  }

  const renderDiff = () => {
    if (!delta) return null;
    const format = htmlFormatter.format(delta);
    htmlFormatter.hideUnchanged();
    runScriptTags(format);
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
          <label className="json-label">Исходный JSON</label>
          <div className="textarea-wrapper">
            <textarea
              value={leftJson}
              onChange={(e) => setLeftJson(e.target.value)}
              placeholder="Вставьте первый JSON здесь..."
              className="json-textarea"
            />
            <CopyIdButton jsonString={leftJson} />
          </div>
        </div>
        <div className="json-input">
          <label className="json-label">Изменённый JSON</label>
          <div className="textarea-wrapper">
            <textarea
              value={rightJson}
              onChange={(e) => setRightJson(e.target.value)}
              placeholder="Вставьте второй JSON здесь..."
              className="json-textarea"
            />
            <CopyIdButton jsonString={rightJson} />
          </div>
        </div>
      </div>
      <button className="compare-btn" onClick={compareJson}>Сравнить</button>
      {error && <div className="error">{error}</div>}
      {renderDiff()}
    </div>
  );
}

export default App;
