import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8989/api/v1",
  withCredentials: true,
});

export const uploadExcelFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/fileHandling/upload-excel-sheet", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadExcelUrl = async (fileUrl: string) => {
  return API.post("/fileHandling/upload-excel-sheet", { fileUrl });
};
