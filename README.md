to run this project: First, run the development server
type in a new terminal:
```bash
npm install
```
to install all the dependecies needed for the application.
then type:
```bash
npm run dev
```
to run the tests with cypress:
```bash
npx cypress open
```
select e2e testing and then choose the browser you want to test with. then click start e2e testing in the browser you selected.
click on the test file you want to run.
or type:
```bash
npx cypress run
```
to run the tests in the terminal.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Cypress Tests

The application includes end-to-end tests written with Cypress to test key functionalities. The tests are located in the `cypress/e2e` directory.

### Test Suites:

1.  **`category.cy.ts` - Category Management:**
    *   **Authentication:** Logs in before each test and logs out after each test.
    *   **Create Category:** Tests the ability to create a new task category.
    *   **Edit Category:** Tests the ability to rename an existing category.
    *   **Delete Category:** Tests the ability to delete a category.

2.  **`task.cy.ts` - Task Management:**
    *   **Authentication & Setup:** Logs in once before all tests in this suite. It also creates a temporary 'Cypress' category for use in task tests.
    *   **Create Task:** Tests the creation of a new task, including setting its title, description, assigning it to the 'Cypress' category, setting a due date, and specifying the number of focus sessions.
    *   **Edit Task:** Tests modifying an existing task's title and description.
    *   **Complete Task:** Tests marking a task as complete and verifies it moves to the completed tasks view.
    *   **Delete Task:** Tests deleting a task. It also cleans up by deleting the 'Cypress' category created during setup.

To run these tests, you can use the Cypress Test Runner or run them in headless mode as described in the "to run the tests with cypress" section above.

