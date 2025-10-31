Mock Google Drive (backend)
========

A RESTful API backend for a Google Drive clone built with Node.js, Express, Prisma, and PostgreSQL. Supports user authentication, file uploads to Cloudinary, folder management, and search functionality. 

### Full README - https://github.com/austinchong01/drive-frontend

---

API Endpoints
--------

### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register user, create root folder, and create token |
| `POST` | `/auth/login` | Authenticate user and create token  |
| `GET` | `/auth/verify` | Verify JWT token |
| `GET` | `/profile` | Get user profile (username and storage) |
| `PATCH` | `/profile` | Update username |
| `DELETE` | `/profile` | Delete user |


### File Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/:folderId?/upload` | Upload file |
| `PATCH` | `/files/:fileId/updateFileName` | Rename file |
| `PATCH` | `/files/:fileId/updateFileLocation` | Move file |
| `DELETE` | `/files/:fileId` | Delete file |

### Folder Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/folders/:folderId/upload` | Create folder |
| `GET` | `/folders/:folderId` | Get folder contents (subfolders and files) |
| `GET` | `/folders/:folderId/crumbs` | Get breadcrumbs |
| `PATCH` | `/folders/:folderId/updateFolderName` | Rename folder |
| `PATCH` | `/folders/:folderId/updateFolderLocation` | Move folder |
| `DELETE` | `/folders/:folderId` | Delete folder and all nested contents |

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q={query}` | Search for folders and files by name |


### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check and status |

---

Testing
--------
This project includes integrated tests to ensure API reliability and functionality. Tests can be run using:

```bash
npm test
```
