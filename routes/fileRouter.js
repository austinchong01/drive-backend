const express = require("express");
const router = express.Router();
const file = require("../controllers/file");
const val = require("../middleware/validation");
const upload = require("../middleware/multer");
const authenticateToken = require("../config/jwt");

router.post("/:folderId?/upload", authenticateToken, upload.single("image"), val.validateFileName, file.createFile);

router.get("/:fileId/download", authenticateToken, file.download);

router.patch("/:fileId/updateFileName", authenticateToken, val.validateFileName, file.updateFilename);
router.patch("/:fileId/updateFileLocation", authenticateToken, file.updateFileLoc);

router.delete("/:fileId", authenticateToken, file.deleteFile);

module.exports = router;
