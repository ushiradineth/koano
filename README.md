# Cron (In Development)

- An Calander Management App made to learn Advanced UI Use Cases and Golang with Test Driven Development.

- Backend can be found [here](https://github.com/ushiradineth/cron-be).

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

### Backend

- `Go`
- `net/http`
- `PostgreSQL`
- `Test Containers`
- `Swaggo`
- `sqlx`

### Infrastructure

- `Docker`
- `Github Actions`
- `Vercel`
- `GitHub Container Registry`

## Features

- Here's what I learned and implemented on this project:

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

## The Process

- This project took a while to complete due to work.
- I wanted to use this project as a canvas to try new technologies, which I was able to.

## Todo List

### Frontend

- [ ] Light mode.
- [ ] Context menu to save changes.
- [ ] Settings page for user and calander settings.
- [ ] Add custom color palette for events.
- [ ] Events that span multiple days.
- [ ] Repeated events.
- [ ] Timezone support.
- [ ] Monthly and yearly view.

### Backend

- [ ] Rate limiting.
- [ ] Logging.
- [ ] Metrics.
- [ ] Tracing.
- [ ] Kubernetes deployment with Flux and Helm.
- [ ] Architecture Documentation.

### General

- [ ] Forget Password Flow.
- [ ] Email verification.
- [ ] Email only signup.
- [ ] Notion integration.
- [ ] Google Calendar integration.
- [ ] Google Contacts integration.
- [ ] Google Auth integration.

## Running the Project

- To run the project in your local environment, follow these steps:
  - Clone the repository to your local machine.
  - Clone the [backend](https://github.com/ushiradineth/cron-be) repository, and follow the instructions to run the backend.
  - Copy the `.env.example` file to `.env` and fill in the required environment variables.
  - Run `pnpm install` in the project directory to install the required dependencies.
  - Run `pnpm dev` to get the project running.
