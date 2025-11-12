import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Page from "../src/app/page";

describe("Page", () => {
  it("renders a heading", () => {
    render(<Page />);

    // The top-level title in the current markup is "Fieldmaster"
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Fieldmaster",
    });

    expect(heading).toBeInTheDocument();
  });
});

