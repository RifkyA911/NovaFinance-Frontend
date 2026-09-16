describe('Income Transaction Flow', () => {
  beforeEach(() => {
    // Setup login state if required by your app's flow
    cy.clearCookies();
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to finish
    cy.wait(3000);
  });

  it('should correctly select INCOME mode and submit payload to backend', () => {
    // Intercept the API call to verify the exact payload sent to backend
    cy.intercept('POST', '**/api/transactions').as('createTransaction');
    
    // Visit the new transaction page
    cy.visit('/transactions/new');
    
    // Wait for page to load
    cy.contains('h1', 'New Transaction').should('be.visible');

    // 1. Fill Description
    cy.get('input[placeholder="Enter description"]').type('Test Income Transaction');
    
    // 2. Fill Amount
    cy.get('input[placeholder="Enter amount"]').type('7500000');
    
    // 3. Click the Income button
    cy.contains('button', 'Income').click();

    // Verify it got selected (e.g., checking if it has the active class)
    cy.contains('button', 'Income').should('have.class', 'bg-green-500');

    // 4. Submit the form
    cy.get('button[type="submit"]').click();

    // 5. Verify the intercepted API call
    cy.wait('@createTransaction').then((interception) => {
      // Assert that the request body matches exactly what the BE expects
      const body = interception.request.body;
      
      expect(body.type).to.equal('income');
      expect(body.amount).to.equal('7500000');
      expect(body.description).to.equal('Test Income Transaction');
      
      // Category is optional, so it can be undefined or omitted. 
      // If it exists, it should be a string UUID
      if (body.categoryId !== undefined) {
        expect(body.categoryId).to.be.a('string');
      }
    });

    // 6. Verify successful redirect back to transactions
    cy.url().should('include', '/transactions');
  });
});
