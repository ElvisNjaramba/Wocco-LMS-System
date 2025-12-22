import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UploadUsersExcel() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("Please upload a valid Excel (.xlsx) file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("superuser/upload-users/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Created users:", res.data.created_users);
      navigate("/superuser/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error uploading Excel file");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border rounded-xl shadow-sm p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Upload Employees via Excel
          </h1>
          <p className="text-gray-500 mt-1">
            Quickly onboard multiple employees by uploading an Excel (.xlsx) file.
          </p>
        </div>

        {/* Upload Box */}
        <div
          onClick={!loading ? handleClick : undefined}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition
            ${loading
              ? "bg-gray-50 border-gray-300 cursor-not-allowed"
              : "border-green-400 hover:bg-green-50 cursor-pointer"}
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">📄</div>

            <p className="font-medium text-gray-700">
              {loading ? "Uploading file..." : "Click to upload Excel file"}
            </p>

            <p className="text-sm text-gray-500">
              Accepted format: <span className="font-mono">.xlsx</span>
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Processing Excel... please wait
              </div>
            )}
          </div>
        </div>

        {/* Hidden input */}
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Footer note */}
        <p className="mt-6 text-sm text-gray-500">
          Each row in the Excel file should include employee details such as
          name, position, and department.
        </p>
      </div>
    </div>
  );
}
