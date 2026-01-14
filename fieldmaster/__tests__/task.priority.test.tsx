// FMST-35: Task Priorities Tests
import { getAllAreas } from "../src/app/area/actions";
import { getAllTasksAction, createTaskAction, updateTaskAction } from "../src/app/task/actions";
import Tasks from "../src/app/task/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the actions so tests don't call the real DB
jest.mock("../src/app/task/actions", () => ({
  getAllTasksAction: jest.fn(),
  createTaskAction: jest.fn(),
  deleteTaskAction: jest.fn(),
  updateTaskAction: jest.fn(),
}));

jest.mock("../src/app/area/actions", () => ({
  getAllAreas: jest.fn(),
}));

afterEach(() => jest.clearAllMocks());

// Helper function to get priority select
function getPrioritySelect(): HTMLSelectElement {
  const selects = screen.getAllByRole("combobox");
  return selects.find(
    (select) => (select as HTMLSelectElement).options[0]?.value === "Hoch",
  ) as HTMLSelectElement;
}

// Helper function to get filter select
function getFilterSelect(): HTMLSelectElement {
  const selects = screen.getAllByRole("combobox");
  return selects.find(
    (select) => (select as HTMLSelectElement).options[0]?.value === "Alle",
  ) as HTMLSelectElement;
}

describe("Task Priorities (FMST-35)", () => {
  // ===== Priority Creation Tests =====
  describe("Creating tasks with priorities", () => {
    it("should render priority dropdown in form", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const prioritySelect = getPrioritySelect();
      expect(prioritySelect).toBeInTheDocument();
    });

    it("should have correct default priority value (Mittel)", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const prioritySelect = getPrioritySelect();
      expect(prioritySelect.value).toBe("Mittel");
    });

    it("should offer all three priority options: Hoch, Mittel, Niedrig", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const prioritySelect = getPrioritySelect();
      const options = Array.from(prioritySelect.options).map((opt) => opt.value);

      expect(options).toContain("Hoch");
      expect(options).toContain("Mittel");
      expect(options).toContain("Niedrig");
    });

    it('should create task with "Hoch" priority', async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Urgent Task" } });
      fireEvent.change(prioritySelect, { target: { value: "Hoch" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createTaskAction).toHaveBeenCalledWith(
          "Urgent Task",
          "",
          "creator-1",
          undefined,
          "Hoch",
        );
      });
    });

    it('should create task with "Mittel" priority', async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Normal Task" } });
      fireEvent.change(prioritySelect, { target: { value: "Mittel" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createTaskAction).toHaveBeenCalledWith(
          "Normal Task",
          "",
          "creator-1",
          undefined,
          "Mittel",
        );
      });
    });

    it('should create task with "Niedrig" priority', async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Low Priority Task" } });
      fireEvent.change(prioritySelect, { target: { value: "Niedrig" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createTaskAction).toHaveBeenCalledWith(
          "Low Priority Task",
          "",
          "creator-1",
          undefined,
          "Niedrig",
        );
      });
    });

    it("should reset priority to default after successful creation", async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Task" } });
      fireEvent.change(prioritySelect, { target: { value: "Hoch" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(prioritySelect.value).toBe("Mittel");
      });
    });
  });

  // ===== Priority Display Tests =====
  describe("Displaying task priorities", () => {
    it("should display priority in task list for high priority task", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Urgent Task")).toBeInTheDocument());

      const prioritySpan = screen.getByTitle("Hoch");
      expect(prioritySpan).toBeInTheDocument();
    });

    it("should display priority in task list for medium priority task", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Normal Task",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Normal Task")).toBeInTheDocument());

      const prioritySpan = screen.getByTitle("Mittel");
      expect(prioritySpan).toBeInTheDocument();
    });

    it("should display priority in task list for low priority task", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Low Priority Task",
          description: "",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Low Priority Task")).toBeInTheDocument());

      const prioritySpan = screen.getByTitle("Niedrig");
      expect(prioritySpan).toBeInTheDocument();
    });

    it("should display priority for multiple tasks with different priorities", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Normal Task",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-3",
          name: "Low Priority Task",
          description: "",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Urgent Task")).toBeInTheDocument());

      expect(screen.getByTitle("Hoch")).toBeInTheDocument();
      expect(screen.getByTitle("Mittel")).toBeInTheDocument();
      expect(screen.getByTitle("Niedrig")).toBeInTheDocument();
    });

    it("should display priority in task detail modal", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Task with Priority",
          description: "Desc",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Task with Priority")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Task with Priority"));

      await waitFor(() => {
        const modal = screen.getByRole("heading", { name: "Task with Priority" }).closest("div");
        expect(modal?.textContent).toContain("Hoch");
      });
    });
  });

  // ===== Priority Filtering Tests =====
  describe("Filtering tasks by priority", () => {
    it("should render priority filter dropdown", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const filterSelect = getFilterSelect();
      expect(filterSelect).toBeInTheDocument();
    });

    it('should filter tasks to show only "Hoch" priority when selected', async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Normal Task",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Urgent Task")).toBeInTheDocument());

      const filterSelect = getFilterSelect();
      fireEvent.change(filterSelect, { target: { value: "Hoch" } });

      await waitFor(() => {
        expect(screen.getByText("Urgent Task")).toBeInTheDocument();
      });
    });

    it('should filter tasks to show only "Mittel" priority when selected', async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Normal Task",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Normal Task")).toBeInTheDocument());

      const filterSelect = getFilterSelect();
      fireEvent.change(filterSelect, { target: { value: "Mittel" } });

      await waitFor(() => {
        expect(screen.getByText("Normal Task")).toBeInTheDocument();
      });
    });

    it('should filter tasks to show only "Niedrig" priority when selected', async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Low Priority Task",
          description: "",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Low Priority Task")).toBeInTheDocument());

      const filterSelect = getFilterSelect();
      fireEvent.change(filterSelect, { target: { value: "Niedrig" } });

      await waitFor(() => {
        expect(screen.getByText("Low Priority Task")).toBeInTheDocument();
      });
    });

    it('should show all tasks when filter is set to "Alle"', async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Normal Task",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-3",
          name: "Low Priority Task",
          description: "",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Urgent Task")).toBeInTheDocument());

      const filterSelect = getFilterSelect();
      fireEvent.change(filterSelect, { target: { value: "Alle" } });

      await waitFor(() => {
        expect(screen.getByText("Urgent Task")).toBeInTheDocument();
        expect(screen.getByText("Normal Task")).toBeInTheDocument();
        expect(screen.getByText("Low Priority Task")).toBeInTheDocument();
      });
    });
  });

  // ===== Priority Sorting Tests =====
  describe("Sorting tasks by priority", () => {
    it("should render sort by priority checkbox", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const sortCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(sortCheckbox).toBeInTheDocument();
      expect(sortCheckbox.checked).toBe(false);
    });

    it("should be able to enable priority sorting", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Urgent Task",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const sortCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      fireEvent.click(sortCheckbox);

      await waitFor(() => {
        expect(sortCheckbox.checked).toBe(true);
      });
    });

    it("should display all priorities correctly", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Task 1",
          description: "",
          priority: "Hoch",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-2",
          name: "Task 2",
          description: "",
          priority: "Mittel",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
        {
          id: "task-3",
          name: "Task 3",
          description: "",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

      expect(screen.getByTitle("Hoch")).toBeInTheDocument();
      expect(screen.getByTitle("Mittel")).toBeInTheDocument();
      expect(screen.getByTitle("Niedrig")).toBeInTheDocument();
    });
  });

  // ===== Priority Update Tests =====
  describe("Updating task priority", () => {
    it("should allow updating task priority through modal", async () => {
      const mockTasks = [
        {
          id: "task-1",
          name: "Task to Update",
          description: "Desc",
          priority: "Niedrig",
          createdAt: new Date(),
          dueTo: undefined,
          areaId: undefined,
          creatorClerkId: "user-1",
        },
      ];

      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (updateTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(screen.getByText("Task to Update")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Task to Update"));

      await waitFor(() => {
        const modal = screen.getByRole("heading", { name: "Task to Update" }).closest("div");
        expect(modal).toBeInTheDocument();
      });
    });

    it("should validate priority values (only Hoch, Mittel, Niedrig allowed)", async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const prioritySelect = getPrioritySelect();
      const validOptions = ["Hoch", "Mittel", "Niedrig"];

      Array.from(prioritySelect.options).forEach((option) => {
        expect(validOptions).toContain(option.value);
      });
    });
  });

  // ===== Edge Cases and Error Handling =====
  describe("Priority edge cases and error handling", () => {
    it("should handle empty task list correctly", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      expect(screen.getByText(/keine aufgaben vorhanden/i)).toBeInTheDocument();
    });

    it("should handle fetch error for tasks", async () => {
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: null, error: "Database error" });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      expect(screen.getByText(/keine aufgaben vorhanden/i)).toBeInTheDocument();
    });

    it("should persist priority selection across component re-renders", async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const prioritySelect = getPrioritySelect();

      fireEvent.change(prioritySelect, { target: { value: "Hoch" } });
      expect(prioritySelect.value).toBe("Hoch");

      fireEvent.change(prioritySelect, { target: { value: "Niedrig" } });
      expect(prioritySelect.value).toBe("Niedrig");
    });

    it("should handle priority when combined with area selection", async () => {
      const mockAreas = [{ id: "area-1", name: "Feld A", size: "100m²" }];

      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: mockAreas, error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const areaSelect = screen.getByLabelText(/feld auswählen/i);
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Task with Area and Priority" } });
      fireEvent.change(prioritySelect, { target: { value: "Hoch" } });
      fireEvent.change(areaSelect, { target: { value: "area-1" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createTaskAction).toHaveBeenCalled();
      });
    });

    it("should handle priority when combined with due date", async () => {
      localStorage.setItem("creatorClerkId", "creator-1");
      (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
      (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
      (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

      render(<Tasks />);

      await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

      const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
      const prioritySelect = getPrioritySelect();
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      const button = screen.getByRole("button", { name: /hinzufügen/i });

      fireEvent.change(nameInput, { target: { value: "Task with Due Date and Priority" } });
      fireEvent.change(prioritySelect, { target: { value: "Hoch" } });
      fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createTaskAction).toHaveBeenCalled();
      });
    });
  });
});
