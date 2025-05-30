import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Document {
  id: number;
  title: string;
  uploaded_at: string;
}

const DocumentListPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const token = localStorage.getItem("accessToken");
      console.log("Token used for request:", token);
      const res = await axios.get("http://127.0.0.1:8000/api/documents/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(res.data);
    };

    fetchDocs();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this document?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("accessToken");

    try {
      await axios.delete(`http://127.0.0.1:8000/api/documents/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove deleted document from state to update UI
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">📄 Your Documents</h2>
      {documents.length === 0 ? (
        <p>
          No documents found.{" "}
          <Link to="/upload" className="text-blue-600 underline">
            Upload one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-4">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="border rounded p-4 bg-white shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/chat/${doc.id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Chat
                </Link>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentListPage;
