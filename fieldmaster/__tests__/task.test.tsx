// FMST-35
import { getAllAreas } from "../src/app/area/actions";
import { getAllTasksAction, createTaskAction, deleteTaskAction } from "../src/app/task/actions";
import Tasks from "../src/app/task/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the actions so tests don't call the real DB
jest.mock("../src/app/task/actions", () => ({
  getAllTasksAction: jest.fn(),
  createTaskAction: jest.fn(),
  deleteTaskAction: jest.fn(),
}));

jest.mock("../src/app/area/actions", () => ({
  getAllAreas: jest.fn(),
}));

afterEach(() => jest.clearAllMocks());

describe("Tasks page (FMST-35, FMST-11, FMST-50)", () => {
  // FMST-35: Test if the page renders correctly with no tasks
  it("renders heading, inputs and empty state when no tasks", async () => {
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    expect(screen.getByRole("heading", { name: /tasks/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Titel der Aufgabe...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Beschreibung (optional)...")).toBeInTheDocument();
    expect(screen.getByText("Keine Aufgaben vorhanden.")).toBeInTheDocument();
  });

  // FMST-11: Test if area dropdown is rendered with areas
  it("renders area dropdown with available areas", async () => {
    const mockAreas = [
      { id: "area-1", name: "Feld A", size: "100m²" },
      { id: "area-2", name: "Feld B", size: "200m²" },
      { id: "area-3", name: "Feld C" },
    ];

    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: mockAreas, error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllAreas).toHaveBeenCalled());

    expect(screen.getByLabelText(/feld auswählen \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByText("Feld A (100m²)")).toBeInTheDocument();
    expect(screen.getByText("Feld B (200m²)")).toBeInTheDocument();
    expect(screen.getByText("Feld C")).toBeInTheDocument();
  });

  // FMST-11: Test if creating a task with area calls the correct action
  it("calls createTaskAction with area when submitting form with area selected", async () => {
    const mockAreas = [
      { id: "area-1", name: "Feld A", size: "100m²" },
      { id: "area-2", name: "Feld B", size: "200m²" },
    ];

    localStorage.setItem("creatorClerkId", "creator-1");
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: mockAreas, error: null });
    (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
    const descInput = screen.getByPlaceholderText("Beschreibung (optional)...");
    const areaSelect = screen.getByLabelText(/feld auswählen \(optional\)/i) as HTMLSelectElement;
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(descInput, { target: { value: "Beschreibung" } });
    fireEvent.change(areaSelect, { target: { value: "area-1" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        "Test Task",
        "Beschreibung",
        "creator-1",
        undefined,
        "Mittel",
      );
    });
  });

  // FMST-35: Test if creating a task without area calls the correct action
  it("calls createTaskAction when submitting the new task form without area", async () => {
    localStorage.setItem("creatorClerkId", "creator-1");
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
    (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
    const descInput = screen.getByPlaceholderText("Beschreibung (optional)...");
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(descInput, { target: { value: "Beschreibung" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        "Test Task",
        "Beschreibung",
        "creator-1",
        undefined,
        "Mittel",
      );
    });
  });

  // FMST-11: Test if tasks display their associated area name
  it("displays area name in task list when task has area", async () => {
    const mockAreas = [
      { id: "area-1", name: "Feld A", size: "100m²" },
      { id: "area-2", name: "Feld B", size: "200m²" },
    ];
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "",
        createdAt: new Date(),
        dueTo: undefined,
        areaId: "area-1",
        creatorClerkId: "user-1",
      },
    ];

    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: mockAreas, error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Feld: Feld A")).toBeInTheDocument());
  });

  // FMST-11: Test if modal displays area name
  it("displays area name in modal when task is clicked", async () => {
    const mockAreas = [{ id: "area-1", name: "Feld A", size: "100m²" }];
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "Desc",
        createdAt: new Date(),
        dueTo: undefined,
        areaId: "area-1",
        creatorClerkId: "user-1",
      },
    ];

    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: mockAreas, error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Task 1"));

    // Suche nach dem Modal mit der Überschrift (h2) und prüfe dann auf den Feld-Text
    await waitFor(() => {
      const modal = screen.getByRole("heading", { name: "Task 1" }).closest("div");
      expect(modal).toBeInTheDocument();
      expect(modal?.textContent).toContain("Feld: Feld A");
    });
  });

  // FMST-11: Test if modal displays 'Unbekannt' when area not found
  it('displays "Unbekannt" in modal when area is not found', async () => {
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "Desc",
        createdAt: new Date(),
        dueTo: undefined,
        areaId: "unknown-area",
        creatorClerkId: "user-1",
      },
    ];

    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Task 1"));

    // Suche nach dem Modal und prüfe auf "Unbekannt"
    await waitFor(() => {
      const modal = screen.getByRole("heading", { name: "Task 1" }).closest("div");
      expect(modal).toBeInTheDocument();
      expect(modal?.textContent).toContain("Feld: Unbekannt");
    });
  });

  // FMST-50: Test if delete button appears on task
  it("displays delete button on task item", async () => {
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "",
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

    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  // FMST-50: Test if delete confirmation modal appears
  it("shows delete confirmation modal when delete button is clicked", async () => {
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "",
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

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/do you really want to delete the task/i)).toBeInTheDocument();
    });
  });

  // FMST-50: Test if task deletion calls deleteTaskAction
  it("calls deleteTaskAction when delete is confirmed", async () => {
    const mockTasks = [
      {
        id: "task-1",
        name: "Task 1",
        description: "",
        createdAt: new Date(),
        dueTo: undefined,
        areaId: undefined,
        creatorClerkId: "user-1",
      },
    ];

    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: mockTasks, error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
    (deleteTaskAction as jest.Mock).mockResolvedValue({ error: null });

    render(<Tasks />);

    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    // Klicke auf DELETE Button in Task-Liste
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Warte bis Modal sichtbar ist
    await waitFor(() => {
      expect(screen.getByText(/do you really want to delete the task/i)).toBeInTheDocument();
    });

    // Finde den Modal-Container und klicke den Delete Button darin
    const modal = screen.getByText(/do you really want to delete the task/i).closest("div");
    const deleteButtonInModal = modal?.querySelector("button:last-of-type") as HTMLButtonElement;

    fireEvent.click(deleteButtonInModal);

    await waitFor(() => {
      expect(deleteTaskAction).toHaveBeenCalledWith("task-1");
    });
  });

  // FMST-35: Test error handling when createTaskAction fails
  it("displays error message when task creation fails", async () => {
    localStorage.setItem("creatorClerkId", "creator-1");
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
    (createTaskAction as jest.Mock).mockRejectedValue(new Error("Create failed"));

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Failed to create task. Please try again.")).toBeInTheDocument();
    });
  });

  // FMST-35: Test form reset after successful task creation
  it("clears form after successful task creation", async () => {
    localStorage.setItem("creatorClerkId", "creator-1");
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
    (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...") as HTMLInputElement;
    const descInput = screen.getByPlaceholderText(
      "Beschreibung (optional)...",
    ) as HTMLTextAreaElement;
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(descInput, { target: { value: "Test Description" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(descInput.value).toBe("");
    });
  });

  // FMST-35: Test with date input
  it("correctly handles date input when creating task", async () => {
    localStorage.setItem("creatorClerkId", "creator-1");
    (getAllTasksAction as jest.Mock).mockResolvedValue({ tasks: [], error: null });
    (getAllAreas as jest.Mock).mockResolvedValue({ areas: [], error: null });
    (createTaskAction as jest.Mock).mockResolvedValue({ error: null });

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const inputs = screen.getAllByRole("textbox");
    const nameInput = inputs[0];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalled();
    });
  });
});
