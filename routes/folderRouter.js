const express = require("express");
const router = express.Router();
const folder = require("../controllers/folder");
const val = require("../middleware/validation");
const authenticateToken = require("../middleware/jwt");
const limiter = require("../middleware/ratelimiter");

// Folder routes - create, read (crumbs and folders/files), rename, move, and delete

router.post(
  "/:folderId?/upload",
  authenticateToken,
  val.validateName,
  folder.createFolder
);

router.get(
  "/:folderId?/crumbs",
  authenticateToken,
  limiter.api,
  folder.getBreadCrumbs
);
router.get("/:folderId?", authenticateToken, limiter.api, folder.getContents);

router.patch(
  "/:folderId?/updateFolderName",
  authenticateToken,
  val.validateName,
  folder.updateFolder
);
router.patch(
  "/:folderId?/updateFolderLocation",
  authenticateToken,
  folder.updateFolderLoc
);

router.delete("/:folderId?", authenticateToken, folder.deleteFolder);

module.exports = router;