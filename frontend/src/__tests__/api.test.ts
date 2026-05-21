import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import * as api from "../services/api";

vi.mock("axios");
const mockedAxios = axios as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("api services", () => {
  it("listTasks calls axios and returns data", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1, title: "T1", completed: false }] });
    const res = await api.listTasks();
    expect(res).toEqual([{ id: 1, title: "T1", completed: false }]);
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  it("get/create/update/toggle/delete/count behave as adapters", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: 2, title: "T2", completed: true } });
    expect(await api.getTask(2)).toEqual({ id: 2, title: "T2", completed: true });

    mockedAxios.post.mockResolvedValueOnce({ data: { id: 3, title: "New", completed: false } });
    expect(await api.createTask({ title: "New" })).toEqual({ id: 3, title: "New", completed: false });

    mockedAxios.put.mockResolvedValueOnce({ data: { id: 3, title: "Updated", completed: true } });
    expect(await api.updateTask(3, { title: "Updated" })).toEqual({ id: 3, title: "Updated", completed: true });

    mockedAxios.post.mockResolvedValueOnce({ data: { id: 3, title: "Updated", completed: false } });
    expect(await api.toggleTask(3)).toEqual({ id: 3, title: "Updated", completed: false });

    mockedAxios.delete.mockResolvedValueOnce({});
    await expect(api.deleteTask(3)).resolves.toBeUndefined();

    mockedAxios.get.mockResolvedValueOnce({ data: { total: 1, completed: 0, pending: 1 } });
    expect(await api.countTasks()).toEqual({ total: 1, completed: 0, pending: 1 });
  });
});
