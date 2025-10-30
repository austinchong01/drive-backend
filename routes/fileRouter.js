const express = require("express");
const router = express.Router();
const file = require("../controllers/file");
const val = require("../middleware/validation");
const upload = require("../middleware/multer");
const authenticateToken = require("../middleware/jwt");

// File routes - upload, rename, move, and delete

router.post(
  "/:folderId?/upload",
  authenticateToken,
  upload.single("image"),
  val.validateName,
  file.createFile
);

router.patch(
  "/:fileId?/updateFileName",
  authenticateToken,
  val.validateName,
  file.updateFilename
);
router.patch(
  "/:fileId?/updateFileLocation",
  authenticateToken,
  file.updateFileLoc
);

router.delete("/:fileId?", authenticateToken, file.deleteFile);

module.exports = router;
