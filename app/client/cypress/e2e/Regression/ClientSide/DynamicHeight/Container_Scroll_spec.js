const dsl = require("../../../../fixtures/dynamicHeightContainerScrolldsl.json");

describe("Dynamic Height Width validation", function () {
  it("1. Validate change with auto height width for widgets", function () {
    cy.addDsl(dsl);
    cy.wait(3000); //for dsl to settle
    cy.openPropertyPane("containerwidget");
    cy.get(".t--widget-textwidget").trigger("mouseover", { force: true }); // Scroll 'sidebar' to its bottom
    cy.openPropertyPane("textwidget");
    //_.deployMode.DeployApp();
    //cy.wait(5000);
    //cy.get(".t--widget-containerwidget").trigger("mouseover",{force:true}) // Scroll 'sidebar' to its bottom
    cy.wait(5000);
  });
});
