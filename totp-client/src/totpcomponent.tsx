import React, { useState } from 'react';
import axios from 'axios';

const TOTPClient = ({ serverUrl = '' }) => {
    const [email, setEmail] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');


    const handleRegister = async () => {


        try {
            const json_data = JSON.stringify({ email });
            console.log(json_data);


            const response = await axios.post(`${serverUrl}/user/register`, json_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            );


            console.log(response);
            setQrCodeUrl(response.data.qrCodeUrl);
            setSecret(response.data.secret || ''); // Only available in development
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Check the console for more details.');
        }
    };

    const handleVerify = async () => {
        try {
            const response = await axios.post(
                `${serverUrl}/user/verify`,
                JSON.stringify({ email, token }),
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            if (response.data.verified) {
                setVerificationMessage('Token verified successfully!');
            } else {
                setVerificationMessage('Invalid token. Please try again.');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            alert('Verification failed. Check the console for more details.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">TOTP Client</h1>

            <div className="mb-4">
                <label className="block mb-2 font-semibold">Email:</label>
                <input
                    type="email"
                    className="p-2 border rounded w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />
            </div>

            <button
                onClick={handleRegister}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                Register
            </button>

            {qrCodeUrl && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Scan this QR Code:</h2>
                    <img src={qrCodeUrl} alt="TOTP QR Code" className="border rounded" />
                    {secret && (
                        <p className="mt-2 text-sm text-gray-600">Secret (dev only): {secret}</p>
                    )}
                </div>
            )}

            <div className="mb-4">
                <label className="block mb-2 font-semibold">Token:</label>
                <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter the TOTP token"
                />
            </div>

            <button
                onClick={handleVerify}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                Verify Token
            </button>

            {verificationMessage && (
                <p className="mt-4 font-semibold">
                    {verificationMessage}
                </p>
            )}
        </div>
    );
};

export default TOTPClient;
