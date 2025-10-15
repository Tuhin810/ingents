"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateUserDetails,
  validateCompanyDetails,
  hasValidationErrors,
} from "@/lib/validation/signupValidation";
import AuthContext from "@/contexts/authContext/authContext";

interface UserDetailsFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  profile_picture?: File | null;
}

interface CompanyDetailsFormData {
  company_name: string;
  website?: string;
  phone?: string;
  address?: string;
  description?: string;
  company_logo?: File | null;
}

export function useSignup() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);


  const [userDetails, setUserDetails] = useState<UserDetailsFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: null,
  });

  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsFormData>({
    company_name: "",
    website: "",
    phone: "",
    address: "",
    description: "",
    company_logo: null,
  });

  const handleUserDetailsChange = (data: Partial<UserDetailsFormData>) => {
    setUserDetails((prev) => ({ ...prev, ...data }));
    // Clear errors for changed fields
    Object.keys(data).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  const handleCompanyDetailsChange = (
    data: Partial<CompanyDetailsFormData>
  ) => {
    setCompanyDetails((prev) => ({ ...prev, ...data }));
    // Clear errors for changed fields
    Object.keys(data).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  const goNext = () => {
    if (currentStep === 1) {
      const validationErrors = validateUserDetails(userDetails);
      if (hasValidationErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    }
  };

  const goPrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setErrors({});
    }
  };

  const submit = async () => {
    const validationErrors = validateCompanyDetails(companyDetails);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setErrors({});

    try {
      const formData = new FormData();
      const { confirmPassword, ...userDetailsForBackend } = userDetails;
      formData.append("user_details", JSON.stringify(userDetailsForBackend));
      formData.append("company_details", JSON.stringify(companyDetails));

      if (userDetails.profile_picture) {
        formData.append("user_avatar", userDetails.profile_picture);
      }
      if (companyDetails.company_logo) {
        formData.append("company_logo", companyDetails.company_logo);
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      const { user } = data;
      setUser(user);

      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      console.error("Signup error:", error);
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    isLoading,
    errors,
    apiError,
    userDetails,
    companyDetails,
    handleUserDetailsChange,
    handleCompanyDetailsChange,
    goNext,
    goPrevious,
    submit,
    setCurrentStep,
  } as const;
}
