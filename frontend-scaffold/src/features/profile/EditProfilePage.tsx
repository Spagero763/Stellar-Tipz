import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";
import Loader from "@/components/ui/Loader";
import { useProfile } from "@/hooks";
import EditProfileForm from "./EditProfileForm";

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isRegistered, loading } = useProfile();

  React.useEffect(() => {
    if (!loading && (!isRegistered || !profile)) {
      navigate("/profile", { replace: true });
    }
  }, [isRegistered, profile, loading, navigate]);

  // Show loading state while checking profile
  if (loading) {
    return (
      <PageContainer
        maxWidth="md"
        className="flex items-center justify-center min-h-[60vh]"
      >
        <Loader />
      </PageContainer>
    );
  }

  // If user has no profile, we are already redirecting above
  if (!isRegistered || !profile) {
    return null;
  }

  return (
    <PageContainer maxWidth="md" className="space-y-6 py-10">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:underline transition-all"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>
      </div>

      {/* Page title and description */}
      <div>
        <h1 className="text-4xl font-black mb-2">Edit Profile</h1>
        <p className="text-gray-600">
          Update your profile information to keep it fresh and engaging.
        </p>
      </div>

      {/* Edit form */}
      <EditProfileForm profile={profile} />
    </PageContainer>
  );
};

export default EditProfilePage;
