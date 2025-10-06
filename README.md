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
    - INPUTS: file (multipart/form-data), folderId (null if root)
    - Validates storage limit before upload

  - GET /files?folderId={id}
    - Get all files in a folder (null if root)
    - Include pagination for large folders
  - GET /files/{fileId}/download
    - Download file (adds fl_attachment flag)

  - PATCH /files/{fileId}
    - INPUTS: displayName, folderId (optional - for moving)
    - Can rename AND/OR move file

  - DELETE /files/{fileId}
    - delete file and update storage

- Folders
  - POST /folders
    - INPUTS: name, parendId (null for root)

  - GET /folders?parentId={id}
    - Get all folders within parent (or root if null)
  - GET /folders/{folderId}
    - Get folder details + breadcrumb path
  - GET /folders/{folderId}/contents
    - Get BOTH files AND folders
    
  - PATCH /folders/{folderId}
    - INPUTS: name, parentId (optional - for moving)
    - Can rename AND/OR move folder

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
