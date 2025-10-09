## Mock Google Drive (backend)

README details here: https://github.com/austinchong01/file-frontend

Core Functionalities

- User
  - create and delete
  - rename username
  - register/login/logout
    - JWT session management
  - 10MB of storage (MAX)
- File
  - create/rename/delete
  - unique name within folder
  - preview and download
- Folder
  - create/rename/delete
  - unique name within folder
  - store files and folders
  - home is root folder (folderId = null)
- Other
  - file/folder search
    - show limited results

API Endpoints

- Users
  - POST /auth/register
    - register a user
  - POST /auth/login
    - login
  - POST /auth/logout
    - logout

  - GET /profile
    - get all profile information
  - GET /storage
    - get storage usage

  - PATCH /profile
    - update username

  - DELETE /profile
    - delete user

- Files
  - POST /files
    - upload file
    - validates storage limit

  - GET /files/{fileId}/download
    - download file (adds fl_attachment flag)
  - GET /files/{filter}
    - get all mimetype (filter) files

  - PATCH /files/{fileId}
    - rename AND/OR move file

  - DELETE /files/{fileId}
    - delete file
    - update storage

- Folders
  - POST /folders/{folderId}/upload
    - create folder

  - GET /folders/{folderId}
    - get BOTH files AND folder in a folder (null if root)
    - sort by folder, file, then uploaded/updated at
    - include pagination for large folders?
  - GET /folders/{folderId}/crumbs
    - get folder details + breadcrumb path
    
  - PATCH /folders/{folderId}/newFolderName
    - rename folder
  - PATCH /folders/{folderId}/newFolderLocation
    - move folder to new parentId

  - DELETE /folders/{folderId}
    - delete folder, all children, files, and update storage

- API
  - GET /search?q={name}
    - Search folders and files by name

Implementation
- Custom Error Handling
  - Prisma specific errors
- Sanitation/Validation
- JWT session handling
- Rate Limiting
- Performance Optimization
  - limiting query results
- pagination?
- Testing
  - Integrated
- When moving, need to check unique folder/files names

Frontend
- Breadcrumb navigation

Nice to Haves:
- share files
- favorite files
- Drag and Drop (frontend?)
- organize/filters
