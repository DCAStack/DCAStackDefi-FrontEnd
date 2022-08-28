describe("Test User Login", () => {
  it("1- Visit Home Page", () => {
    cy.visit("http://localhost:3000");
    cy.wait(1000);
    cy.contains("Home").should("be.visible");
  });
  it("2- Connects with Metamask", () => {
    // find "Connect Wallet" button and click it
    cy.contains("Connect Wallet").click();
    cy.contains("MetaMask").click();
    // assuming there is only metamask popping up
    // always important to switch between metamask and cypress window
    cy.switchToMetamaskWindow();
    // connect to dapp
    cy.acceptMetamaskAccess().should("be.true");
    // cy.confirmMetamaskSignatureRequest();
    // switch back to cypress window (your dApp)
    // cy.activateCustomNonceInMetamask();

    cy.switchToCypressWindow();
    cy.wait(1000);
    // check UI change
    cy.contains("100").should("be.visible");
    cy.contains("0x").should("be.visible");
  });
});
