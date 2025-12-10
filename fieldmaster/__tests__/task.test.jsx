// FMST-35
import { getAllTasksAction, createTaskAction, deleteTaskAction } from "../src/app/task/actions";
import Tasks from "../src/app/task/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the actions so tests don't call the real DB
jest.mock("../src/app/task/actions", () => ({
  getAllTasksAction: jest.fn(),
  getAllAreasAction: jest.fn(),
  createTaskAction: jest.fn(),
  deleteTaskAction: jest.fn(),
}));

afterEach(() => jest.clearAllMocks()); // clear mocks after each test

describe("Tasks page", () => {
  // Test if the page renders correctly with no tasks
  it("renders heading, inputs and empty state when no tasks", async () => {
    getAllTasksAction.mockResolvedValue({ tasks: [] }); // mock empty tasks

    render(<Tasks />);

    // wait for initial fetch
    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    // check heading and input fields
    expect(screen.getByRole("heading", { name: /tasks/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Titel der Aufgabe...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Beschreibung (optional)...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enddatum (optional)")).toBeInTheDocument();

    // check empty state text
    expect(screen.getByText("Keine Aufgaben vorhanden.")).toBeInTheDocument();
  });

  // FMST-11: Test if area dropdown is rendered with areas
  it('renders area dropdown with available areas', async () => {
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
      { id: 'area-2', name: 'Feld B', size: '200m²' },
      { id: 'area-3', name: 'Feld C' },
    ]

    getAllTasksAction.mockResolvedValue([])
    getAllAreasAction.mockResolvedValue(mockAreas)

    render(<Tasks />)

    await waitFor(() => expect(getAllAreasAction).toHaveBeenCalled())

    const areaSelect = screen.getByLabelText(/feld auswählen \(optional\)/i)
    expect(areaSelect).toBeInTheDocument()

    // Check if all areas are present in the dropdown
    expect(screen.getByText('Feld A (100m²)')).toBeInTheDocument()
    expect(screen.getByText('Feld B (200m²)')).toBeInTheDocument()
    expect(screen.getByText('Feld C')).toBeInTheDocument()
    expect(screen.getByText('-- Feld auswählen (optional) --')).toBeInTheDocument()
  })

  // FMST-11: Test if creating a task with area calls the correct action
  it('calls createTaskAction with areaId when submitting form with area selected', async () => {
    const creatorClerkId = 'creator-1'
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
      { id: 'area-2', name: 'Feld B', size: '200m²' },
    ]

    localStorage.setItem('creatorClerkId', creatorClerkId)

    getAllTasksAction.mockResolvedValue([])
    getAllAreasAction.mockResolvedValue(mockAreas)
    createTaskAction.mockResolvedValue(undefined)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    const nameInput = screen.getByPlaceholderText('Titel der Aufgabe...')
    const descInput = screen.getByPlaceholderText('Beschreibung (optional)...')
    const dateInput = screen.getByPlaceholderText('Enddatum (optional)')
    const areaSelect = screen.getByLabelText(/feld auswählen \(optional\)/i)
    const button = screen.getByRole('button', { name: /hinzufügen/i })

    // fill out form with area
    fireEvent.change(nameInput, { target: { value: 'Test Task' } })
    fireEvent.change(descInput, { target: { value: 'Beschreibung' } })
    fireEvent.change(dateInput, { target: { value: '2025-11-12' } })
    fireEvent.change(areaSelect, { target: { value: 'area-1' } })

    // submit form
    fireEvent.click(button)

    // wait for createTaskAction to be called with areaId
    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        'Test Task',
        'Beschreibung',
        creatorClerkId,
        new Date('2025-11-12'),
        'area-1'
      )
    })
  })

  // Test if creating a task calls the correct action
  it("calls createTaskAction when submitting the new task form", async () => {
    const creatorClerkId = "creator-1";

    localStorage.setItem("creatorClerkId", creatorClerkId);

    getAllTasksAction.mockResolvedValue({ tasks: [] }); // no tasks initially
    createTaskAction.mockResolvedValue(undefined); // mock create

    render(<Tasks />);

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText("Titel der Aufgabe...");
    const descInput = screen.getByPlaceholderText("Beschreibung (optional)...");
    const dateInput = screen.getByPlaceholderText("Enddatum (optional)");
    const button = screen.getByRole("button", { name: /hinzufügen/i });

    // fill out form
    fireEvent.change(nameInput, { target: { value: "Test Task" } });
    fireEvent.change(descInput, { target: { value: "Beschreibung" } });
    fireEvent.change(dateInput, { target: { value: "2025-11-12" } });

    // submit form
    fireEvent.click(button);

    // wait for createTaskAction to be called (component uses startTransition)
    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        "Test Task",
        "Beschreibung",
        creatorClerkId,
        new Date("2025-11-12T00:00:00.000Z"),
      );
    });
  });

  /*****************************************************************************/
  /*********************new tests for FMST-50**********************************/
  /***************************************************************************/
  /*DELETE CONFIRM MODAL APPEARS (for FMST-50)*/
  it("shows the delete confirmation modal when clicking DELETE", async () => {
    // one example task
    const tasks = [
      {
        id: "1",
        name: "Testtask",
        description: "Lorem",
        dueTo: null,
      },
    ];

    getAllTasksAction.mockResolvedValue({ tasks });

    render(<Tasks />);

    // wait for tasks to load
    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled());

    // click DELETE button of the task
    const deleteBtn = screen.getByText("DELETE");
    fireEvent.click(deleteBtn);

    // modal should appear now
    expect(screen.getByText(/do you really want to delete the task/i)).toBeInTheDocument();

    // task name inside modal
    expect(screen.getAllByText(/Testtask/i)[1]).toBeInTheDocument();
  });
});
