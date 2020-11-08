# Oregon State Web Based Document Storage and Retrieval System

## Description
This project creates web portal where members of the Oregon State community can store and timestamp documents for posterity and retrieval. A primary purpose of the system is for capstone project repositories. Entries will live alongside Git repositories, providing and saving the documents that describe the code. Ideally this will allow future students to build upon the projects of earlier student groups. The repository will also provide a form of low-bar publication. Should a student or faculty have a research paper rejected, the paper will still have a place where the scientific community can access and reference it.

The document management system time stamps documents, documents are immutable once received. The system must have a rich and flexible set of permissions to allow or bar different groups access. The system must be able to search and group documents according to a number of tags. The system must be create with a mindset that it will be continuously updated to suit the needs of the Oregon State community.

## Project Setup
```
1. npm install
2. npm install -g nodemon (use sudo on linux/mac)
3. npm install -g @vue/cli (use sudo on linux/mac)
4. create this on root directory "./database/beavdms.db"
5. npm run serve (starts localhost for vue)
6. nodemon server.js (starts database)
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

