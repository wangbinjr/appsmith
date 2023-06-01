/// <reference types="Cypress" />

const dsl = require("../../../../fixtures/listwidgetdsl.json");
const publishPage = require("../../../../locators/publishWidgetspage.json");
import apiLocators from "../../../../locators/ApiEditor";

import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Test Create Api and Bind to List widget", function () {
  let valueToTest;
  before(() => {
    cy.addDsl(dsl);
  });

  it("1. Test_Add users api and execute api", function () {
    _.apiPage.CreateAndFillApi(this.data.userApi + "/mock-api?records=10");
    cy.RunAPI();
    cy.get(apiLocators.jsonResponseTab).click();
    cy.get(apiLocators.responseBody)
      .contains("name")
      .siblings("span")
      .invoke("text")
      .then((text) => {
        valueToTest = `${text
          .match(/"(.*)"/)[0]
          .split('"')
          .join("")}`;
        cy.log(valueToTest);
        cy.log("val1:" + valueToTest);
      });
  });

  it("2. Test_Validate the Api data is updated on List widget", function () {
    _.entityExplorer.SelectEntityByName("List1");

    cy.testJsontext("items", "{{Api1.data}}");
    cy.get(".t--draggable-textwidget span").should("have.length", 8);
    cy.get(".t--draggable-textwidget span")
      .first()
      .invoke("text")
      .then((text) => {
        expect(text).to.equal(valueToTest);
      });
    _.deployMode.DeployApp();
    cy.wait("@postExecute").then((interception) => {
      valueToTest = JSON.stringify(
        interception.response.body.data.body[0].name,
      ).replace(/['"]+/g, "");
    });
    cy.waitUntil(
      () => cy.get(".t--widget-textwidget span").should("be.visible"),
      {
        errorMsg: "Pubish app page is not loaded evn after 20 secs",
        timeout: 20000,
        interval: 1000,
      },
    ).then(() => cy.wait(500));

    cy.get(".t--widget-textwidget span").should("have.length", 8);
    cy.get(".t--widget-textwidget span")
      .first()
      .invoke("text")
      .then((text) => {
        expect(text).to.equal(valueToTest);
      });
  });

  it("3. Test_Validate the list widget ", function () {
    cy.get(publishPage.backToEditor).click({ force: true });
    cy.wait("@postExecute").then((interception) => {
      valueToTest = JSON.stringify(
        interception.response.body.data.body[0].name,
      ).replace(/['"]+/g, "");
    });
    _.entityExplorer.SelectEntityByName("List1", "Widgets");
    cy.moveToStyleTab();
    cy.testJsontext("itemspacing\\(px\\)", "50");
    cy.get(".t--draggable-textwidget span").should("have.length", 6);
    cy.get(".t--draggable-textwidget span")
      .first()
      .invoke("text")
      .then((text) => {
        expect(text).to.equal(valueToTest);
      });
    _.deployMode.DeployApp();
    cy.wait("@postExecute").then((interception) => {
      valueToTest = JSON.stringify(
        interception.response.body.data.body[0].name,
      ).replace(/['"]+/g, "");
    });
    cy.waitUntil(
      () => cy.get(".t--widget-textwidget span").should("be.visible"),
      {
        errorMsg: "Pubish app page is not loaded evn after 20 secs",
        timeout: 20000,
        interval: 1000,
      },
    ).then(() => cy.wait(500));
    cy.get(".t--widget-textwidget span").should("have.length", 6);
    cy.get(".t--widget-textwidget span")
      .first()
      .invoke("text")
      .then((text) => {
        expect(text).to.equal(valueToTest);
      });
  });

  afterEach(() => {
    // put your clean up code if any
  });
});
