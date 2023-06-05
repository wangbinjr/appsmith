const widgetsPage = require("../../../../../locators/Widgets.json");

import * as _ from "../../../../../support/Objects/ObjectsCore";

describe("List Widget V2 Functionality", function () {
  before(() => {
    cy.fixture("Listv2/simpleLargeListv2").then((val) => {
      _.agHelper.AddDsl(val);
    });
  });

  const allowed = [
    "audiowidget",
    "buttongroupwidget",
    "buttonwidget",
    "chartwidget",
    "checkboxwidget",
    "checkboxgroupwidget",
    "dividerwidget",
    "iconbuttonwidget",
    "iframewidget",
    "imagewidget",
    "inputwidgetv2",
    "mapchartwidget",
    "mapwidget",
    "menubuttonwidget",
    "progresswidget",
    "statboxwidget",
    "switchwidget",
    "switchgroupwidget",
    "textwidget",
    "videowidget",
    "containerwidget",
    "tablewidgetv2",
    "radiogroupwidget",
    "tabswidget",
    "richtexteditorwidget",
    "datepickerwidget2",
    "formwidget",
    "filepickerwidgetv2",
    "audiorecorderwidget",
    "documentviewerwidget",
    "multiselecttreewidget",
    "singleselecttreewidget",
    "camerawidget",
    "selectwidget",
    "multiselectwidgetv2",
    "phoneinputwidget",
    "currencyinputwidget",
    "listwidgetv2",
  ];

  it(
    "excludeForAirgap",
    "should validate that all widgets can be added to List",
    () => {
      _.entityExplorer.NavigateToSwitcher("Widgets");

      allowed.forEach((widget) => {
        cy.dragAndDropToWidget(widget, "listwidgetv2", { x: 350, y: 50 });
        cy.assertPageSave();
        cy.get(`.t--draggable-${widget}`).should("exist");
        cy.get(widgetsPage.removeWidget).click({ force: true });
        cy.wait("@updateLayout");
      });
    },
  );

  it(
    "airgap",
    "should validate that all widgets can be added to List except mapwidget - airgap",
    () => {
      _.entityExplorer.NavigateToSwitcher("Widgets");
      const airgapAllowed = allowed.filter((widget) => widget !== "mapwidget");
      airgapAllowed.forEach((widget) => {
        cy.dragAndDropToWidget(widget, "listwidgetv2", { x: 350, y: 50 });
        cy.assertPageSave();
        cy.get(`.t--draggable-${widget}`).should("exist");
        cy.get(widgetsPage.removeWidget).click({ force: true });
        cy.wait("@updateLayout");
      });
    },
  );
});
