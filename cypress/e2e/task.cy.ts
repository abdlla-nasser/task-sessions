describe('Task Management', () => {
  before(() => {
    // Visit the app and login once before all tests
    cy.visit('/auth');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Log In').click();
    // Wait for redirect to home page
    cy.url().should('include', '/');

    cy.get('button[aria-label="Add Category"]').click();
    // Fill in the category name in the dialog
    cy.get('input[placeholder="Enter category name"]').type('Cypress');
    // Submit the form
    cy.contains('button', 'Save Category').click();
    cy.contains('Cypress').should('be.visible');
  });

  beforeEach(() => {
    // Just visit the home page before each test
    // This preserves the login state but gives us a fresh UI
    cy.visit('/');
  });

  it('should create a new task with Cypress category', () => {
    // Click the create task button
    cy.contains('button', 'Create Task').click();
    
    // Fill in the task details
    cy.get('input[placeholder="Enter task title"]').type('Cypress Test Task');
    cy.get('textarea[placeholder="Enter task description"]').type('This is a test task created by Cypress');
    
    // Select the Cypress category
    cy.get('select').select('Cypress');
    
    // Set due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    cy.get('input[type="date"]').type(formattedDate);
    
    // Set focus sessions
    cy.get('input[type="number"]').clear().type('3');
    
    // Submit the form
    cy.contains('button', 'Save Task').click();
    
    // Verify the new task appears in the task list
    cy.contains('Cypress Test Task').should('be.visible');
  });

  it('should edit the task that was just created', () => {
    // Click on the task to open the task info dialog
    cy.contains('Cypress Test Task').click();
    
    // The task info dialog should be open now
    // Click the edit button in the task info dialog
    cy.contains('button', 'Edit Task').click();
    
    // Now the edit task dialog should be open
    // Change the task title
    cy.get('input[aria-label="task title"]').clear().type('Updated Cypress Task');
    
    // Change the description
    cy.get('textarea[aria-label="task description"]').clear().type('This task was updated by Cypress');
    
    // Save the changes
    cy.contains('button', 'Save Changes').click();
    
    // Verify the updated task appears
    cy.contains('Updated Cypress Task').should('be.visible');
  });

  it('should mark the task as complete', () => {
    // Find the task we edited and click the complete checkbox
    cy.get('input[aria-label="complete Updated Cypress Task"]')
      .check({force: true});
    
    // // Verify the task is marked as complete (has line-through style)
    cy.contains('Updated Cypress Task').should('have.css', 'text-decoration-line', 'line-through');
    
    // Switch to the Completed category to verify it appears there
    cy.contains('button', 'Completed').click();
    cy.contains('Updated Cypress Task').should('be.visible');
  });

  it('should delete the task', () => {
    //delete the cypress category created before testing tasks
    cy.contains('Cypress')
    .parent()
    .find('button')
    .eq(2) // Assuming delete is the third button
    .click();
    // Confirm deletion in the confirmation dialog
    cy.contains('button', 'Delete').click();
    // Click on the task to open the task info dialog
    cy.contains('Updated Cypress Task').click();
    
    // Click the delete button in the task info dialog
    cy.contains('button', 'Delete').click();
    
    // Verify the task is removed
    cy.contains('Updated Cypress Task').should('not.exist');
  });
});