import { createArea, getAllAreas } from "../../../src/app/area/actions";
import Page from "../../../src/app/area/page";
import "@testing-library/jest-dom";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";

// Area FMST-30 / FMST-31 /FMST-42 tests
jest.mock("../../../src/app/area/actions", () => ({
  createArea: jest
    .fn()
    .mockResolvedValue({ area: { id: "3", name: "Neues Feld", size: 42.5, category: "WIESE" }, error: null }),
  getAllAreas: jest.fn().mockResolvedValue({
    areas: [
      { id: "1", name: "Testfeld", size: 123.45, category: "WIESE" },
      { id: "2", name: "Acker", size: 99, castegory: "WIESE" },
    ],
    error: null,
  }),
}));

describe("Area page", () => {
  it("renders heading and inputs", async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Area anlegen" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Feldname")).toBeInTheDocument();
    // component uses aria-label="Größe"
    expect(screen.getByLabelText("Größe")).toBeInTheDocument();
    // category select and helper text
    expect(screen.getByLabelText("Kategorie")).toBeInTheDocument();
    expect(screen.getByText("Nur vordefinierte Kategorien möglich.")).toBeInTheDocument();
  });

  it("renders area list from getAllAreas", async () => {
    render(<Page />); // Render the component

    // Wait for the areas to appear
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items[0].textContent).toContain('Testfeld');
      expect(items[0].textContent).toContain('123.45');
      expect(items[0].textContent).toContain('WIESE');
      expect(items[1].textContent).toContain('Acker');
      expect(items[1].textContent).toContain('99');
      expect(items[1].textContent).toContain('WIESE');
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
    // The component's size input has aria-label "Größe"
    const sizeInputReal = screen.getByLabelText("Größe") as HTMLInputElement;
    fireEvent.change(sizeInputReal, { target: { value: "42.5" } });
    fireEvent.submit(form);
    await waitFor(() => {
      // createArea receives name, numeric size and category (default "WIESE")
      expect(createArea).toHaveBeenCalledWith("Neues Feld", 42.5, "WIESE");
    });
    // New area should appear in the list
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      // newly created item should be present (third item)
      expect(items.some((it) => it.textContent && it.textContent.includes('Neues Feld') && it.textContent.includes('42.5') && it.textContent.includes('WIESE'))).toBeTruthy();
    });
  });
});
