import { useRef, useState } from "react";

const useFormData = <T extends object>({ initialValues }: { initialValues: T }) => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const fileInputRef = useRef<any>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input for profile image
  const handleFileChange = (e: any) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      // For now, just store the file name since we're not actually uploading
      setFormData((prev) => ({
        ...prev,
        profile: e.target.files[0].name,
      }));
    }
  }

  // Trigger file input click
  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  // Reset form data
  const reset = () => {
    setFormData(initialValues);
  };

  return {
    formData,
    profileImage,
    fileInputRef,
    handleChange,
    handleFileChange,
    reset,
    setProfileImage,
    handleProfileClick,
  };
};

export default useFormData;
