/**
 * @file Editor.jsx
 * @module Editor
 * @description React component for Editor. Handles UI rendering, local state, and event interactions.
 */

import { useRef, useEffect } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'image'],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['clean'],
]

/**
 * Editor — Rich text editor using React Quill
 * Props:
 *   value: string (HTML)
 *   onChange: (html: string) => void
 *   placeholder: string
 *   readOnly: boolean
 *   className: string
 */
export default function Editor({
  value,
  onChange,
  placeholder = 'Start writing…',
  readOnly = false,
  className = '',
}) {
  const quillRef = useRef(null)

  return (
    <div className={`notion-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        modules={{
          toolbar: readOnly ? false : TOOLBAR_OPTIONS,
          clipboard: { matchVisual: false },
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'blockquote', 'code-block',
          'list', 'bullet', 'indent', 'check',
          'link', 'image',
          'color', 'background',
          'align',
        ]}
      />
    </div>
  )
}
