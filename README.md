# NovaTask

## Hosted at: https://banyanplanner.netlify.app/

## Overview

NovaTask is a full-stack application using a Django backend and a React frontend (powered by Vite). This guide covers the required installations and steps needed to run the project after cloning the repository locally.

## Prerequisites

- [Git](https://git-scm.com/) (to clone the repository)
- [Node.js and Yarn](https://classic.yarnpkg.com/en/docs/install) for the client app
- [Python 3](https://www.python.org/downloads/) and [pip](https://pip.pypa.io/en/stable/) for the Django backend

## Setup Steps

1. **Clone the Repository**

   ```bash
   git clone <https://github.com/RyanFortune02/NovaTask>
   cd NovaTask
   ```

2. **Configure the Client (React with Vite)**

   - Navigate to the client app directory:
     ```bash
     cd client/app
     ```
   - Install dependencies:
     ```bash
     yarn install
     npm install react-bootstrap bootstrap @popperjs/core
     ```
   - Install FullCalendar packages (if not already included in package.json):
     ```bash
     cd client/app
     yarn add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/rrule rrule
     ```
   - Start the client dev server:
     ```bash
     yarn dev
     ```
   - The client will be available at [http://localhost:5173/](http://localhost:5173/).

3. **Configure the Server (Django)**
   - Navigate to the Django project directory (`server/newproject`):
     ```bash
     cd server/newproject
     ```
   - Install backend dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Apply migrations:
     ```bash
     python manage.py migrate
     ```
   - Start the Django development server:
     ```bash
     python manage.py runserver
     ```
   - The backend will be available at [http://localhost:8000/](http://localhost:8000/).

## Local Development vs Deployment

When running the application locally, you need to ensure the frontend is making API calls to your local Django server:

1. **For Local Development**

   - All API calls in your React components should use the URL `http://localhost:8000/api/` instead of the deployed URL.
   - Look for API calls in frontend (client/app/src) and make sure they're pointing to localhost:8000.
   - Example change:

     ```javascript
     // Change this:
     fetch("https://ryanfortune.pythonanywhere.com/api/todos/");

     // To this for local development:
     fetch("http://localhost:8000/api/todos/");
     ```

   - Using local variables to easily switch between local and hosted api url's would have been the best approach

2. **CORS Configuration**
   - The Django backend is already configured with `CORS_ALLOW_ALL_ORIGINS = True` in settings.py, which allows requests from any origin including localhost.
   - This is suitable for development but should be restricted in production.

## Resources used:

- https://www.youtube.com/watch?v=xldTxXtNiuk (for base of project and logic on connecting vite React with Django)
- https://www.codeguage.com/courses/html/forms-input-types (for different form types)
- https://stackoverflow.com/questions/46539480/react-clearing-an-input-value-after-form-submit (for clearing fields)
- https://gist.github.com/mandiwise/d6c9cb0a6e9edc20e24b6cd973cdb6d7 (css styles)

- https://fullcalendar.io/docs/event-object - Full Calendar Documentation
- https://www.youtube.com/watch?v=HpfzprSnhUw&t=629s - Django & React FullCalendar Tutorial #1: Overview and Basic Setup of FullCalendar
- https://www.youtube.com/watch?v=Qr0RclhjF-g&list=LL&index=3 - Add PopOver To FullCalendar (reactjs-fullcalendar)
- https://fullcalendar.io/docs/rrule-plugin - Rrule Plugin to display recurring events in the Full Calendar

- https://plainenglish.io/blog/react-open-link-in-new-tab# - How to Open a Link in a New Tab in React
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor -For calculations to handle duration more accurately.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select - The HTML Select element
- https://www.geeksforgeeks.org/bit-manipulation-in-javascript/ -Bit manipulation in JavaScript

- https://www.youtube.com/watch?v=i8fAO_zyFAM - Build a POPUP component in React JS
- https://www.youtube.com/watch?v=NmstSmMykqc&t=504s- Random Quote Generator
- https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar - webkit-scrollbar for Class Time Tracker styling
- https://www.youtube.com/watch?v=Ts3kTbdQ_4U - Build a Customizable Card Component in ReactJS for TODO/Class list display
- https://react-bootstrap.github.io/docs/components/overlays/#popovers - Popover React Bootstrap for FullCalendar

Resources for hosting:
https://www.youtube.com/watch?v=XMGOfJxnH7s (Vite react to netlify)
pythonanywhere backend hosting - Wes (TA)

Link for frontend(may not be hosted at time of checking link):
https://banyanplanner.netlify.app/

- followed the netlify docs to host
