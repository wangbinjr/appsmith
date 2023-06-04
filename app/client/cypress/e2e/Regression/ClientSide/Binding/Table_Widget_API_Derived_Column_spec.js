const commonlocators = require("../../../../locators/commonlocators.json");
const dsl = require("../../../../fixtures/tableTextPaginationDsl.json");
const testdata = require("../../../../fixtures/testdata.json");
const widgetsPage = require("../../../../locators/Widgets.json");
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Test Create Api and Bind to Table widget", function () {
  before(() => {
    cy.addDsl(dsl);
  });

  it("1. Create an API and Execute the API and bind with Table", function () {
    _.apiPage.CreateAndFillApi(
      this.dataSet.paginationUrl + this.dataSet.paginationParam,
    );

    cy.RunAPI();
    //Validate Table with API data and then add a column
    _.entityExplorer.SelectEntityByName("Table1", "Widgets");
    _.propPane.UpdatePropertyFieldValue("Table data", "{{Api1.data}}");
    cy.CheckWidgetProperties(commonlocators.serverSidePaginationCheckbox);
    _.entityExplorer.SelectEntityByName("Text1");

    _.propPane.UpdatePropertyFieldValue("Text", "{{Table1.selectedRow.url}}");
    _.entityExplorer.SelectEntityByName("Table1");

    cy.readTabledata("0", "4").then((tabData) => {
      const tableData = tabData;
      localStorage.setItem("tableDataPage1", tableData);
    });
    cy.readTabledata("0", "4").then((tabData) => {
      const tableData = tabData;
      expect(tableData).to.equal("1");
    });
    cy.addColumn("CustomColumn");
    cy.editColumn("customColumn1");
    cy.editColName("UpdatedColName");
    cy.readTabledataPublish("0", "2").then((tabData) => {
      const tabValue = tabData;
      cy.updateComputedValue(testdata.currentRowEmail);
      cy.readTabledataPublish("0", "2").then((tabData) => {
        expect(tabData).to.be.equal(tabValue);
        cy.log("computed value of plain text " + tabData);
      });
    });
    _.propPane.NavigateBackToPropertyPane();
  });

  it("2. Check Image alignment is working as expected", function () {
    _.entityExplorer.SelectEntityByName("Table1", "Widgets");
    cy.editColumn("avatar");
    cy.changeColumnType("Image", false);
    _.propPane.NavigateBackToPropertyPane();
    _.entityExplorer.SelectEntityByName("Table1");
    cy.xpath(widgetsPage.textCenterAlign).first().click({ force: true });
    cy.get(`.t--widget-tablewidget .tbody .image-cell`)
      .first()
      .should("have.css", "background-position", "50% 50%");
    _.entityExplorer.SelectEntityByName("Table1");
    cy.xpath(widgetsPage.rightAlign).first().click({ force: true });
    cy.get(`.t--widget-tablewidget .tbody .image-cell`)
      .first()
      .should("have.css", "background-position", "100% 50%");
    _.entityExplorer.SelectEntityByName("Table1");
    cy.xpath(widgetsPage.leftAlign).first().click({ force: true });
    cy.get(`.t--widget-tablewidget .tbody .image-cell`)
      .first()
      .should("have.css", "background-position", "0% 50%");
  });

  it("3. Update table json data and check the derived column values after update", function () {
    _.entityExplorer.SelectEntityByName("Table1", "Widgets");
    cy.backFromPropertyPanel();
    cy.tableColumnDataValidation("id");
    cy.tableColumnDataValidation("name");
    cy.tableColumnDataValidation("status");
    cy.tableColumnDataValidation("gender");
    cy.tableColumnDataValidation("avatar");
    cy.tableColumnDataValidation("email");
    cy.tableColumnDataValidation("address");
    cy.tableColumnDataValidation("customColumn1");
    cy.testJsontext("tabledata", JSON.stringify(this.dataSet.TableInputUpdate));
    cy.wait("@updateLayout");
    cy.tableColumnDataValidation("id");
    cy.tableColumnDataValidation("email");
    cy.tableColumnDataValidation("userName");
    cy.tableColumnDataValidation("productName");
    cy.tableColumnDataValidation("orderAmount");
    cy.tableColumnDataValidation("customColumn1");
    cy.hideColumn("email");
    cy.hideColumn("userName");
    cy.hideColumn("productName");
    cy.hideColumn("orderAmount");
    cy.get(".draggable-header:contains('UpdatedColName')")
      .scrollIntoView()
      .should("be.visible");
    cy.readTabledataPublish("1", "2").then((tabData) => {
      const tabValue = tabData;
      cy.readTabledataPublish("1", "2").then((tabData) => {
        cy.log("computed value of plain text " + tabData);
        expect(tabData).to.be.equal(tabValue);
      });
      //_.propPane.NavigateBackToPropertyPane();
    });
  });
});
