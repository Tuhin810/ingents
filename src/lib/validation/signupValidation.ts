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

interface ValidationErrors {
  [key: string]: string;
}

export const validateUserDetails = (
  data: UserDetailsFormData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Full name validation
  if (!data.full_name.trim()) {
    errors.full_name = "Full name is required";
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password =
      "Password must contain at least one lowercase letter, one uppercase letter, and one number";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Profile picture validation (optional)
  if (data.profile_picture) {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(data.profile_picture.type)) {
      errors.profile_picture =
        "Please upload a valid image file (JPEG, PNG, or WebP)";
    } else if (data.profile_picture.size > 5 * 1024 * 1024) {
      // 5MB limit
      errors.profile_picture = "Image file size must be less than 5MB";
    }
  }

  return errors;
};

export const validateCompanyDetails = (
  data: CompanyDetailsFormData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Company name validation
  if (!data.company_name.trim()) {
    errors.company_name = "Company name is required";
  } else if (data.company_name.trim().length < 2) {
    errors.company_name = "Company name must be at least 2 characters";
  }

  // Website validation (optional)
  if (data.website && data.website.trim()) {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(data.website)) {
      errors.website = "Please enter a valid website URL";
    }
  }

  // Phone validation (optional)
  if (data.phone && data.phone.trim()) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  // Address validation (optional)
  if (data.address && data.address.trim().length > 500) {
    errors.address = "Address must be less than 500 characters";
  }

  // Description validation (optional)
  if (data.description && data.description.trim().length > 500) {
    errors.description = "Description must be less than 500 characters";
  }

  // Company logo validation (optional)
  if (data.company_logo) {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(data.company_logo.type)) {
      errors.company_logo =
        "Please upload a valid image file (JPEG, PNG, or WebP)";
    } else if (data.company_logo.size > 5 * 1024 * 1024) {
      // 5MB limit
      errors.company_logo = "Logo file size must be less than 5MB";
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors: ValidationErrors): string | null => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};
