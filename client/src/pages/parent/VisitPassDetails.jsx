import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import PassCard from '../../components/PassCard';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VisitPassDetails = () => {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/visit-passes/${id}`);
        setPass(res.data);
      } catch (error) {
        console.error('Error fetching visit pass details:', error);
        toast.error('Failed to load visit pass details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-600">Visit pass details not found</h3>
        <Link to="/parent" className="text-blue-400 hover:text-blue-300 mt-2 block font-semibold">
          Go Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print text-left">
        <Link to="/parent/history" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      </div>

      <div className="flex flex-col items-center">
        <PassCard pass={pass} type="visitpass" />
      </div>
    </div>
  );
};

export default VisitPassDetails;
