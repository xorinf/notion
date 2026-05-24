# Database Models Directory (`/backend/models`)

This directory contains all the Mongoose schemas and models that define the structure of the MongoDB database.

## Collections

- **`User.js`**: Defines the user schema (email, hashed password, name, avatar URL, starred/recent items).
- **`Workspace.js`**: Defines collaborative workspaces. Includes an array of members and their respective roles (`admin`, `member`).
- **`Board.js`**: Defines Kanban boards. References a parent workspace and contains an array of `lists`, which in turn contain `cards`.
- **`Page.js`**: Defines rich-text documents. References a parent workspace and stores the Quill/HTML content.
- **`Activity.js`**: Defines the audit trail structure. Stores the actor (user), action type, target entity (card, board, page), and metadata.
- **`Notification.js`**: Defines alerts sent to users. Tracks read/unread status and links back to the relevant workspace or board.
- **`Invite.js`**: Defines secure, temporary invitation tokens for joining workspaces.

## Relationships
- The system is heavily relational despite being MongoDB. We use `mongoose.Schema.Types.ObjectId` with `ref` properties to link entities (e.g., a Board references a Workspace ID).
- When deleting a parent entity (like a Workspace), related child entities (Boards, Pages, Activities) must be cascaded or orphaned safely.

## Conventions
- All schemas include `{ timestamps: true }` to automatically manage `createdAt` and `updatedAt` fields.
- Avoid storing massive arrays inside a single document (e.g., do not store thousands of activities inside the Workspace document itself; store them as separate Activity documents referencing the Workspace ID).
