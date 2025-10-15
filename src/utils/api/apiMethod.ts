/* eslint-disable @typescript-eslint/no-explicit-any */

import { headers } from "@/config/config";
import API from "./api";

export const get = async (
  endPoint: string,
  filter?: object,
  token?: string
): Promise<any> => {
  try {
    const queryString = new URLSearchParams(filter as any).toString();
    if (!token) {
      const response = await API.get<any>(`${endPoint}?${queryString}`);
      return response.data;
    } else {
      const response = await API.get<any>(`${endPoint}?${queryString}`, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
      return response.data;
    }
  } catch (error: any) {
    // Log error details for debugging
    console.error("API POST error:", {
      message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};


export const post = async (
  endPoint: string,
  payload: object | FormData,
  token?: string
): Promise<any> => {
  try {
    let config: any = {};

    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }

    // If FormData, override headers
    if (payload instanceof FormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }

    const response = await API.post<any>(endPoint, payload, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};

export const patch = async (
  endPoint: string,
  payload: object
): Promise<any> => {
  try {
    const response = await API.patch<any>(endPoint, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something Went Wrong");
  }
};
