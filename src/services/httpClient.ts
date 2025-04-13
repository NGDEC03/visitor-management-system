import axios from "axios";
import { HttpClient } from "./interfaces";

export class AxiosHttpClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await axios.get<T>(url);
    return response.data;
  }
  async delete<T>(url: string): Promise<T> {
    const response = await axios.delete<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await axios.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await axios.put<T>(url, data);
    return response.data;
  }
} 