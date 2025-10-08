Testing Notes

Users

- POST Register
  - valid fields
    - return 201
  - email already in use
    - ConflictError
- POST Login
  - valid fields
    - return token
  - invalid password with email
    - UnauthorizedError ("Invalid credentials")
  - invalid email with password
    - UnauthorizedError ("Invalid credentials")
- Logout
- GET Usernme
  - valid fields
    - return username
  - invalid userId
    - NotFoundError
- GET Storage
  - valid fields
    - return storage
  - invalid userId
    - NotFoundError
- PATCH username
  - valid fields
    - return update username
  - invalid userId
    - NotFoundError
- DELETE user
  - valid fields
    - return 204
  - invalid userId
    - NotFoundError

Files

- POST Upload
  - valid fields
    - file exists in DB
    - storage is updated
    - return 201
    - upload to null folder
    - upload with folderId
      - check with folder query
  - no file uploaded
    - BadRequestError
  - invalid userId
    - NotFoundError
  - invalid folderId
    - BadRequestError
  - storage exceeded
    - BadRequestError
  - cloudinary error
    - not in database
- GET Download
- PATCH Filename
  - valid fields
    - validate new filename
- PATCH File Location
  - valid fields
    - validate new location from newFolderId
  - invalid folderId
    - NotFoundError
- Delete
  - valid fields
    - all files/folders deleted in DB and Cloudinary
    - return 204
  - Cloudinary error
    - not in DB

Folders

- POST Create Folder
  - create folder w/o parent folder
  - create folder w/ parent
- GET Contents
- GET Breadcrumbs
- PATCH Update Folder Name
- PATCH Update Folder Location
- DELETE Folder

Other

- Validation mw
  - validateUser
    - username, email, password
  - validateLogin
    - email, password
  - validateNewUsername
  - validateFileName
  - validateFolderName
- Authenticate JWT mw
  - no token
    - UnauthorizedError
  - invalid or expired token
    - ForbiddenError

misc notes

- server failures?
