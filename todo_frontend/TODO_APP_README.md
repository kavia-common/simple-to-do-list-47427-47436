# To-Do App (Remotion Studio)

This project includes a simple, modern To-Do list UI integrated into the Remotion app.

Features:
- Add tasks via input + Add button or Enter key
- Toggle completion status
- Delete tasks
- Keyboard shortcuts: Enter to add, Escape to clear input
- Persistence via localStorage under key `todo_items_v1`
- Ocean Professional theme: primary `#2563EB`, success `#F59E0B`, error `#EF4444`, background `#f9fafb`, surface `#ffffff`, text `#111827`

How to run:
- Install: `npm i`
- Start Remotion Studio (port 3000 by default): `npm run dev`
- Open the Studio URL and select the `TodoApp` composition to interact with the To-Do list.

Persistence:
- Tasks are stored in browser `localStorage` under the key `todo_items_v1`, so your list survives page refreshes.
