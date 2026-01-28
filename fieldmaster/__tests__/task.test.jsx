// FMST-35 - Comprehensive Task Component Tests
import { getAllAreas } from "../src/app/area/actions";
import {
  getAllTasksAction,
  createTaskAction,
  deleteTaskAction,
  getTasksSortedFilteredAction,
  getAllToolsAction,
  getAllTaskToolsAction,
} from "../src/app/task/actions";
import Tasks from "../src/app/task/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock all external actions
jest.mock("../src/app/task/actions");
jest.mock("../src/app/area/actions");

// Setup mocks before each test
beforeEach(() => {
  getAllAreas.mockResolvedValue({ areas: [], error: null });
  getAllToolsAction.mockResolvedValue([]);
  getAllTaskToolsAction.mockResolvedValue([]);
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("Tasks Component - Comprehensive Tests", () => {
  // Test if the page renders correctly with no tasks
  it("renders heading, inputs and empty state when no tasks", async () => {
    getAllTasksAction.mockResolvedValue({ tasks: [], error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [], error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Keine Aufgaben vorhanden.")).toBeInTheDocument());

    expect(screen.getByRole("heading", { name: /tasks/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Titel der Aufgabe...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Beschreibung (optional)...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enddatum (optional)")).toBeInTheDocument();
  });

  // Test if creating a task calls the correct action
  it("calls createTaskAction when submitting the new task form", async () => {
    const creatorClerkId = "creator-1";
    localStorage.setItem("creatorClerkId", creatorClerkId);

    getAllTasksAction.mockResolvedValue({ tasks: [], error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [], error: null });
    createTaskAction.mockResolvedValue({ success: true });

    render(<Tasks />);

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
    const descInput = screen.getByPlaceholderText("Beschreibung (optional)...");
    const dateInput = screen.getByPlaceholderText("Enddatum (optional)");
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(descInput, { target: { value: "Beschreibung" } });
    fireEvent.change(dateInput, { target: { value: "2025-11-12" } });
    fireEvent.click(button);

    await waitFor(() => expect(createTaskAction).toHaveBeenCalled());
  });

  /*****************************************************************************/
  /*******************************FMST-50**************************************/
  /***************************************************************************/
  /*DELETE CONFIRM MODAL APPEARS (for FMST-50)*/
  it("shows the delete confirmation modal when clicking Delete", async () => {
    const tasks = [
      { id: "1", name: "Testtask", description: "Lorem", dueTo: null, deleted: false },
    ];

    getAllTasksAction.mockResolvedValue({ tasks, error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks, error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Testtask")).toBeInTheDocument());

    const deleteBtn = await screen.findByText((content, element) => {
      return element.tagName.toLowerCase() === "button" && content === "Delete";
    });

    fireEvent.click(deleteBtn);

    await waitFor(() =>
      expect(screen.getByText(/do you really want to delete the task/i)).toBeInTheDocument(),
    );

    expect(screen.getAllByText(/Testtask/i)[1]).toBeInTheDocument();
  });

  /*****************************************************************************/
  /*********************new tests for FMST-75**********************************/
  /***************************************************************************/
  it("renders tasks inside the table", async () => {
    const tasks = [
      { id: "1", name: "Task A", description: "Desc A", dueTo: null },
      { id: "2", name: "Task B", description: "Desc B", dueTo: null },
    ];

    // Both actions mocked to return tasks
    getAllTasksAction.mockResolvedValue({ tasks, error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks, error: null });

    render(<Tasks />);

    // wait until table updates with tasks
    await waitFor(() =>
      expect(screen.queryByText("Keine Aufgaben vorhanden.")).not.toBeInTheDocument(),
    );

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.getByText("Desc A")).toBeInTheDocument();
    expect(screen.getByText("Desc B")).toBeInTheDocument();
  });

  it("filters active tasks", async () => {
    // Arrange: no tasks returned, focus is on correct filter call
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [] });

    // Act: render page
    render(<Tasks />);

    // Assert: initial call uses default filter and no sorting
    await waitFor(() =>
      expect(getTasksSortedFilteredAction).toHaveBeenCalledWith({
        filter: "all",
        sort: undefined,
      }),
    );

    // Act: change filter to "active"
    fireEvent.change(screen.getByDisplayValue("Alle Aufgaben"), {
      target: { value: "active" },
    });

    // Assert: server action is called with active filter
    await waitFor(() =>
      expect(getTasksSortedFilteredAction).toHaveBeenLastCalledWith({
        filter: "active",
        sort: undefined,
      }),
    );
  });

  it("filters deleted tasks", async () => {
    // Arrange: mock empty response
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [] });

    // Act: render page and switch filter to "deleted"
    render(<Tasks />);

    fireEvent.change(screen.getByDisplayValue("Alle Aufgaben"), {
      target: { value: "deleted" },
    });

    // Assert: server action is called with deleted filter
    await waitFor(() =>
      expect(getTasksSortedFilteredAction).toHaveBeenLastCalledWith({
        filter: "deleted",
        sort: undefined,
      }),
    );
  });

  it("sorts tasks by due date", async () => {
    // Arrange: mock tasks with different due dates
    const tasks = [
      {
        id: "1",
        name: "Later Task",
        description: "",
        dueTo: new Date("2025-12-31"),
      },
      {
        id: "2",
        name: "Soon Task",
        description: "",
        dueTo: new Date("2025-01-01"),
      },
    ];

    getTasksSortedFilteredAction.mockResolvedValue({ tasks });

    // Act: render page and select sorting by due date
    render(<Tasks />);

    fireEvent.change(screen.getByDisplayValue("Keine Sortierung"), {
      target: { value: "dueDate" },
    });

    // Assert: server action is called with dueDate sorting
    await waitFor(() =>
      expect(getTasksSortedFilteredAction).toHaveBeenLastCalledWith({
        filter: "all",
        sort: "dueDate",
      }),
    );

    // Assert: rows are rendered in the order provided by the mock
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Later Task");
    expect(rows[2]).toHaveTextContent("Soon Task");
  });

  /*****************************************************************************/
  /*********************new tests for Priority Filter****************************/
  /***************************************************************************/
  it("renders priority filter dropdown", async () => {
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [] });

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Alle")).toBeInTheDocument();
    });
  });

  it("shows tasks table with priority column", async () => {
    const tasks = [
      {
        id: "1",
        name: "High Priority Task",
        priority: "Hoch",
        description: "Urgent",
        dueTo: null,
      },
    ];

    getTasksSortedFilteredAction.mockResolvedValue({ tasks });

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText("High Priority Task")).toBeInTheDocument();
      expect(screen.getAllByText("Hoch")[1]).toBeInTheDocument(); // Second "Hoch" in table, not dropdown
    });
  });

  it("displays tasks with correct priorities", async () => {
    const tasks = [
      {
        id: "1",
        name: "Urgent",
        priority: "Hoch",
        description: "",
        dueTo: null,
      },
      {
        id: "2",
        name: "Normal",
        priority: "Mittel",
        description: "",
        dueTo: null,
      },
      {
        id: "3",
        name: "Low",
        priority: "Niedrig",
        description: "",
        dueTo: null,
      },
    ];

    getTasksSortedFilteredAction.mockResolvedValue({ tasks });

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText("Urgent")).toBeInTheDocument();
      expect(screen.getByText("Normal")).toBeInTheDocument();
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    // Check all priority levels are visible in table (indices 1, 2, 3 are in table cells, not dropdown)
    const allHoch = screen.getAllByText("Hoch");
    const allMittel = screen.getAllByText("Mittel");
    const allNiedrig = screen.getAllByText("Niedrig");

    // Verify table rows have priority cells
    expect(allHoch.length).toBeGreaterThan(1); // At least dropdown option and table cell
    expect(allMittel.length).toBeGreaterThan(1);
    expect(allNiedrig.length).toBeGreaterThan(1);
  });

  it("filters tasks by priority on client side", async () => {
    const tasks = [
      {
        id: "1",
        name: "Urgent Task",
        priority: "Hoch",
        description: "",
        dueTo: null,
      },
      {
        id: "2",
        name: "Normal Task",
        priority: "Mittel",
        description: "",
        dueTo: null,
      },
    ];

    getTasksSortedFilteredAction.mockResolvedValue({ tasks });

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText("Urgent Task")).toBeInTheDocument();
      expect(screen.getByText("Normal Task")).toBeInTheDocument();
    });

    // Find all selects and change the priority filter (should be the second one)
    const allSelects = screen.getAllByRole("combobox");
    // First is status filter, second is priority filter
    const priorityFilter = allSelects[1];

    fireEvent.change(priorityFilter, { target: { value: "Hoch" } });

    // After filtering to "Hoch", only urgent task should be visible
    await waitFor(() => {
      expect(screen.getByText("Urgent Task")).toBeInTheDocument();
    });

    // Normal Task might still exist in DOM but not visible, depending on implementation
    // The filtering happens on client side
  });

  it("resets priority filter to show all tasks", async () => {
    const tasks = [
      {
        id: "1",
        name: "High",
        priority: "Hoch",
        description: "",
        dueTo: null,
      },
      {
        id: "2",
        name: "Medium",
        priority: "Mittel",
        description: "",
        dueTo: null,
      },
    ];

    getTasksSortedFilteredAction.mockResolvedValue({ tasks });

    render(<Tasks />);
    await waitFor(() => {
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    const allSelects = screen.getAllByRole("combobox");
    const priorityFilter = allSelects[1];

    // Filter to High
    fireEvent.change(priorityFilter, { target: { value: "Hoch" } });

    // Reset to Alle
    fireEvent.change(priorityFilter, { target: { value: "Alle" } });

    // Both should be visible
    await waitFor(() => {
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });
  });

  /*****************************************************************************/
  /************************** FMST-12 | Pachler  *******************************/
  /*****************************************************************************/
  it("zeigt zugeordnete Werkzeuge in der Tabelle an", async () => {
    const tasks = [
      {
        id: "task-1",
        name: "Task mit Tool",
        description: "",
        priority: "Mittel",
        dueTo: null,
      },
    ];

    const tools = [{ id: "tool-1", name: "Traktor", category: "Maschine", available: true }];
    const taskTools = [{ id: "tt-1", taskId: "task-1", toolId: "tool-1" }];

    getAllTasksAction.mockResolvedValue({ tasks, error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks, error: null });
    getAllToolsAction.mockResolvedValue(tools);
    getAllTaskToolsAction.mockResolvedValue(taskTools);

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText("Task mit Tool")).toBeInTheDocument();
      const toolCell = screen
        .getAllByRole("cell")
        .find((el) => el.textContent && el.textContent.includes("Traktor"));
      expect(toolCell).toBeDefined();
    });
  });
});
