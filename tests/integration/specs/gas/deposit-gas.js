describe("Test Gas Deposit", () => {
  it("1- Visit Gas Page", () => {
    cy.visit("http://localhost:3000/gas");
    cy.wait(1000);
    cy.contains("Gas").should("be.visible");
  });
  it("2- Connect Wallet", () => {
    cy.contains("Connect Wallet").click();
    cy.wait(1000);

    cy.contains("MetaMask").click();
    cy.wait(1000);

    cy.switchToMetamaskWindow();

    cy.acceptMetamaskAccess().should("be.true");
    cy.wait(1000);

    // cy.activateCustomNonceInMetamask();
    cy.switchToCypressWindow();
    cy.wait(1000);
    cy.contains("100").should("be.visible");
    cy.contains("0x").should("be.visible");
  });
});
