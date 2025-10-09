const express = require("express");
const router = express.Router();
const folder = require("../controllers/folder");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.post("/:folderId?/upload", authenticateToken, val.validateName, folder.createFolder);

router.get("/:folderId", authenticateToken, folder.getContents);
router.get("/:folderId/crumbs", authenticateToken, folder.getBreadCrumbs);

router.patch("/:folderId/newFolderName", authenticateToken, val.validateName, folder.updateFolder);
router.patch("/:folderId/newFolderLocation", authenticateToken, folder.updateFolderLoc); 

router.delete("/:folderId", authenticateToken, folder.deleteFolder);

module.exports = router;
