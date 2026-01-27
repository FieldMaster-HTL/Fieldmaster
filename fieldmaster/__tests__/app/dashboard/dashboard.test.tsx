import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock area loader (two areas)
jest.mock("@/src/app/area/actions", () => ({
  getAllAreas: jest.fn().mockResolvedValue({ areas: [
    { id: "a1", name: "Wiese Nord", size: 100, category: "WIESE" },
    { id: "a2", name: "Wald Süd", size: 250, category: "WALD" },
  ], error: null }),
}));
jest.mock("../../../src/app/area/actions", () => ({
  getAllAreas: jest.fn().mockResolvedValue({ areas: [
    { id: "a1", name: "Wiese Nord", size: 100, category: "WIESE" },
    { id: "a2", name: "Wald Süd", size: 250, category: "WALD" },
  ], error: null }),
}));

// Mock task loader (two tasks)
jest.mock("@/src/app/task/actions", () => ({
  getAllTasksAction: jest.fn().mockResolvedValue([
    { id: "t1", name: "Task One", description: "Do it", creatorId: null, createdAt: new Date().toISOString(), dueTo: new Date("2025-01-01").toISOString(), areaId: "a1" },
    { id: "t2", name: "Task Two", description: null, creatorId: null, createdAt: new Date().toISOString(), dueTo: null, areaId: null },
  ]),
}));
jest.mock("../../../src/app/task/actions", () => ({
  getAllTasksAction: jest.fn().mockResolvedValue([
    { id: "t1", name: "Task One", description: "Do it", creatorId: null, createdAt: new Date().toISOString(), dueTo: new Date("2025-01-01").toISOString(), areaId: "a1" },
    { id: "t2", name: "Task Two", description: null, creatorId: null, createdAt: new Date().toISOString(), dueTo: null, areaId: null },
  ]),
}));

// Import after mocks so the module uses the mocked implementations
import Page from "../../../src/app/dashboard/page";
import { getAllAreas } from "../../../src/app/area/actions";
import { getAllTasksAction } from "../../../src/app/task/actions";

describe("Dashboard page", () => {
  it("loads and displays areas and tasks and supports search/filter/toggle", async () => {
    render(<Page />);

    // Wait for the data loaders to be called
    await waitFor(() => {
      expect(getAllAreas).toHaveBeenCalled();
      expect(getAllTasksAction).toHaveBeenCalled();
    });

    // Wait for UI to update (areas rendered)
    await waitFor(() => expect(screen.getByText("Wiese Nord")).toBeInTheDocument());

    // Heading and toggle buttons with counts
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Areas \(2\)/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tasks \(2\)/ })).toBeInTheDocument();

    // By default view is areas: both areas should be visible
    expect(screen.getByText("Wiese Nord")).toBeInTheDocument();
    expect(screen.getByText(/100 m²/)).toBeInTheDocument();

    // Search: type a term that matches only the second area
    const search = screen.getByLabelText("Search areas") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "Wald" } });
    await waitFor(() => {
      expect(screen.queryByText("Wiese Nord")).not.toBeInTheDocument();
      expect(screen.getByText("Wald Süd")).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(search, { target: { value: "" } });
    await waitFor(() => {
      expect(screen.getByText("Wiese Nord")).toBeInTheDocument();
      expect(screen.getByText("Wald Süd")).toBeInTheDocument();
    });

    // Category filter: click the WALD filter checkbox to show only WALD
    const filt = screen.getByLabelText("Filter WALD") as HTMLInputElement;
    fireEvent.click(filt);
    await waitFor(() => {
      expect(screen.queryByText("Wiese Nord")).not.toBeInTheDocument();
      expect(screen.getByText("Wald Süd")).toBeInTheDocument();
    });

    // Toggle to tasks view
    const tasksBtn = screen.getByRole("button", { name: /Tasks \(2\)/ });
    fireEvent.click(tasksBtn);
    await waitFor(() => {
      expect(screen.getByText("Task One")).toBeInTheDocument();
      expect(screen.getByText("Task Two")).toBeInTheDocument();
      // due date should be formatted for Task One
      expect(screen.getByText(/Fällig:/)).toBeInTheDocument();
    });
  });
});
