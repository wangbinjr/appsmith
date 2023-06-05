const commonlocators = require("../../../../locators/commonlocators.json");
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Dynamic Height Width validation", function () {
  it("1. Validate change with auto height width for List widgets", function () {
    cy.fixture("ResizeListDsl").then((val) => {
      _.agHelper.AddDsl(val);
    });
    cy.get(".t--entity-collapse-toggle").eq(2).click({ force: true });
    cy.get(".t--entity-collapse-toggle").eq(3).click({ force: true });
    cy.get(".t--entity-collapse-toggle").eq(4).click({ force: true });
    cy.get(".t--entity-name").contains("List1").click({ force: true });
    cy.openPropertyPane("listwidgetv2");
    cy.get(".t--widget-listwidgetv2")
      .invoke("css", "height")
      .then((lheight) => {
        cy.get(commonlocators.generalSectionHeight).should("not.exist");
        cy.moveToStyleTab();
        cy.testJsontext("itemspacing\\(px\\)", "16");
        cy.get(".t--widget-listwidgetv2")
          .invoke("css", "height")
          .then((newheight) => {
            expect(lheight).to.equal(newheight);
            cy.get(".rc-pagination:contains('5')").should("exist");
          });
      });
  });
});
