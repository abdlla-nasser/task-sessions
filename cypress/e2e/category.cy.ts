describe('Category Management', () => {
  before(() => {
    // Visit the app and login once before all tests
    cy.visit('/auth');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Log In').click();
    // Wait for redirect to home page
    cy.url().should('include', '/');
  });
});

beforeEach(() => {
  // Just visit the home page before each test
  // This preserves the login state but gives us a fresh UI
  cy.visit('/');
});

it('should create a new category', () => {
  // Click the add category button (+ button next to Projects)
  cy.get('button[aria-label="Add Category"]').click();
  // Fill in the category name in the dialog
  cy.get('input[placeholder="Enter category name"]').type('Cypress Test Category');
  // Submit the form
  cy.contains('button', 'Save Category').click();
  // Verify the new category appears in the sidebar
  cy.contains('Cypress Test Category').should('be.visible');
});

it('should edit a category', () => {
  // Find the category we created and click the edit button
  cy.contains('Cypress Test Category')
  cy.get('button[aria-label="Edit Category"]').click();
  
  // Change the category name
  cy.get('input[aria-label="edit category name"]').clear().type('Updated Cypress Category');
  
  // Save the changes
  cy.contains('button', 'Save Changes').click();
  
  // Verify the updated category name appears
  cy.contains('Updated Cypress Category').should('be.visible');
  cy.contains('Cypress Test Category').should('not.exist');
});

it('should delete a category', () => {
  // Find the category we edited and click the delete button
  cy.contains('Updated Cypress Category')
    .parent()
    .find('button')
    .eq(2) // Assuming delete is the third button
    .click();
  
  // Confirm deletion in the confirmation dialog
  cy.contains('button', 'Delete').click();
  
  // Verify the category is removed
  cy.contains('Updated Cypress Category').should('not.exist');
});