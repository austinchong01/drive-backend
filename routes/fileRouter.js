const express = require("express");
const router = express.Router();
const file = require("../controllers/file");
const validation = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.post("/:folderId/files", authenticateToken, validation.validateFileName, file.createFile);

// router.get("/files/:fileId/download", authenticateToken, file.download);
// router.get("/files/:filter", authenticateToken, file.filter);

router.patch("/files/:fileId", authenticateToken, validation.validateFileName, file.updateFile);

router.delete("/files/:fileId", authenticateToken, file.deleteFile);

module.exports = router;
