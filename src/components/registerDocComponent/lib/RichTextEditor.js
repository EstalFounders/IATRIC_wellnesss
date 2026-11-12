// Small controlled rich-text field used by the prescription form for BOTH the
// "Advices" (card 4) and the "Notes" box - both are printed on the sheet as HTML
// (the PDF is captured with html2canvas, so no server/model change is involved).
// That means:
//
//   - format buttons use `document.execCommand` and `onMouseDown` +
//     `preventDefault()` so the editor selection is still alive when clicked;
//   - the value that leaves this component is always sanitised
//     (`lib/adviceHtml.js`) and the plain text is handed to the caller as a
//     second argument, because the form still mirrors `advices` / `notes` for
//     older code;
//   - paste is forced to plain text (Word/Chrome markup would otherwise smuggle
//     fonts, colours and `<o:p>` tags into the PDF);
//   - the DOM is uncontrolled while typing (the parent value only overwrites it
//     when it differs), otherwise the caret jumps on every keystroke.
import { useCallback, useEffect, useRef, useState } from "react";
import { BiTable } from "react-icons/bi";
import styles from "../css/Prescription.module.css";
import {
  adviceHtmlToPlainText,
  buildAdviceTableHtml,
  escapeAdviceHtml,
  sanitizeAdviceHtml,
} from "./adviceHtml";

const DEFAULT_ROWS = 2;
const DEFAULT_COLS = 2;
const MIN_CELLS = 1;
const MAX_CELLS = 6;

const clampCells = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(MAX_CELLS, Math.max(MIN_CELLS, parsed));
};

// `execCommand` is deprecated but still implemented everywhere and is the only
// zero-dependency way to keep a caret/selection intact.
const exec = (command, value = null) => {
  if (typeof document === "undefined" || !document.execCommand) return false;
  try {
    return document.execCommand(command, false, value);
  } catch (error) {
    return false;
  }
};

const RichTextEditor = ({
  id = "rich-text",
  value = "",
  onChange,
  maxLength = 500,
  placeholder = "",
}) => {
  const editorRef = useRef(null);
  // Last HTML we handed to the parent - used to ignore our own value echo.
  const lastValueRef = useRef(null);
  // Last valid (html, text) pair, restored when the length limit is exceeded.
  const lastGoodRef = useRef({ html: "", text: "" });
  // Caret remembered before the toolbar/popover steals the focus.
  const savedRangeRef = useRef(null);

  const [isEmpty, setIsEmpty] = useState(
    () => adviceHtmlToPlainText(sanitizeAdviceHtml(value)) === "",
  );
  const [tableOpen, setTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState(String(DEFAULT_ROWS));
  const [tableCols, setTableCols] = useState(String(DEFAULT_COLS));

  const rememberSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection =
      typeof window !== "undefined" ? window.getSelection() : null;
    if (!editor || !selection || selection.rangeCount === 0) return;
    if (!editor.contains(selection.anchorNode)) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    const editor = editorRef.current;
    if (!editor || !range) return false;
    // A range pointing at removed nodes can't be restored.
    if (!editor.contains(range.commonAncestorContainer)) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }, []);

  // Emits the current DOM content upwards: sanitised HTML + plain-text mirror.
  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = sanitizeAdviceHtml(editor.innerHTML);
    const text = adviceHtmlToPlainText(html);
    lastValueRef.current = html;
    lastGoodRef.current = { html, text };
    setIsEmpty(text === "");
    if (onChange) onChange(html, text);
  }, [onChange]);

  // External value (Clear form, preset chip, reset) -> overwrite the DOM only
  // when it really differs, so typing never re-positions the caret.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const safe = sanitizeAdviceHtml(value || "");
    if (safe === lastValueRef.current) return;
    lastValueRef.current = safe;
    if (editor.innerHTML !== safe) editor.innerHTML = safe;
    const text = adviceHtmlToPlainText(safe);
    lastGoodRef.current = { html: safe, text };
    setIsEmpty(text === "");
  }, [value]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = sanitizeAdviceHtml(editor.innerHTML);
    const text = adviceHtmlToPlainText(html);

    if (maxLength && text.length > maxLength) {
      // Over the limit: drop the extra keystroke instead of truncating mid-tag.
      editor.innerHTML = lastGoodRef.current.html;
      setIsEmpty(lastGoodRef.current.text === "");
      return;
    }

    lastValueRef.current = html;
    lastGoodRef.current = { html, text };
    setIsEmpty(text === "");
    if (onChange) onChange(html, text);
  };

  const applyFormat = (command) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // Prefer <b>/<u> over inline styles - the sanitiser keeps tags, not styles.
    exec("styleWithCSS", false);
    exec(command);
    emitChange();
    rememberSelection();
  };

  // Plain text only: never let pasted markup reach the DOM.
  const handlePaste = (event) => {
    const editor = editorRef.current;
    if (!editor) return;
    event.preventDefault();
    const clipboard = event.clipboardData || window.clipboardData;
    const pasted = clipboard ? clipboard.getData("text/plain") : "";
    if (!pasted) return;
    const html = escapeAdviceHtml(pasted.replace(/\r\n?/g, "\n")).replace(
      /\n/g,
      "<br>",
    );
    const inserted = exec("insertHTML", html);
    if (!inserted) editor.insertAdjacentHTML("beforeend", html);
    handleInput();
  };

  const insertTable = () => {
    const editor = editorRef.current;
    const rows = clampCells(tableRows, DEFAULT_ROWS);
    const cols = clampCells(tableCols, DEFAULT_COLS);
    const marker = `advice-tmp-${Date.now()}`;
    setTableOpen(false);
    if (!editor) return;

    editor.focus();
    restoreSelection();

    const html = buildAdviceTableHtml(rows, cols, marker);
    const inserted = exec("insertHTML", html);
    if (!inserted) editor.insertAdjacentHTML("beforeend", html);

    // Drop the caret into the first cell so the doctor can type straight away.
    const table = editor.querySelector(`table[data-advice-tmp="${marker}"]`);
    if (table) {
      table.removeAttribute("data-advice-tmp");
      const cell = table.querySelector("td, th");
      const selection = window.getSelection();
      if (cell && selection) {
        const range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        savedRangeRef.current = range.cloneRange();
      }
    }

    editor.focus();
    handleInput();
  };

  return (
    <div className={styles.adviceShell}>
      <div
        className={styles.adviceToolbar}
        role="toolbar"
        aria-label="Text formatting"
      >
        <button
          type="button"
          className={styles.adviceToolBtn}
          title="Bold (select a word first)"
          aria-label="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("bold")}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={styles.adviceToolBtn}
          title="Underline (select a word first)"
          aria-label="Underline"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("underline")}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </button>
        <button
          type="button"
          className={styles.adviceToolBtn}
          title="Insert a table"
          aria-label="Insert table"
          aria-expanded={tableOpen}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            rememberSelection();
            setTableOpen((open) => !open);
          }}
        >
          <BiTable size={14} />
          Table
        </button>

        {tableOpen && (
          <div className={styles.adviceTablePopover}>
            <label className={styles.adviceTablePopoverField}>
              Rows
              <input
                type="number"
                min={MIN_CELLS}
                max={MAX_CELLS}
                value={tableRows}
                className={styles.adviceTablePopoverInput}
                onChange={(event) => setTableRows(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    insertTable();
                  }
                }}
              />
            </label>
            <label className={styles.adviceTablePopoverField}>
              Cols
              <input
                type="number"
                min={MIN_CELLS}
                max={MAX_CELLS}
                value={tableCols}
                className={styles.adviceTablePopoverInput}
                onChange={(event) => setTableCols(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    insertTable();
                  }
                }}
              />
            </label>
            <button
              type="button"
              className={`${styles.adviceToolBtn} ${styles.adviceTableInsert}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={insertTable}
            >
              Insert
            </button>
            <button
              type="button"
              className={styles.adviceToolBtn}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setTableOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div
        id={id}
        ref={editorRef}
        className={styles.adviceEditor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-empty={isEmpty ? "true" : "false"}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onMouseUp={rememberSelection}
        onKeyUp={rememberSelection}
        onBlur={rememberSelection}
      />
    </div>
  );
};

export default RichTextEditor;
