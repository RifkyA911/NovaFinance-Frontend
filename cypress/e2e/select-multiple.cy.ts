describe('Select Multiple Selection', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should open filter modal', () => {
    cy.get('button').contains('Filter').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should display category select', () => {
    cy.get('button').contains('Filter').click();
    cy.contains('Category').should('be.visible');
  });

  it('should display currencies select', () => {
    cy.get('button').contains('Filter').click();
    cy.contains('Currencies').should('be.visible');
  });

  it('should display platform select', () => {
    cy.get('button').contains('Filter').click();
    cy.contains('Platform Income').should('be.visible');
  });

  it('should close modal', () => {
    cy.get('button').contains('Filter').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('button[aria-label="Close"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });
});
