import { useState } from "react";

const useFormData = <T extends object>({ initialValues }: { initialValues: T }) => {
  const [formData, setFormData] = useState<T>(initialValues);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form data
  const reset = () => {
    setFormData(initialValues);
  };

  return {
    formData,
    handleChange,
    reset,
  };
};

export default useFormData;
