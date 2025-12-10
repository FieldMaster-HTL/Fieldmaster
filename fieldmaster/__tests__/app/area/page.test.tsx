import { createArea, getAllAreas, updateArea } from "../../../src/app/area/actions";
import Page from "../../../src/app/area/page";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

//Area FMST-30  / FMST-31
jest.mock("../../../src/app/area/actions", () => ({
  createArea: jest
    .fn()
    .mockResolvedValue({ area: { id: "3", name: "Neues Feld", size: 42.5 }, error: null }),
  getAllAreas: jest.fn().mockResolvedValue({
    areas: [
      { id: "1", name: "Testfeld", size: 123.45 },
      { id: "2", name: "Acker", size: 99 },
    ],
    error: null,
  }),
  updateArea: jest.fn().mockResolvedValue({ area: { id: "1", name: "Updated Field", size: 150 }, error: null }),
}));

describe("Area page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders heading and inputs", async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Area anlegen" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Feldname")).toBeInTheDocument();
    expect(screen.getByLabelText("Größe (m²)")).toBeInTheDocument();
  });

  it("renders area list from getAllAreas", async () => {
    render(<Page />); // Render the component

    // Wait for the areas to appear
    await waitFor(() => {
      expect(screen.getByText("Testfeld")).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes("123.45"))).toBeInTheDocument();
      expect(screen.getByText("Acker")).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes("99"))).toBeInTheDocument();
    }); // Increase timeout to 5 seconds

    // Assert that "Keine Areas vorhanden." is not in the document after areas are rendered
    expect(screen.queryByText("Keine Areas vorhanden.")).not.toBeInTheDocument();
  });

  it("submits the form and calls createArea with number as string", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(getAllAreas).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText("Feldname") as HTMLInputElement;
    const sizeInput = screen.getByLabelText("Größe (m²)") as HTMLInputElement;
    const form = screen.getByTestId("area-form");
    fireEvent.change(nameInput, { target: { value: "Neues Feld" } });
    fireEvent.change(sizeInput, { target: { value: "42.5" } });
    fireEvent.submit(form);
    await waitFor(() => {
      expect(createArea).toHaveBeenCalledWith("Neues Feld", 42.5);
    });
  });

  // FMST-43
  it("opens edit modal and saves changes (calls updateArea and updates table)", async () => {
    render(<Page />);

    // wait for initial areas to be loaded and rendered
    const editButton = await screen.findByLabelText("Bearbeite Testfeld");
    fireEvent.click(editButton);

    // modal should open
    await waitFor(() => {
      expect(screen.getByText("Area bearbeiten")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Testfeld") as HTMLInputElement;
    const sizeInput = screen.getByDisplayValue("123.45") as HTMLInputElement;

    // change values
    fireEvent.change(nameInput, { target: { value: "Updated Field" } });
    fireEvent.change(sizeInput, { target: { value: "150" } });

    // click save
    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    // expect updateArea to have been called with id, name and numeric size
    await waitFor(() => {
      expect(updateArea).toHaveBeenCalledWith("1", "Updated Field", 150);
    });

    // table should reflect updated values
    await waitFor(() => {
      expect(screen.getByText("Updated Field")).toBeInTheDocument();
      expect(screen.getByText("150 m²")).toBeInTheDocument();
    });
  });

  it("shows validation error when saving with invalid data and does not call updateArea", async () => {
    render(<Page />);

    const editButton = await screen.findByLabelText("Bearbeite Testfeld");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Area bearbeiten")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Testfeld") as HTMLInputElement;
    // clear name to trigger validation
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    // updateArea should not be called and a validation error should appear
    await waitFor(() => {
      expect(updateArea).not.toHaveBeenCalled();
      expect(screen.getByText("Bitte einen Feldnamen eingeben.")).toBeInTheDocument();
    });
  });
});
