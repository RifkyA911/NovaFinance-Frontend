describe('Filter Functionality', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should open filter modal', () => {
    cy.get('button').contains('Filter').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should select time range filter', () => {
    cy.get('button').contains('Filter').click();
    cy.get('select').should('exist');
  });

  it('should set equity range filters', () => {
    cy.get('button').contains('Filter').click();
    cy.get('input[type="number"]').should('exist');
  });

  it('should close modal', () => {
    cy.get('button').contains('Filter').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('button[aria-label="Close"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should display filter button', () => {
    cy.get('button').contains('Filter').should('be.visible');
  });
});
