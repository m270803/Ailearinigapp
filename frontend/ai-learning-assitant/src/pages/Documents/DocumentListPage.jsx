import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentCard from '../../components/documents/DocumentCard';
import toast from 'react-hot-toast';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle); // FIX: was "title, uploadTitle" (both inside the string)

    try {
      await documentService.uploadDocument(formData); // FIX: was uploadDocumnet (typo)
      toast.success("Document uploaded successfully"); // FIX: was toast.sucess (typo)
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectDoc._id);
      toast.success(`'${selectDoc.title}' deleted.`); // FIX: was toast.sucess (typo)
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg shadow-slate-200 mb-6">
              <FileText
                className='w-10 h-10 text-slate-500'
                strokeWidth={1.5}
              />
            </div>
            <h3 className='text-xl font-medium text-slate-900 mb-2'>
              No documents yet
            </h3>
            <p className='text-sm text-slate-500 mb-6'>
              You have not uploaded any documents yet.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg transition-colors duration-200 ease-in-out'
            >
              <Plus
                className='w-4 h-4'
                strokeWidth={2.5}
              />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          {/* header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
                My Documents
              </h1>
              <p className="text-slate-500 text-sm">
                Manage and organize your learning materials
              </p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          </div>
          {renderContent()}
        </div>

        {/* Upload Modal — FIX: was always rendered, now conditional */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-8">
              {/* close button */}
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all duration-200"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* modal header */}
              <div className="mb-6">
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                  Upload New Document
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Add a PDF document to your library
                </p>
              </div>

              {/* upload form */}
              <form onSubmit={handleUpload} className="space-y-5">
                {/* title input */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Document Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-slate-300 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter document title"
                  />
                </div>

                {/* file upload area — FIX: restored broken JSX structure */}
                <div className="space-y-2">
                  <label htmlFor="file-upload" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    PDF File
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:border-emerald-500 transition-colors duration-200 ease-in-out">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-10 px-6 pointer-events-none">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg shadow-slate-200 mb-4">
                        <Upload
                          className="w-7 h-7 text-emerald-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {uploadFile ? uploadFile.name : "Click to upload PDF"}
                      </p>
                      <p className="text-xs text-slate-500">
                        PDF only, max 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={uploading}
                    className="flex-1 h-11 px-4 border-2 border-slate-300 rounded-xl bg-slate-50/50 text-slate-700 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 h-11 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal — FIX: was completely missing */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all duration-200"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
                <Trash2 className="w-7 h-7 text-red-500" strokeWidth={1.5} />
              </div>

              <h2 className="text-xl font-medium text-slate-900 mb-2">
                Delete Document
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">"{selectDoc?.title}"</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="flex-1 h-11 px-4 border-2 border-slate-300 rounded-xl bg-slate-50/50 text-slate-700 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 h-11 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentListPage;