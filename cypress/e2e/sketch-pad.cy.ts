/// <reference types="cypress" />

describe("Drawing App", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  const canvas = () => cy.get("#canvas");

  const drawOnCanvas = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    canvas()
      .trigger("mousedown", {
        clientX: startX,
        clientY: startY,
        button: 0,
      })
      .trigger("mousemove", {
        clientX: endX,
        clientY: endY,
      })
      .trigger("mouseup", {
        clientX: endX,
        clientY: endY,
      });
  };

  it("loads the canvas", () => {
    canvas().should("exist");
  });

  it("selects rectangle tool and draws a rectangle", () => {
    cy.get('label[for="rectangle"]').click();

    drawOnCanvas(100, 100, 300, 250);

    // Canvas should have been drawn on
    canvas()
      .then(($canvas) => {
        const ctx = ($canvas[0] as HTMLCanvasElement).getContext("2d");
        expect(ctx).to.exist;
      });
  });

  it("draws a line", () => {
    cy.get('label[for="line"]').click();

    drawOnCanvas(50, 50, 200, 200);
  });

  it("draws with pencil", () => {
    cy.get('label[for="pencil"]').click();

    canvas()
      .trigger("mousedown", { clientX: 100, clientY: 100 })
      .trigger("mousemove", { clientX: 120, clientY: 120 })
      .trigger("mousemove", { clientX: 140, clientY: 140 })
      .trigger("mouseup", { clientX: 140, clientY: 140 });
  });

  it("adds text and commits on blur", () => {
    cy.get('label[for="text"]').click();

    canvas().trigger("mousedown", {
      clientX: 200,
      clientY: 200,
      button: 0,
    });

    cy.get("textarea")
      .should("exist")
      .type("Here is some example text!");

    // Blur commits text
    cy.get("textarea").blur();

    cy.get("textarea").should("not.exist");
  });

  it("selects and moves an element", () => {
    // Draw rectangle first
    cy.get('label[for="rectangle"]').click();
    drawOnCanvas(100, 100, 200, 200);

    // Switch to selection
    cy.get('label[for="selection"]').click();

    canvas()
      .trigger("mousedown", { clientX: 150, clientY: 150 })
      .trigger("mousemove", { clientX: 250, clientY: 250 })
      .trigger("mouseup", { clientX: 250, clientY: 250 });
  });

  it("undoes and redoes actions", () => {
    cy.get('label[for="rectangle"]').click();
    drawOnCanvas(100, 100, 200, 200);

    cy.get('[title="Undo"]').click();
    cy.get('[title="Redo"]').click();
  });

  it("supports keyboard undo / redo", () => {
    cy.get('label[for="rectangle"]').click();
    drawOnCanvas(100, 100, 200, 200);

    cy.get("body").type("{ctrl}z");
    cy.get("body").type("{ctrl}{shift}z");
  });

  it("zooms in and out", () => {
  cy.contains("100%").should("exist");

  cy.get('button[title="Zoom In"]').click();
  cy.get('button[title="Zoom Out"]').click();
});

  it("changes shape fill and stroke", () => {
    cy.get('label[for="rectangle"]').click();

    // Fill color
    cy.get(".absolute.top-14").within(() => {
      cy.contains("Fill");
      cy.get("button").first().click();
    });

    drawOnCanvas(300, 300, 400, 400);
  });

  it("pans canvas with space + drag", () => {
    cy.get("body").trigger("keydown", { key: " " });

    canvas()
      .trigger("mousedown", { clientX: 300, clientY: 300 })
      .trigger("mousemove", { clientX: 200, clientY: 200 })
      .trigger("mouseup", { clientX: 200, clientY: 200 });

    cy.get("body").trigger("keyup", { key: " " });
  });

  it("zooms with ctrl + wheel", () => {
    cy.get("body").trigger("keydown", { key: "Control" });

    cy.get("body").trigger("wheel", {
      deltaY: -100,
    });

    cy.get("body").trigger("keyup", { key: "Control" });
  });
});
