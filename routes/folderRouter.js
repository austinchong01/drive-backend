const express = require("express");
const router = express.Router();
const folder = require("../controllers/folder");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.post("/:folderId?/upload", authenticateToken, upload.single("image"), val.validateFolderName, folder.createFolder);

// router.patch("/:fileId", authenticateToken, validation.validateFileName, folder.updateFolder);

// router.delete("/:fileId", authenticateToken, folder.deleteFolder);

module.exports = router;
