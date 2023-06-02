const commonlocators = require("../../../../../locators/commonlocators.json");
const viewWidgetsPage = require("../../../../../locators/ViewWidgets.json");
const publish = require("../../../../../locators/publishWidgetspage.json");
const widgetsPage = require("../../../../../locators/Widgets.json");
const dsl = require("../../../../../fixtures/displayWidgetDsl.json");
import * as _ from "../../../../../support/Objects/ObjectsCore";

describe("Image Widget Functionality", function () {
  before(() => {
    cy.addDsl(dsl);
  });

  it("1. Image Widget Functionality", function () {
    cy.openPropertyPane("imagewidget");
    /**
     * @param{Text} Random Text
     * @param{ImageWidget}Mouseover
     * @param{ImagePre Css} Assertion
     */
    cy.widgetText(
      "img",
      viewWidgetsPage.imageWidget,
      widgetsPage.widgetNameSpan,
    );
    cy.testJsontext("defaultimage", this.data.defaultimage);
    cy.wait(1000);
    cy.focused().blur();
    /**
     * @param{URL} ImageUrl
     */
    cy.testCodeMirror(this.data.NewImage);
    cy.get(viewWidgetsPage.imageinner)
      .invoke("attr", "src")
      .should("contain", this.data.validateImage);
    cy.closePropertyPane();
  });

  it("2. No Zoom functionality check", function () {
    cy.openPropertyPane("imagewidget");
    //Zoom validation
    cy.changeZoomLevel("1x (No Zoom)");

    cy.get(commonlocators.imgWidget)
      .invoke("attr", "style")
      .should("not.contain", "zoom-in");
    _.deployMode.DeployApp();
    // Image Widget Functionality To Validate Image
    cy.get(publish.imageWidget + " " + "img")
      .invoke("attr", "src")
      .should("contain", this.data.NewImage);
  });

  it("3. Image Widget Functionality To Unchecked Visible Widget", function () {
    _.deployMode.NavigateBacktoEditor();
    cy.openPropertyPane("imagewidget");
    cy.togglebarDisable(commonlocators.visibleCheckbox);
    _.deployMode.DeployApp();
    cy.get(publish.imageWidget).should("not.exist");
    _.deployMode.NavigateBacktoEditor();
  });

  it("4. Image Widget Functionality To Check Visible Widget", function () {
    cy.openPropertyPane("imagewidget");
    cy.togglebar(commonlocators.visibleCheckbox);
    _.deployMode.DeployApp();
    cy.get(publish.imageWidget).should("be.visible");
    _.deployMode.NavigateBacktoEditor();
  });

  it("5. Image Widget Functionality To check download option and validate image link", function () {
    cy.openPropertyPane("imagewidget");
    cy.togglebar(".t--property-control-enabledownload input[type='checkbox']");
    cy.get(publish.imageWidget).trigger("mouseover");
    cy.get(`${publish.imageWidget} a[data-testid=t--image-download]`).should(
      "have.attr",
      "href",
      this.data.NewImage,
    );
  });

  it("6. In case of an image loading error, show off the error message", () => {
    cy.openPropertyPane("imagewidget");
    // Invalid image url
    const invalidImageUrl = "https://www.example.com/does-not-exist.jpg";
    cy.testCodeMirror(invalidImageUrl);

    // Show off error message
    cy.get(
      `${viewWidgetsPage.imageWidget} div[data-testid=styledImage]`,
    ).should("not.exist");
    cy.get(
      `${viewWidgetsPage.imageWidget} [data-testid="error-container"]`,
    ).contains("Unable to display the image");
  });
});
afterEach(() => {
  // put your clean up code if any
});
