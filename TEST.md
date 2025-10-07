Testing Notes

Users
- Register
    - valid fields
        - return 201
    - email already in use
        - ConflictError (409)
- Login
    - valid fields
        - return token
    - invalid password with email
        - UnauthorizedError ("Invalid credentials")
    - invalid email with password
        - UnauthorizedError ("Invalid credentials")
- Logout
- Get usernme
    - valid fields
        - return (founderUser.username)
    - invalid userId
        - NotFoundError()
- Get storage
    - valid fields
        - return (foundUser.storage)
    - invalid userId
        - NotFoundError()
- Update username
    - valid fields
        - return (updatedUser)
    - invalid userId
        - NotFoundError()
- Delete user
    - valid fields
        - return 204
    - invalid userId
        - NotFoundError()

Files

Folders

Other
- Validation mw
    - validateUser
        - username, email, password
    - validateLogin
        - email, password
    - validateNewUsername
        - newName
    - validateFileName
    - validateFolderName
- Authenticate JWT mw
    - no token
        - UnauthorizedError
    - invalid or expired token
        - ForbiddenError


misc notes
- account for server failures?