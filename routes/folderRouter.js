const express = require("express");
const router = express.Router();
const folder = require("../controllers/folder");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.post("/:folderId?/upload", authenticateToken, upload.single("image"), val.validateFolderName, folder.createFolder);

router.get("/:folderId", authenticateToken, folder.getContents);
// router.get("/", authenticateToken, ); // get breadcrumb path?

router.patch("/:folderId", authenticateToken, validation.validateFileName, folder.updateFolder);
// router.patch("/:folderId", authenticateToken, folder.updateFolderLocation); // folder parentId

router.delete("/:folderId", authenticateToken, folder.deleteFolder);

module.exports = router;
