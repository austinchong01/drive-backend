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
| `POST` | `/auth/register` | Register a new user account and create root folder |
| `POST` | `/auth/login` | Authenticate user and return JWT token |
| `GET` | `/auth/verify` | Verify JWT token validity |
| `GET` | `/profile` | Get user profile information (username and storage usage) |
| `PATCH` | `/profile` | Update username |
| `DELETE` | `/profile` | Delete user account and all associated data |

---

### File Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/:folderId?/upload` | Upload a file to specified folder (or root if no folderId) |
| `PATCH` | `/files/:fileId/updateFileName` | Rename a file |
| `PATCH` | `/files/:fileId/updateFileLocation` | Move file to different folder |
| `DELETE` | `/files/:fileId` | Delete a file from database and Cloudinary |

---

### Folder Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/folders/:folderId?/upload` | Create a new folder in specified parent (or root if no folderId) |
| `GET` | `/folders/:folderId?` | Get folder contents (subfolders and files) |
| `GET` | `/folders/:folderId?/crumbs` | Get breadcrumb navigation path from current folder to root |
| `PATCH` | `/folders/:folderId/updateFolderName` | Rename a folder |
| `PATCH` | `/folders/:folderId/updateFolderLocation` | Move folder to different parent folder |
| `DELETE` | `/folders/:folderId` | Delete folder and all nested contents |

---

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q={query}` | Search for folders and files by name |

---

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check and status |

---

Nice to Haves
--------
- Share files
- Favorite files
- Organize/filters
- Pagination
