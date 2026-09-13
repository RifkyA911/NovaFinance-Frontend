describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display dashboard page', () => {
    cy.contains('Dashboard').should('be.visible');
  });

  it('should open add transaction modal', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Add Transaction').should('be.visible');
  });

  it('should fill transaction form fields', () => {
    cy.contains('button', /add transaction/i).click();
    
    cy.get('input[placeholder="Enter description"]').type('Test Transaction');
    cy.get('input[placeholder="Enter amount"]').type('100');
    
    cy.get('select').eq(0).select('1'); // Select category
    cy.get('select').eq(1).select('1'); // Select account
    
    cy.get('input[type="date"]').should('exist');
  });

  it('should open filter modal', () => {
    cy.contains('button', /filter/i).click();
    cy.contains('Filter').should('be.visible');
  });

  it('should toggle category filter checkboxes', () => {
    cy.contains('button', /filter/i).click();
    
    cy.get('input[type="checkbox"]').first().check();
    cy.get('input[type="checkbox"]').first().should('be.checked');
  });

  it('should close modal when clicking cancel', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Add Transaction').should('be.visible');
    
    cy.contains('button', /cancel/i).click();
    cy.contains('Add Transaction').should('not.exist');
  });
});
