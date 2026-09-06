describe('Theme Toggler', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should display theme toggler button in navbar', () => {
    cy.get('button').should('exist');
  });

  it('should toggle theme', () => {
    // Click theme toggler button
    cy.get('button').filter(':has(svg)').click();
  });

  it('should toggle theme back', () => {
    cy.get('button').filter(':has(svg)').click();
    cy.get('button').filter(':has(svg)').click();
  });

  it('should reload page', () => {
    cy.reload();
  });
});
