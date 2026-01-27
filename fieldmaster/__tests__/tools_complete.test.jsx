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

// --------------------
// MOCK ACTIONS
// --------------------
jest.mock("../src/app/tools/actions", () => ({
  loadTools: jest.fn(),
  loadCategories: jest.fn(),
  loadAreas: jest.fn(),
  storeTools: jest.fn(),
  deleteTool: jest.fn(),
}))

afterEach(() => jest.clearAllMocks())

describe("Tools page – minimal flow", () => {
  it("loads tools, creates one and deletes one (no UI assertions)", async () => {
    // Initial load returns empty array
    loadTools.mockResolvedValueOnce([])
    
    loadCategories.mockResolvedValue([{ id: "1", name: "Werkzeug" }])
    loadAreas.mockResolvedValue([{ id: "1", name: "Werkstatt" }])

    // After creating, return the new tool
    const newTool = { 
      id: "1", 
      name: "Bohrer", 
      category: "Werkzeug",
      area: "Werkstatt"
    }
    storeTools.mockResolvedValue(newTool)
    
    // Second load after creation returns the new tool
    loadTools.mockResolvedValueOnce([newTool])
    
    deleteTool.mockResolvedValue({ success: true })

    jest.spyOn(window, "confirm").mockReturnValue(true)
    jest.spyOn(window, "alert").mockImplementation(() => {})

    render(<Tools />)

    // 1️⃣ LOAD
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    // 2️⃣ CREATE
    fireEvent.click(screen.getByText("Create Tool"))

    // Wait for the form to appear
    const nameInput = await screen.findByPlaceholderText("Tool-Name")
    fireEvent.change(nameInput, {
      target: { value: "Bohrer" },
    })

    // Try to find category field by different methods
    let categoryField
    
    // Try as a select element
    try {
      categoryField = screen.getByDisplayValue("") // Empty select
      if (!categoryField) {
        const selects = screen.getAllByRole("combobox", { hidden: true })
        categoryField = selects.find(s => s.name?.includes("categ") || s.id?.includes("categ"))
      }
    } catch {
      // Try finding by any input after the name field
      const inputs = screen.getAllByRole("textbox")
      categoryField = inputs[1] // Second input might be category
    }

    if (categoryField) {
      fireEvent.change(categoryField, {
        target: { value: "Werkzeug" },
      })
    }

    // Submit the form
    fireEvent.click(screen.getByText("Erstellen"))

    // Wait for storeTools to be called
    await waitFor(() => expect(storeTools).toHaveBeenCalled())

    // Wait for the tool to appear in the list (the component should reload tools)
    await waitFor(() => {
      expect(screen.queryByText("Bohrer")).toBeInTheDocument()
    }, { timeout: 3000 })

    // 3️⃣ DELETE
    const deleteButton = await screen.findByText("Löschen")
    fireEvent.click(deleteButton)

    await waitFor(() => expect(deleteTool).toHaveBeenCalled())
  })
})