import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import "./index.css";

const SAVE_INTERVAL_MS = 2000;

const Editor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  // 1. Connect socket
  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // 2. Load document when both socket + editor available
  useEffect(() => {
    if (!socket || !quill) return;

    const loadHandler = (document) => {
      quill.setContents(document);
      quill.enable();
    };

    socket.once("load-document", loadHandler);
    socket.emit("get-document", documentId);

    return () => {
      socket.off("load-document", loadHandler);
    };
  }, [socket, quill, documentId]);

  // 3. Auto-save every 2s
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, quill]);

  // 4. Receive changes from others
  useEffect(() => {
    if (!socket || !quill) return;

    const receiveChanges = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", receiveChanges);

    return () => {
      socket.off("receive-changes", receiveChanges);
    };
  }, [socket, quill]);

  // 5. Send user changes to others
  useEffect(() => {
    if (!socket || !quill) return;

    const textChangeHandler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", textChangeHandler);

    return () => {
      quill.off("text-change", textChangeHandler);
    };
  }, [socket, quill]);

  // 6. Mount Quill editor
  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, { theme: "snow" });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
};

export default Editor;
