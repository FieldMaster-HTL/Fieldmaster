import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Tools from "../src/app/tools/page"
import {
  loadTools,
  loadCategories,
  loadAreas,
  storeTools,
  deleteTool,
} from "../src/app/tools/actions"

//mock aktionen
jest.mock("../src/app/tools/actions", () => ({
  loadTools: jest.fn(),
  loadCategories: jest.fn(),
  loadAreas: jest.fn(),
  storeTools: jest.fn(),
  deleteTool: jest.fn(),
}))

// zurpcksetzten von mocks
afterEach(() => jest.clearAllMocks())

describe("Tools-Seite – minimaler Ablauf", () => {
  it("lädt Tools, erstellt eines und löscht eines (keine UI-Assertions)", async () => {
    // leeres array 
    loadTools.mockResolvedValueOnce([])
    
    loadCategories.mockResolvedValue([{ id: "1", name: "Werkzeug" }])
    loadAreas.mockResolvedValue([{ id: "1", name: "Werkstatt" }])

    // neues tool erstellen und zurückgeben
    const newTool = { 
      id: "1", 
      name: "Bohrer", 
      category: "Werkzeug",
      area: "Werkstatt"
    }
    storeTools.mockResolvedValue(newTool)
    
    // noch mal laden
    loadTools.mockResolvedValueOnce([newTool])
    
    deleteTool.mockResolvedValue({ success: true })

    // mock von dialoge
    jest.spyOn(window, "confirm").mockReturnValue(true)
    jest.spyOn(window, "alert").mockImplementation(() => {})

    render(<Tools />)

    //laden
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    //erstellen
    fireEvent.click(screen.getByText("Create Tool"))

    // warten bis formular angezeigt
    const nameInput = await screen.findByPlaceholderText("Tool-Name")
    fireEvent.change(nameInput, {
      target: { value: "Bohrer" },
    })

    // suche nach kategorie feld
    let categoryField
    
    // select
    try {
      categoryField = screen.getByDisplayValue("") // Leeres Select
      if (!categoryField) {
        const selects = screen.getAllByRole("combobox", { hidden: true })
        categoryField = selects.find(
          s => s.name?.includes("categ") || s.id?.includes("categ")
        )
      }
    } catch {
      const inputs = screen.getAllByRole("textbox")
      categoryField = inputs[1]
    }

    if (categoryField) {
      fireEvent.change(categoryField, {
        target: { value: "Werkzeug" },
      })
    }

    // formular senden
    fireEvent.click(screen.getByText("Erstellen"))

    // warten auf aufruf v. storetools
    await waitFor(() => expect(storeTools).toHaveBeenCalled())

    // warten bis element in liste
    await waitFor(() => {
      expect(screen.queryByText("Bohrer")).toBeInTheDocument()
    }, { timeout: 3000 })

    // löschen
    const deleteButton = await screen.findByText("Löschen")
    fireEvent.click(deleteButton)

    await waitFor(() => expect(deleteTool).toHaveBeenCalled())
  })
})
