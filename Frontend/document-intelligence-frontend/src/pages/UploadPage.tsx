import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Handler for dropped files
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setMessage(""); // Clear message on new file drop
    }
  }, []);

  // Setup react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!file) return setMessage("Please select a file.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://127.0.0.1:8000/api/documents/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Document uploaded successfully!");
      setTitle("");
      setFile(null);
    } catch (err) {
      setMessage("Upload failed. Check your file and try again.");
    }
  };

  return (
    
    <div className="max-w-xl mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Document Title"
          className="w-full p-2 border mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div
          {...getRootProps()}
          className={`w-full p-6 mb-4 border-2 border-dashed rounded cursor-pointer text-center ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-gray-700">Selected file: {file.name}</p>
          ) : (
            <p className="text-gray-500">
              Drag & drop a PDF, DOCX, or TXT file here, or click to select
            </p>
          )}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Upload
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}

      <Link
        to="/documents"
        className="inline-block mt-4 text-blue-600 hover:underline"
      >
        View Uploaded Documents
      </Link>
    </div>
  );
};

export default UploadPage;
