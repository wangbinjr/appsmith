const publish = require("../../../../locators/publishWidgetspage.json");
const testdata = require("../../../../fixtures/testdata.json");
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Binding the button Widgets and validating NavigateTo Page functionality", function () {
  before(() => {
    cy.fixture("buttondsl").then((val) => {
      _.agHelper.AddDsl(val);
    });
  });

  it("1. Button widget with action navigate to page", function () {
    cy.openPropertyPane("buttonwidget");
    _.propPane.SelectPlatformFunction("onClick", "Navigate to");
    _.agHelper.GetNClick(_.propPane._navigateToType("URL"));
    cy.get("label")
      .contains("Enter URL")
      .siblings("div")
      .within(() => {
        cy.get(".t--code-editor-wrapper").type(testdata.externalPage);
      });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(300);
  });

  it("2. Button click should take the control to page link validation", function () {
    _.deployMode.DeployApp();
    cy.wait(2000);
    cy.get(publish.buttonWidget).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get(publish.buttonWidget).should("not.exist");
    cy.go("back");
    _.deployMode.NavigateBacktoEditor();
    cy.wait("@getPage")
      .its("response.body.responseMeta.status")
      .should("eq", 200);
  });
});
