import { useState } from 'react';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, User, Calendar, Clock } from 'lucide-react';

const VerifyOTP = () => {
  const { verifyOTP } = useData();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter an OTP');
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      const result = await verifyOTP(otp.trim());
      setVerificationResult(result);
      toast.success('OTP verified successfully - Student can exit');
      setOtp('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP or verification failed');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOtp('');
    setVerificationResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security Verification</h1>
        <p className="text-gray-600">Verify student OTP for campus exit</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center mb-4">
          <Shield className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">OTP Verification</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter Student OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input mt-1 text-center text-lg font-mono"
              placeholder="123456"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit OTP provided by the student
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify OTP
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-green-900">Verification Successful</h2>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-800 font-medium">
              {verificationResult.message}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Student Information</h3>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {verificationResult.student.fullName}
                  </p>
                  <p className="text-xs text-gray-500">Full Name</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verificationResult.student.rollNumber}
                </p>
                <p className="text-xs text-gray-500">Roll Number</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verificationResult.student.branch}
                </p>
                <p className="text-xs text-gray-500">Branch</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verificationResult.student.department}
                </p>
                <p className="text-xs text-gray-500">Department</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Approval Details</h3>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verificationResult.approvedByTeacher.name}
                </p>
                <p className="text-xs text-gray-500">Approved by Teacher</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verificationResult.approvedByHod.name}
                </p>
                <p className="text-xs text-gray-500">Approved by HOD</p>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(verificationResult.validUntil).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">Valid Until</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(verificationResult.otpExpiresAt).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">OTP Expires At</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Student exit has been marked. They can now leave the campus.
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Verification Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Ask the student to provide their 6-digit OTP</li>
          <li>• Enter the OTP exactly as provided</li>
          <li>• Verify the student's identity matches the displayed information</li>
          <li>• OTPs are valid for 5 hours from approval time</li>
          <li>• Each OTP can only be used once for exit verification</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifyOTP;