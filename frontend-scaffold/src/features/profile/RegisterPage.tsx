import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import AvatarUpload from './AvatarUpload';

const RegisterPage: React.FC = () => {
  const [ipfsHash, setIpfsHash] = useState<string>('');

  return (
    <ErrorBoundary>
      <div className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-black mb-2">Create Your Profile</h1>
          <p className="text-gray-600 mb-10">
            Register once on-chain. Supporters will find you at {import.meta.env.VITE_APP_URL || window.location.origin}/@you.
          </p>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
            <AvatarUpload onUploadSuccess={(hash) => setIpfsHash(hash)} />
            {ipfsHash && <p className="text-sm text-green-600 mt-2 text-center">Image uploaded successfully!</p>}
          </div>
          <RegisterForm initialImageUrl={ipfsHash} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RegisterPage;
