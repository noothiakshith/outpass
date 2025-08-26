import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import { Send, AlertCircle } from 'lucide-react';

const CreateOutpass = () => {
  const navigate = useNavigate();
  const { createOutpass } = useData();
  const [formData, setFormData] = useState({
    reason: '',
    type: 'CASUAL'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createOutpass(formData);
      toast.success('Outpass request submitted successfully!');
      navigate('/outpass/history');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create outpass');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Outpass Request</h1>
        <p className="text-gray-600">Submit a new outpass request for approval</p>
      </div>

      <div className="card p-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Outpass requests are valid only for today</li>
                  <li>Your class teacher will review first, then HOD</li>
                  <li>Once approved, you'll receive an OTP valid for 5 hours</li>
                  <li>Emergency outpasses may be processed faster</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Outpass Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input mt-1"
              required
            >
              <option value="CASUAL">Casual</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Emergency outpasses are for urgent situations only
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Outpass
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              value={formData.reason}
              onChange={handleChange}
              className="input mt-1"
              placeholder="Please provide a detailed reason for your outpass request..."
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Be specific about your reason to help with approval
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOutpass;