# Process Documentation

- Backend can be found [here](https://github.com/ushiradineth/koano-api).

## Technologies

### Frontend

- `TypeScript`
- `Next.js`
- `Dnd-kit`
- `Zustand`
- `NextAuth`
- `TanStack Query`
- `Tailwind CSS`
- `Zod`
- `Vercel`
- `Github Actions`

### Backend

- `Go`
- `net/http`
- `PostgreSQL`
- `Test Containers`
- `Swaggo`
- `sqlx`
- `Google Cloud Run`
- `Google Container Registry`
- `Github Actions`

## Features

- Here's what I learned and implemented on this project, to be updated as I go along:

### Advanced UI drag and drop with Dnd-kit.

- Drag through a day to create a new event.
- Drag from the top or bottom of an event to extend or shorten it.
- Drag the event from the middle to move it to another day.
- Show previews of the changes done through the sidebar.
- Show previews of the changes done before create a new event.
- Show previews of the changes done through resizing an event.
- Lots of performance testing and bug fixes due to the complexity of the UI.

### State management with Zustand.

- I have not used state management libraries before on a personal project, so I used this opportunity to learn it.
- Manage the state of the events, settings and prerendered data with Zustand.
- Share state between the sidebar and calander view for previewing.

### TDD with Go.

- The flow of TDD is to write the test first, then write the code to make the test pass.
- The main goal of this project is to learn TDD, so I wrote the tests first.

### Test Containers.

- I used `Test Containers` to run the tests in a containerized environment.
- This allowed me to run the tests in a headless environment, which is important for the CI/CD pipeline.

### **SOON** Integration with third-party tools such as Notion, Jira, and Clockify.

## Motivation

- This project purely started as a personal project to learn more about the technologies and tools I use, mainly implementing an API with GO, and creating a performant Drag and Drop UI with NextJS.
- I had initially dropped the project once I had completed this goal, but later on I realized that I could implement integrations with other tools like Notion, Jira, and Clockify, to address pain points on my personal life, which is to have one central time tracking system between personal and work personas.
