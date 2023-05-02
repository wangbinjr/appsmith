import commonlocators from "../../../../locators/commonlocators.json";

let theight: string;
let twidth: string;

describe("Validating Mobile View related usecases for Autoscroll", function () {
  it("Capture the height/width of autofill widgets in webview", function () {
    cy.get(commonlocators.autoConvert).click({
      force: true,
    });
    cy.get(commonlocators.convert).click({
      force: true,
    });
    cy.get(commonlocators.refreshApp).click({
      force: true,
    });
    cy.wait(2000);
    cy.dragAndDropToCanvas("listwidgetv2", { x: 100, y: 200 });
    cy.dragAndDropToCanvas("containerwidget", { x: 620, y: 820 });
    for (let i = 0; i < 10; i++) {
      cy.dragAndDropToCanvas("inputwidgetv2", { x: 450, y: 530 });
    }
    cy.get(".t--widget-inputwidgetv2").first().should("be.visible");
    cy.PublishtheApp();
    cy.wait(2000);
    cy.get(".t--widget-inputwidgetv2")
      .invoke("css", "height")
      .then((newheight: string) => {
        theight = newheight;
      });
    cy.get(".t--widget-inputwidgetv2")
      .invoke("css", "width")
      .then((newwidth: string) => {
        twidth = newwidth;
      });
  });

  let phones: Array<[number, number]> = [
    [390, 844],
    [360, 780],
  ];

  phones.forEach((phone: [number, number]) => {
    it(`${phone} port execution for autoscroll`, function () {
      if (Array.isArray(phone)) {
        cy.viewport(phone[0], phone[1]);
      } else {
        cy.viewport(phone);
      }
      cy.wait(2000);
      for (let i = 0; i < 10; i++) {
        cy.get(".t--widget-inputwidgetv2")
          .eq(i)
          .scrollIntoView()
          .invoke("css", "height")
          .then((newheight: string) => {
            expect(theight).to.equal(newheight);
          });
        cy.get(".t--widget-inputwidgetv2")
          .eq(i)
          .scrollIntoView()
          .invoke("css", "width")
          .then((newwidth: string) => {
            expect(twidth).to.not.equal(newwidth);
          });
      }
    });
  });
});
