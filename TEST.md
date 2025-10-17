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
- PATCH Filename
  - valid fields
    - validate new filename
- PATCH File Location
  - valid fields
    - validate new location from newFolderId
  - invalid folderId
    - NotFoundError
  - file into its own folder
  - conflicting file name
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
  - create folder with two files
  - validate found files and folders
- GET Breadcrumbs
  - valid fields
    - validate nested folder path
- PATCH Update Folder Name
  - valid fields
    - validate return value has new name
- PATCH Update Folder Location
  - validate moved folder has new parentId
  - folder into its own parent folder
  - conflicting folder name
  - descendant check
- DELETE Folder
  - nested folders and nested files
  - check storage
  - check if folders and files exist

API
  - Search
    - search nested folders and files
      - not case sensitive
      - find q anywhere in name
        - EX. q = "c": common, ascas, c, ASDFC
    - return nothing on empty query

Other

- Validation mw
  - validateUser
    - username, email, password
  - validateLogin
    - email, password
  - validateName
    - name
- Rate Limiter mw
  - login limit
  - api limit?


misc notes

- server failures?