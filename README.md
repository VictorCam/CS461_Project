# Oregon State Web Based Document Storage and Retrieval System

## Description
This project creates web portal where members of the Oregon State community can store and timestamp documents for posterity and retrieval. A primary purpose of the system is for capstone project repositories. Entries will live alongside Git repositories, providing and saving the documents that describe the code. Ideally this will allow future students to build upon the projects of earlier student groups. The repository will also provide a form of low-bar publication. Should a student or faculty have a research paper rejected, the paper will still have a place where the scientific community can access and reference it.

The document management system time stamps documents, documents are immutable once received. The system must have a rich and flexible set of permissions to allow or bar different groups access. The system must be able to search and group documents according to a number of tags. The system must be create with a mindset that it will be continuously updated to suit the needs of the Oregon State community.

## Project Setup
(If you get issues you might need to delete package-lock.json)
```
1. npm install (use sudo on linux/mac)
2. npm install -g nodemon (use sudo on linux/mac)
3. npm install -g @vue/cli (use sudo on linux/mac)
4. create a file named ".env" on root dir (add env variables provided)
5. npm run serve (starts localhost for vue)
6. npm run server (starts database and listening for email parsing)
```

## Project Notes (Frontend)
```
(NOTE: the src folder contains the frontend)
1. using "@" will start at the src folder (when importing a vue file)
2. the "views" folder has the main pages for each site (/home /help /etc.)
3. the "components" folder has reusable pieces of the site
```

## Project Notes (Backend)
```
(NOTE: the middleware and routes contain the backend code)
1. route_docs.js contains routes for the frontend
2. parse_gmail.js is the file that calls the middleware functions
3. "g_request(callback)" in parse_gmail.js is where it loops to check if emails are in inbox
```


## Other Commands
```
npm run build (Compiles and minifies for production)
npm run lint (Lints and fixes files)
vue ui (User interface)
```

## Tools
```
https://github.com/vuejs/vue-devtools#vue-devtools
```

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

