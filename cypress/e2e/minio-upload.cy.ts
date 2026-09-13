describe('MinIO File Upload', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should open add transaction modal', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Add Transaction').should('be.visible');
  });

  it('should show document upload component in modal', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Attach Documents').should('be.visible');
  });

  it('should have file upload button', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Attach Documents').should('be.visible');
    cy.get('input[type="file"]').should('exist');
  });

  it('should have camera capture button', () => {
    cy.contains('button', /add transaction/i).click();
    cy.contains('Attach Documents').should('be.visible');
    // Camera button may be visible depending on device
    cy.contains(/camera/i).should('exist');
  });

  it('should upload file via API', () => {
    // Create a test file
    const fileName = 'test-receipt.png';
    const fileContent = Cypress.Buffer.from('test file content');
    
    cy.intercept('POST', 'http://localhost:8080/documents/upload').as('uploadRequest');
    
    cy.contains('button', /add transaction/i).click();
    cy.contains('Attach Documents').should('be.visible');
    
    // Select file using selectFile (Cypress 10+)
    cy.get('input[type="file"]').selectFile({
      contents: fileContent,
      fileName,
      mimeType: 'image/png',
    });
    
    // Click upload button
    cy.contains('button', /upload/i).click();
    
    // Wait for API call
    cy.wait('@uploadRequest').then((interception) => {
      if (interception.response) {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('success', true);
      }
    });
  });

  it('should handle upload errors gracefully', () => {
    cy.intercept('POST', 'http://localhost:8080/documents/upload', {
      statusCode: 500,
      body: { error: 'Upload failed' },
    }).as('uploadError');
    
    cy.contains('button', /add transaction/i).click();
    cy.contains('Attach Documents').should('be.visible');
    
    // Try to upload
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('test'),
      fileName: 'test.png',
      mimeType: 'image/png',
    });
    
    cy.contains('button', /upload/i).click();
    
    cy.wait('@uploadError');
    
    // Error modal should appear
    cy.contains(/error/i).should('be.visible');
  });
});
