const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const generateStudentId = require("../middleware/generateStudentId");
const student = require("../controllers/student.controller");

router.post("/addStudent", generateStudentId, upload, student.addStudent);
router.get("/students", student.getStudentlist);

router.get("/student/:studentId", student.getStudentbyId);
router.put(
  "/updateStudent/:studentId",
  student.attachStudentId,
  upload,
  student.updateStudent
);

router.get("/student/:studentId/installments", student.getInstallments);
router.post("/student/pay-emi", student.payEmi);

module.exports = router;
