import { Visitor } from "./api";
import { visitorFlowDataProp } from "@/components/visitor-flow-chart";
import { departmentVisitorProp } from "@/types/departmentVisitor";
import { visitorStatusProp, visitorDataProp } from "@/types/visitor";

export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export interface IVisitorReader {
  getVisitors(): Promise<Visitor[]>;
  getVisitorDetails(email: string): Promise<Visitor>;
  getVisitorsByHost(hostId: string): Promise<Visitor[]>;
  getTotalVisitors(hostId: string): Promise<visitorDataProp>;
}

export interface IVisitorWriter {
  createVisitor(visitor: Visitor): Promise<Visitor>;
  updateVisitor(visitorId: string, status: string): Promise<Visitor>;
}

export interface IVisitorAnalytics {
  getFlowData(hostId: string): Promise<visitorFlowDataProp[]>;
  getDepartmentVisitors(hostId: string): Promise<departmentVisitorProp[]>;
  getVisitorsStatus(hostId: string): Promise<visitorStatusProp>;
  getVisitorStatus(): Promise<visitorStatusProp>;
}

export interface IAuthService {
  forgotPassword(email: string): Promise<any>;
  resetPassword(token: string, password: string): Promise<any>;
} 