


          
# Task Sessions Application Documentation

## Overview

The Task Sessions application is a productivity tool that helps users manage tasks and focus sessions. It allows users to create categories for organizing tasks, create and manage tasks within those categories, and track focus sessions for each task.

## Architecture

The application follows a modern web architecture using Next.js/React for the frontend and Firebase for backend services.

### System Context

The Task Sessions application interacts with:
- **Users**: Who manage tasks and focus sessions
- **Firebase**: External Backend-as-a-Service providing authentication and database services

### Container Architecture

The application consists of:
- **Web Application**: A Next.js/React Single Page Application that runs in the user's browser
- **Firebase Authentication**: Handles user authentication and identity management
- **Cloud Firestore**: NoSQL document database that stores user profiles, categories, and tasks

### Component Structure

The Web Application contains several key components:
1. **Main Page UI & Layout**: Orchestrates the main layout and integrates other UI components
2. **Authentication UI**: Handles user login, registration, and session state
3. **Category Management UI**: Allows CRUD operations for categories
4. **Task Management UI**: Allows CRUD operations for tasks
5. **Focus Session UI**: Manages the focus timer functionality
6. **Theme Context**: Manages UI theme using React Context API
7. **Routing**: Handles client-side navigation using Next.js Router
8. **Firebase Service Wrapper**: Abstracts Firebase SDK interactions

## User Flows

### Authentication Flow
1. User accesses the application at `http://localhost:3000`
2. User is redirected to the login/signup page (`/auth`)
3. User either:
   - Signs up with email and password (new user)
   - Logs in with existing credentials
4. Upon successful authentication, user is redirected to the main dashboard

### Category Management Flow
1. User navigates to the main dashboard
2. User clicks the "+" button next to "Categories" in the sidebar
3. User enters a category name in the dialog
4. User clicks "Save Category"
5. The new category appears in the sidebar

### Task Management Flow
1. User selects a category (optional)
2. User clicks "Create Task" button
3. User fills in task details:
   - Title
   - Description (optional)
   - Category
   - Due Date
   - Estimated Focus Sessions
4. User clicks "Create" or "Save Task"
5. The new task appears in the task list

### Focus Session Flow
1. User finds a task in the task list
2. User clicks "Start Session" button or icon
3. User is navigated to a dedicated session page (`/session/[taskId]`)
4. Timer starts automatically or user clicks "Start"
5. User focuses on the task while timer counts down
6. When timer ends, session is marked complete
7. User can pause/resume or cancel the session
8. Task progress updates (e.g., "1/3 focus sessions completed")

### Settings Management Flow
1. User navigates to settings
2. User can:
   - Change focus session duration
   - Change application theme
3. Settings are saved and applied immediately

## Data Model

The application uses Cloud Firestore with the following structure:

```
/users/{uid}/
    profile: {
        email: string,
        displayName: string,
        settings: {
            theme: string,
            focusDuration: number
        }
    }
    categories: [
        {
            id: string,
            name: string,
            createdAt: timestamp
        }
    ]
    tasks: [
        {
            id: string,
            title: string,
            description: string,
            categoryId: string,
            dueDate: timestamp,
            estimatedSessions: number,
            completedSessions: number,
            status: string,
            createdAt: timestamp,
            updatedAt: timestamp
        }
    ]
    sessions: [
        {
            id: string,
            taskId: string,
            startTime: timestamp,
            endTime: timestamp,
            duration: number,
            status: string
        }
    ]
```

## Testing

The application includes end-to-end tests using Cypress:

1. **Category Management Tests** (`category.cy.ts`):
   - Create, edit, and delete categories

2. **Task Management Tests** (`task.cy.ts`):
   - Create, edit, complete, and delete tasks

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Running Tests

1. Open Cypress Test Runner:
   ```bash
   npx cypress open
   ```
   - Select E2E testing
   - Choose a browser
   - Click "Start E2E Testing"
   - Select a test file to run

2. Or run tests in headless mode:
   ```bash
   npx cypress run
   ```

## Technical Implementation

The application is built with:
- **Frontend**: Next.js, React, React Context API
- **Backend**: Firebase (Authentication, Firestore)
- **Testing**: Cypress
- **State Management**: React Context API
- **Styling**: CSS Modules or a CSS-in-JS solution
