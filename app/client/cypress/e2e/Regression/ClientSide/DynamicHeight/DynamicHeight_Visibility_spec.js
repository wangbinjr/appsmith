const commonlocators = require("../../../../locators/commonlocators.json");
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Dynamic Height Width validation for Visibility", function () {
  before(() => {
    cy.fixture("invisibleWidgetdsl").then((val) => {
      _.agHelper.AddDsl(val);
    });
  });
  it("1. Validating visbility/invisiblity of widget with dynamic height feature", function () {
    //changing the Text Name and verifying
    cy.wait(3000);
    cy.openPropertyPane("containerwidget");
    cy.changeLayoutHeightWithoutWait(commonlocators.autoHeight);
    cy.openPropertyPaneWithIndex("inputwidgetv2", 0);
    cy.changeLayoutHeightWithoutWait(commonlocators.autoHeight);
    cy.openPropertyPaneWithIndex("inputwidgetv2", 1);
    cy.changeLayoutHeightWithoutWait(commonlocators.autoHeight);
    cy.get(".t--widget-containerwidget")
      .invoke("css", "height")
      .then((theight) => {
        cy.get(commonlocators.checkboxIndicator).click({ force: true });
        cy.get(".t--widget-containerwidget")
          .invoke("css", "height")
          .then((tnewheight) => {
            expect(theight).to.equal(tnewheight);
            cy.get("label:Contains('On')").should("not.be.enabled");
          });
      });
    _.deployMode.DeployApp();
    cy.get(".t--widget-containerwidget")
      .invoke("css", "height")
      .then((theight) => {
        cy.get(".bp3-control-indicator").click({ force: true });
        cy.wait(2000);
        cy.get(".t--widget-containerwidget")
          .invoke("css", "height")
          .then((tnewheight) => {
            expect(theight).to.not.equal(tnewheight);
            cy.get("label:Contains('On')").should("not.exist");
            cy.get("label:Contains('Off')").should("be.visible");
            cy.get(".bp3-control-indicator").click({ force: true });
            cy.wait(2000);
            cy.get(".t--widget-containerwidget")
              .invoke("css", "height")
              .then((tonheight) => {
                expect(tonheight).to.not.equal(tnewheight);
                cy.get("label:Contains('Off')").should("not.exist");
                cy.get("label:Contains('On')").should("be.visible");
              });
          });
      });
  });
});
