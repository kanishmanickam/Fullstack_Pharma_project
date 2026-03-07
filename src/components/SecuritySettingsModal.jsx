import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaTimes, FaQrcode, FaCheckCircle, FaSpinner, FaLock } from 'react-icons/fa';

const SecuritySettingsModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 0 = already enabled, 1 = init, 2 = show QR, 3 = verify
    const [setupStep, setSetupStep] = useState(currentUser?.isTwoFactorEnabled ? 0 : 1);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [tokenInput, setTokenInput] = useState('');

    const initiateSetup = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.post('/auth/2fa/setup');
            if (res.data.success) {
                setQrCodeUrl(res.data.qrCodeUrl);
                setSecretKey(res.data.secret);
                setSetupStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initiate 2FA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifySetup = async () => {
        if (tokenInput.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.post('/auth/2fa/verify-setup', {
                token: tokenInput,
                secret: secretKey
            });
            if (res.data.success) {
                setSuccess('Two-Factor Authentication is now enabled!');
                setSetupStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid 2FA token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

                {/* Header */}
                <div className="bg-primary-50 px-6 py-4 flex items-center justify-between border-b border-primary-100">
                    <div className="flex items-center gap-3">
                        <FaShieldAlt className="text-primary-600 text-xl" />
                        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
                            {error}
                        </div>
                    )}

                    {setupStep === 0 && (
                        <div className="text-center py-4">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
                                <FaLock className="text-green-600 text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Two-Factor Authentication is Enabled</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Your account is currently protected by an authenticator application.
                            </p>
                            <button
                                onClick={() => setSetupStep(1)}
                                className="w-full bg-primary-50 text-primary-700 py-3 rounded-xl font-semibold hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 shadow-sm border border-primary-200"
                            >
                                Change Authenticator Device
                            </button>
                        </div>
                    )}

                    {setupStep === 1 && (
                        <div className="text-center py-4">
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaShieldAlt className="text-primary-600 text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {currentUser?.isTwoFactorEnabled ? 'Reset Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                {currentUser?.isTwoFactorEnabled
                                    ? 'Warning: This will invalidate your old authenticator codes. You will need to re-scan the QR code.'
                                    : 'Protect your MediStock AI account with an additional layer of security. You\'ll need an authenticator app like Google Authenticator or Authy.'}
                            </p>
                            <button
                                onClick={initiateSetup}
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                {loading ? <FaSpinner className="animate-spin" /> : 'Start Setup'}
                            </button>
                            {currentUser?.isTwoFactorEnabled && (
                                <button
                                    onClick={() => setSetupStep(0)}
                                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    )}

                    {setupStep === 2 && (
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Scan QR Code</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Scan this QR code with your authenticator app to link your account.
                            </p>

                            <div className="bg-white border-2 border-gray-100 p-2 rounded-xl inline-block mb-4 shadow-sm">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                            </div>

                            <p className="text-xs text-gray-500 mb-6">
                                Manual Key: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">{secretKey}</span>
                            </p>

                            <div className="text-left mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verify Setup Code
                                </label>
                                <input
                                    type="text"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-center tracking-widest text-xl font-mono text-gray-800"
                                    maxLength="6"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSetupStep(1)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={verifySetup}
                                    disabled={loading || tokenInput.length !== 6}
                                    className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {setupStep === 3 && (
                        <div className="text-center py-6">
                            <div className="text-green-500 text-5xl mb-4 flex justify-center">
                                <FaCheckCircle className="drop-shadow-sm" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                {success}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 shadow-sm"
                            >
                                Close Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsModal;
