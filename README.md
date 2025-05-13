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

## To Use The Task Sessions Application

### 1. Authentication (Login or Sign Up)

*   **Navigate to the Auth Page:** When you first open the application at `http://localhost:3000`, you will likely be redirected to the login/signup page (`/auth`). If not, navigate there.
*   **Sign Up (New User):**
    *   Click on the "Sign Up" or "Create Account" tab/link.
    *   Enter your desired email and password.
    *   Click the "Sign Up" button. Upon successful registration, you should be logged in and redirected to the main dashboard.
*   **Log In (Existing User):**
    *   Click on the "Log In" or "Sign In" tab/link.
    *   Enter your registered email and password.
    *   Click the "Log In" button. You will be redirected to the main dashboard.

### 2. Create a Category

Categories help you organize your tasks.

*   **Locate the "Add Category" Button:** On the main dashboard, look for a button to add a new category. This is a "+" button next to the "Projects" or "Categories" list in the sidebar.
*   **Open the Create Category Dialog:** Click the "Add Category" button. A dialog box or form will appear.
*   **Enter Category Name:** Type the name for your new category (e.g., "Work," "Personal Study," "Fitness").
*   **Confirm Creation:** Click the "Save Category" button in the dialog. The new category should now appear in your list of categories in the sidebar.

### 3. Create a Task

Once you have a category (or you can use a default one if available):

*   **Select a Category (Optional but Recommended):** Click on the category in the sidebar under which you want to create the new task. This will filter the task view to that category.
*   **Locate the "Create Task" Button:** On the main dashboard, find and click the "Create Task" button. This might be a prominent button in the main content area.
*   **Fill in Task Details:** A dialog or form will open. Fill in the required information:
    *   **Title:** A concise name for your task (e.g., "Complete Chapter 3 Reading").
    *   **Description (Optional):** More details about the task.
    *   **Category:** Select the category you created or another relevant one from the dropdown.
    *   **Due Date:** Choose a due date for the task.
    *   **Focus Sessions:** Specify how many focus sessions you estimate this task will take.
*   **Confirm Creation:** Click the "Create" or "Save Task" button. The new task will appear in the task list for the selected category.

### 4. Start a Focus Session for a Task

*   **Find Your Task:** In the task list, locate the task for which you want to start a focus session.
*   **Initiate Session:**
    *   a "Start Session" button or icon (e.g., a play button) directly on the task item in the list.
    *   Alternatively, clicking on the task will open a "Task Info" dialog, which then has a "Start Session" button.
*   **Focus Session Page:** Clicking "Start Session" will navigate you to a dedicated session page (`/session/[taskId]`).
*   **Begin Timer:** The timer for the focus session (e.g., 25 minutes) will usually start automatically, or you might need to click a "Start" button on this page.
*   **During the Session:** Focus on your task. The page will display the remaining time.
*   **Session Completion:** Once the timer ends, the session is marked as complete. you can pause/resume the session timer, you can also cancel the focus session. The task's progress (e.g., "1/3 focus sessions completed") should update.

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

