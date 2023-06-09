/// <reference types="Cypress" />
import { ObjectsRegistry } from "../../../support/Objects/Registry";
import reconnectDatasourceModal from "../../../locators/ReconnectLocators";

const themelocators = require("../../../locators/ThemeLocators.json");

let homePage = ObjectsRegistry.HomePage,
  agHelper = ObjectsRegistry.AggregateHelper;

const widgetName = "currencyinputwidget";
const wiggetClass = `.t--widget-${widgetName}`;
const widgetInput = `${wiggetClass} input`;

describe("Currency Input Issue", function () {
  it("1. Import application json &should check that the widget input is not showing any error", function () {
    cy.visit("/applications");
    homePage.ImportApp("CurrencyInputIssueExport.json");
    cy.wait("@importNewApplication").then((interception) => {
      agHelper.Sleep();
      const { isPartialImport } = interception.response.body.data;
      if (isPartialImport) {
        cy.get(reconnectDatasourceModal.SkipToAppBtn).click({
          force: true,
        });
        cy.wait(2000);
      } else {
        homePage.AssertImportToast();
      }
    });
    cy.get(widgetInput).type("123456789");
    cy.focused().then(() => {
      cy.get(themelocators.popover).should("not.exist");
    });
  });
});
