describe('Login Redirect', () => {
  it('should redirect authenticated user from login to dashboard', () => {
    // First login
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Try to access login page again
    cy.visit('/login');
    
    // Should be redirected back to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should redirect unauthenticated user to login', () => {
    // Clear cookies to simulate logout
    cy.clearCookies();
    
    // Try to access protected route
    cy.visit('/dashboard');
    
    // Should be redirected to login
    cy.url().should('include', '/login');
  });

  it('should redirect unauthenticated user from portfolio to login', () => {
    cy.clearCookies();
    cy.visit('/portfolio');
    cy.url().should('include', '/login');
  });

  it('should redirect unauthenticated user from transactions to login', () => {
    cy.clearCookies();
    cy.visit('/transactions');
    cy.url().should('include', '/login');
  });

  it('should allow access to login page when not authenticated', () => {
    cy.clearCookies();
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.get('input[type="email"]').should('be.visible');
  });
});
