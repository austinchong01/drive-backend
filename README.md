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
  - POST /folders
    - create folder

  - GET /folders?parentId={id}
    - get all folders within parent (or root if null)
  - GET /folders/{folderId}
    - get folder details + breadcrumb path
  - GET /folders/{folderId}/contents
    - get BOTH files AND folder in a folder (null if root)
    - sort by folder, file, then uploaded/updated at
    - include pagination for large folders?
    
  - PATCH /folders/{folderId}
    - rename AND/OR move folder

  - DELETE /folders/{folderId}
    - delete folder, all children, files, and update storage

- Other
  - GET /search?q={name}
    - Search folders and files by name

Implementation
- Custom Error Handling
  - Prisma specific errors
- Sanitation/Validation
- JWT session handling
- Unit Testing
- Integrated Testing
- Rate Limiting
- Performance Optimization
  - limiting query results
- pagination?
- Testing
  - Unit
  - Integrated
  - End-to-End

Frontend
- Breadcrumb navigation

Nice to Haves:

- share files
- favorite files
- Drag and Drop (frontend?)
- organize/filters
