/* eslint-disable cypress/no-unnecessary-waiting */
const dsl = require("../../../../../fixtures/tableResizedColumnsDsl.json");
import * as _ from "../../../../../support/Objects/ObjectsCore";

describe("Table Widget Functionality with Hidden and Resized Columns", function () {
  before(() => {
    cy.addDsl(dsl);
  });

  it("Table Widget Functionality with Hidden and Resized Columns", function () {
    _.deployMode.DeployApp();
    // Verify column header width should be equal to table width
    cy.get(".t--widget-tablewidget")
      .invoke("outerWidth")
      .then((tableWidth) => {
        cy.get(".t--widget-tablewidget .thead .tr")
          .invoke("outerWidth")
          .then((columnHeaderWidth) => {
            expect(columnHeaderWidth).to.be.at.least(tableWidth);
          });
      });
  });
});
