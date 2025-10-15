/* eslint-disable @typescript-eslint/no-explicit-any */
import { Payload } from "@/types/api/api.types";
import API from "../api";

const initialRoute = "auth";

export const signupUser = async (payload: FormData): Promise<any> => {
  try {
    console.log("🚀 Calling signup API...");
    const response = await API.post(`/${initialRoute}/signup`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("✅ Signup successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Signup failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

export const loginUser = async (payload: object): Promise<any> => {
  try {
    console.log("🚀 Calling login API...");
    const response = await API.post(`/${initialRoute}/login`, payload);
    console.log("✅ Login successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const verifyToken = async (): Promise<any> => {
  try {
    console.log("🚀 Calling verify token API...");
    const token = typeof window !== 'undefined' ? localStorage.getItem("@token") : null;
    
    const response = await API.post("/auth/verify-token", {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    console.log("✅ Token verification successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Token verification failed:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Token verification failed"
    );
  }
};

export const getOtp = async (payload: Payload) => {
  try {
    console.log("🚀 Calling get OTP API...");
    const response = await API.post(`/${initialRoute}/get-otp`, payload);
    console.log("OTP API response:", response.data);

    const { result: otp, userId, message } = response.data || {};

    if (otp) {
      return { otp, userId };
    }

    throw new Error(message || "OTP result not found");
  } catch (error: any) {
    console.error("OTP Error:", error);
    throw error;
  }
};

export const googleSignUp = async (payload: any) => {
  try {
    console.log("🚀 Calling google signup API...");
    const response = await API.post(`/${initialRoute}/google-signup`, payload);
    console.log("✅ Google signup successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Google signup failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Google signup failed");
  }
};

export const createUsers = async (payload: FormData): Promise<any> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("@token") : null;
    if (!token) {
      throw new Error("Token not found");
    }
    console.log("🚀 Calling create user API...");
    const response = await API.post(`/${initialRoute}/create-user`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("✅ User creation successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ User creation failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "User creation failed");
  }
};

export const getUsers = async (filter: any): Promise<any> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("@token") : null;
    if (!token) {
      throw new Error("Token not found");
    }

    console.log("🚀 Calling get users API...");
    const queryString = new URLSearchParams(filter).toString();
    const response = await API.get(`/${initialRoute}/get-user?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Users fetch successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Users fetch failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Users fetch failed");
  }
};

export const logoutUser = async (): Promise<any> => {
  try {
    console.log("🚀 Calling logout API...");
    const response = await API.post("/auth/logout", {});
    console.log("✅ Logout successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Logout failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};