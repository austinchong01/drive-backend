Mock Google Drive (backend)
========

### Full README - https://github.com/austinchong01/drive-frontend

API Endpoints
--------
- Users
  - POST /auth/register
    - register a user
  - POST /auth/login
    - login
  - POST /auth/logout
    - logout
    - delete JWT

  - GET /profile
    - get all profile information

  - PATCH /profile
    - update username

  - DELETE /profile
    - delete user

- Files
  - POST /files/{folderId}/upload
    - upload file
    - validates storage limit

  - GET /files/{fileId}/download
    - download file (adds fl_attachment flag)

  - PATCH /files/{fileId}/updateFileName
    - rename file
  - PATCH /files/{fileId}/updateFileLocation
    - move file to newFolderId

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
    - get folder details + ordered breadcrumb path
    
  - PATCH /folders/{folderId}/newFolderName
    - rename folder
  - PATCH /folders/{folderId}/newFolderLocation
    - move folder to parentId

  - DELETE /folders/{folderId}
    - delete folder, all children folders and files, and update storage

- API
  - GET /search?q={name}
    - Search folders and files query name

Implementation
- Custom Error Handling
  - Prisma specific errors
- Sanitation/Validation
- JWT session handling
- Rate Limiting
- Performance Optimization
  - limiting query results?
    - pagination?
  - transactions
- Testing

Nice to Haves
--------
- share files
- favorite files
- organize/filters
- pagination
