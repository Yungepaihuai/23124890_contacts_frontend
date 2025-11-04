# Contact Management System Frontend

## Project Introduction
  A pure frontend contact management system that uses browser local storage for data persistence. 
  This project demonstrates a complete frontend backend separation architecture without requiring any server side components.

## Technology Stack
  HTML5
  CSS3
  JavaScript (ES6+)
  LocalStorage (Data Storage)

## Features

### Core Functions
  Add contacts
  Edit contacts
  Delete contacts
  Search contacts
  Local data persistence

### Additional Functions
  Export contacts (JSON format)
  Import contacts
  Responsive design
  Modern UI interface

## Live Demo
  Access URL: https://yungepaihuai.github.io/23124890_contacts_frontend/

## Architecture Description
  This project uses a pure frontend architecture with the following characteristics:

### Data Storage
  Uses localStorage for data persistence
  Data is only valid in the current browser
  Supports data import and export

### Advantages
  Zero backend dependencies No server required
  Offline available All functions work offline
  Fast response No network request delays
  Privacy security Data stored locally on user's device

## Local Development
  1. Open index.html file directly
  2. Or use a local server:
   ```bash
   Using Python
   python m http.server 8000
   
   Using Node.js
   npx http server

## Project structure
23124890_contacts_frontend/
├── css/
│   ├── style.css
├── js/
│   ├── app.js
├── lib/
├── .gitignore
├── index.html
├── README.md
├── codestyle.md
