describe("Test User Login", () => {
  it("1- Connects with Metamask", () => {
    cy.visit("http://localhost:3000");
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
    // check UI change
    cy.contains("100").should("be.visible");
    cy.contains("0x").should("be.visible");
  });
});
