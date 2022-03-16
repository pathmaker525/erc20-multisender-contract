import { useEffect, useRef } from "react"
import FadeIn from "react-fade-in/lib/FadeIn"
import { useCodeMirror } from "@uiw/react-codemirror"

import "./style.scss"

const MultiSender = () => {
  const editor = useRef()
  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions: [],
    value: "",
    theme: "dark",
    width: "100%",
    height: "320px",
  })

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current)
    }
  }, [editor.current])

  return (
    <div className="multisender flex">
      <FadeIn className="multisender-wrapper container flex flex-column">
        <h1>SaFuTrendz MultiSender</h1>
        <div className="multisender-main grid">
          <div className="multisender-main-settings grid">
            <span>Token: BUSD</span>
            <span>Balance: 1500</span>
            <input
              type="text"
              className="rounded-sm shadowed"
              placeholder="Address of token to send"
            />
          </div>
          <div className="multisender-main-editor grid">
            <span>List of Addresses in CSV</span>
            <span>Show Sample CSV</span>
            <div
              className="multisender-main-editor-main flex rounded-md shadowed"
              ref={editor}
            />
            <input type="file" name="upload csv" />
          </div>
          <div className="multisender-main-send flex">
            <button>Approve</button>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

export default MultiSender
