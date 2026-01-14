// FMST-35
import {
  getAllTasksAction,
  createTaskAction,
  deleteTaskAction,
  getTasksSortedFilteredAction,
} from "../src/app/task/actions";
import Tasks from "../src/app/task/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the actions so tests don't call the real DB
jest.mock("../src/app/task/actions", () => ({
  getAllTasksAction: jest.fn(),
  createTaskAction: jest.fn(),
  deleteTaskAction: jest.fn(),
  getTasksSortedFilteredAction: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("Tasks page", () => {
  // Test if the page renders correctly with no tasks
  it("renders heading, inputs and empty state when no tasks", async () => {
    getAllTasksAction.mockResolvedValue({ tasks: [], error: null });
    getTasksSortedFilteredAction.mockResolvedValue({ tasks: [], error: null });

    render(<Tasks />);

    await waitFor(() =>
      expect(screen.getByText("Keine Aufgaben vorhanden.")).toBeInTheDocument()
    );

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
      expect(screen.getByText(/do you really want to delete the task/i)).toBeInTheDocument()
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
    await waitFor(() => expect(screen.queryByText("Keine Aufgaben vorhanden.")).not.toBeInTheDocument());

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
      })
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
      })
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
      })
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
      })
    );

    // Assert: rows are rendered in the order provided by the mock
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Later Task");
    expect(rows[2]).toHaveTextContent("Soon Task");
  });

});
