import axios from "axios";

const BASE = "http://localhost:8000";

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskCount {
  total: number;
  completed: number;
  pending: number;
}

export const listTasks = (completed?: boolean): Promise<Task[]> => {
  const params = completed !== undefined ? { completed } : {};
  return axios.get<Task[]>(`${BASE}/tasks/`, { params }).then((r) => r.data);
};

export const getTask = (id: number): Promise<Task> =>
  axios.get<Task>(`${BASE}/tasks/${id}`).then((r) => r.data);

export const createTask = (data: TaskCreate): Promise<Task> =>
  axios.post<Task>(`${BASE}/tasks/`, data).then((r) => r.data);

export const updateTask = (id: number, data: Partial<TaskCreate & { completed: boolean }>): Promise<Task> =>
  axios.put<Task>(`${BASE}/tasks/${id}`, data).then((r) => r.data);

export const toggleTask = (id: number): Promise<Task> =>
  axios.post<Task>(`${BASE}/tasks/${id}/toggle`).then((r) => r.data);

export const deleteTask = (id: number): Promise<void> =>
  axios.delete(`${BASE}/tasks/${id}`).then(() => undefined);

export const countTasks = (): Promise<TaskCount> =>
  axios.get<TaskCount>(`${BASE}/tasks/count`).then((r) => r.data);
