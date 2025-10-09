const express = require("express");
const router = express.Router();
const file = require("../controllers/file");
const val = require("../middleware/validation");
const upload = require("../middleware/multer");
const authenticateToken = require("../config/jwt");
const limiter = require("../middleware/ratelimiter");

router.post("/:folderId?/upload", authenticateToken, upload.single("image"), val.validateName, file.createFile);

router.get("/:fileId/download", authenticateToken, limiter.api, file.download);

router.patch("/:fileId/updateFileName", authenticateToken, val.validateName, file.updateFilename);
router.patch("/:fileId/updateFileLocation", authenticateToken, file.updateFileLoc);

router.delete("/:fileId", authenticateToken, file.deleteFile);

module.exports = router;
