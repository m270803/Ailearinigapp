import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Tabs from '../../components/common/Tabs';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentById(id);
        console.log("Fetched document details:", data); // Check shape
        setDocument(data);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch document details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Safely extract the document properties based on possible API structures
  const docData = document?.data || document?.document || document;
  const filePath = docData?.filePath || docData?.fileUrl || docData?.url;

  const getPdfUrl = () => {
    if (!filePath) {
      return '';
    }

    // If the path from the DB already includes the http:// domain, use it directly
    if (filePath.startsWith('http')) {
      return filePath;
    }

    // Otherwise attach the base backend URL
    const baseUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const renderContent = () => {
    if (!filePath) {
      return <div className="text-center p-8 text-slate-500"> PDF not available </div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <span className="text-sm font-semibold text-slate-700">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        <div className="w-full h-[75vh] bg-slate-100 relative">
          <iframe
            src={pdfUrl}
            title="PDF viewer"
            className="w-full h-full border-0 absolute inset-0"
            style={{ colorScheme: 'light' }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />
  }

  const renderPlaceholder = (title) => (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200 text-center p-8">
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">This feature is coming soon.</p>
    </div>
  );

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderPlaceholder('AI Actions') },
    { name: 'Flashcards', label: 'Flashcards', content: renderPlaceholder('Flashcards') },
    { name: 'Quizzes', label: 'Quizzes', content: renderPlaceholder('Quizzes') },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  if (!document) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h3 className="text-xl font-medium text-slate-900 mb-2">Document not found</h3>
          <p className="text-slate-500 mb-6">The document you're looking for doesn't exist or has been removed.</p>
          <Link to="/documents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <ArrowLeft size={16} />
            Back to Documents
          </Link>
        </div>
      </AppLayout>
    );
  }

  const docTitle = docData?.title || 'Document Detail';

  return (
    <AppLayout>
      <div className="min-h-screen pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link to="/documents" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Documents
            </Link>
          </div>

          <PageHeader title={docTitle} subtitle="View and interact with your document" />

          <div className="mt-4">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentDetailPage;