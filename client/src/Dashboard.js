import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import "./Dashboard.css";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await fetch("https://google-docs-backend-tbs9.onrender.com/documents");
    const data = await res.json();
    setDocuments(data);
  };

  const createNewDoc = async () => {
    const id = uuidV4();
    await fetch("https://google-docs-backend-tbs9.onrender.com/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    navigate(`/documents/${id}`);
  };

  const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this document?");
  if (!confirm) return;

  try {
    const response = await fetch(`https://google-docs-backend-tbs9.onrender.com/documents/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", result);

    if (response.ok && result.success) {
      fetchDocuments(); // refresh
    } else {
      alert("Failed to delete document.");
    }
  } catch (error) {
    console.error("Delete error (catch block):", error);
    alert("Something went wrong while deleting.");
  }
};


  const handleRename = async (id, currentName) => {
    const newName = prompt("Rename document:", currentName);
    if (!newName || newName === currentName) return;

    await fetch(`https://google-docs-backend-tbs9.onrender.com/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    fetchDocuments(); // refresh
  };

  return (
    <div className="dashboard-container">
      <h1>📄 My Documents</h1>
      <button className="create-btn" onClick={createNewDoc}>
        ➕ Create New Document
      </button>

      <div className="documents-grid">
        {documents.map(doc => (
          <div
            key={doc._id}
            className="doc-card"
            onClick={() => navigate(`/documents/${doc._id}`)}
          >
            <div className="doc-title">{doc.name}</div>
            <div className="doc-meta">
              <small>ID: {doc._id.slice(0, 6)}...</small>
              <div className="action-buttons">
                <button
                  className="rename-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(doc._id, doc.name);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc._id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
