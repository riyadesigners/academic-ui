const pool = require("../config/db");

//========== Helper =================
const getValidDueDate = (year, month, day) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
};

const getFile = (files, field) =>
  files?.find(f => f.fieldname === field) || null;

exports.attachStudentId = (req, res, next) => {
  req.studentCode = req.params.studentId;
  next();
};
//========== Add Student =================
exports.addStudent = async (req, res) => {
    const conn = await pool.getConnection();
    const studentCode =  req.studentCode;
    try {
    await conn.beginTransaction();

    const parsed = JSON.parse(req.body.data);
    const { personal, family, academics, payment } = parsed;

    const photoFile = getFile(req.files, "photo");
    const addressProofFile = getFile(req.files, "addressProof");

    /* ===== INSERT STUDENT ===== */
    await conn.query(
      `INSERT INTO students_details (
        student_id, first_name, middle_name, last_name,
        mobile, alternate_mobile, email, dob, gender,
        blood_group, branch, course_interested,
        registration_date, nationality,
        address_line1, address_line2, city, state, pincode,
        father_name, father_mobile, father_occupation,
        mother_name, mother_mobile, mother_occupation,
        photo_path, photo_name,
        address_proof_path, address_proof_name
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        studentCode,
        personal.firstName,
        personal.middleName,
        personal.lastName,
        personal.mobile,
        personal.alternateMobile,
        personal.email,
        personal.dob,
        personal.gender,
        personal.bloodGroup,
        personal.branch,
        personal.courseInterested,
        personal.registrationDate,
        personal.nationality,
        personal.addressLine1,
        personal.addressLine2,
        personal.city,
        personal.state,
        personal.pincode,
        family.fatherName,
        family.fatherMobile,
        family.fatherOccupation,
        family.motherName,
        family.motherMobile,
        family.motherOccupation,
        photoFile?.path || null,
        photoFile?.filename || null,
        addressProofFile?.path || null,
        addressProofFile?.filename || null
      ]
    );

    /* ===== ACADEMICS ===== */
    for (let i = 0; i < academics.length; i++) {
      const marksheet = getFile(req.files, `marksheet_${i}`);

      await conn.query(
        `INSERT INTO student_academics
         (student_id, level, institute, passing_year, board_university, percentage,
          marksheet_path, marksheet_name)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          studentCode,
          academics[i].level,
          academics[i].institute,
          academics[i].passing_year,
          academics[i].board_university,
          academics[i].percentage,
          marksheet?.path || null,
          marksheet?.filename || null
        ]
      );
    }

    /* ===== PAYMENT ===== */
    const installmentDay = payment.installmentDay
      ? parseInt(payment.installmentDay, 10)
      : null;

    await conn.query(
      `INSERT INTO student_payments
       (student_id, total_course_fee, payment_mode, payment_option,
        regamount, discount_amt, installment_day, remarks)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        studentCode,
        payment.totalFee,
        payment.paymentMode,
        payment.paymentOption,
        payment.regamount,
        payment.discount_amt,
        installmentDay,
        payment.remarks || null
      ]
    );

    /* ===== EMI GENERATION ===== */
    // let emiMonths = payment.paymentOption === "Full Payment"
    //   ? 1
    //   : parseInt(payment.paymentOption, 10);
    let emiMonths = 1;

        if (payment.paymentOption && payment.paymentOption !== "Full Payment") {
        emiMonths = parseInt(payment.paymentOption, 10);
        if (isNaN(emiMonths) || emiMonths <= 0) {
            emiMonths = 1;
        }
        }

    const totalFee = Number(payment.totalFee);
    const regAmount = Number(payment.regamount || 0);
    const discount = Number(payment.discount_amt || 0);

    const emiBase = totalFee - (regAmount + discount);
    const emiAmount = Math.round(emiBase / emiMonths);

    const regDate = new Date(personal.registrationDate);
    
    let year = regDate.getFullYear();
    let month = regDate.getMonth() + 1;

    for (let i = 1; i <= emiMonths; i++) {
      const dueDate = getValidDueDate(year, month, installmentDay);
      const isFullPaid = payment.paymentOption === "Full Payment";

      await conn.query(
        `INSERT INTO student_payment_installments
         (student_id, installment_no, due_date, amount,
          paid_amount, bal_amount, status)
         VALUES (?,?,?,?,?,?,?)`,
        [
          studentCode,
          i,
          dueDate,
          emiAmount,
          isFullPaid ? emiAmount : 0,
          isFullPaid ? 0 : emiAmount,
          isFullPaid ? "PAID" : "PENDING"
        ]
      );

      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    await conn.commit();
    res.status(201).json({
      message: "Student added successfully",
      studentId: studentCode
    });

  } catch (err) {
    await conn.rollback();
    console.error("Add student error:", err);
    res.status(500).json({
      error: "Failed to add student",
      details: err.message
    });
  } finally {
    conn.release();
  }
};

//========== Get Studennt List =================
exports.getStudentlist = async (req, res) => {
    try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // total count
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM students_details'
    );

    const totalRecords = countRows[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // fetch students
    const [rows] = await pool.query(
      `SELECT 
        id,
        student_id,
        first_name,
        middle_name,
        last_name,
        mobile,
        email,
        branch,
        course_interested,
         DATE_FORMAT(registration_date, '%d-%m-%Y') AS registration_date,
        photo_name
      FROM students_details
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

//==========  Get full student details (Edit)  =================

exports.getStudentbyId = async (req, res) => {
    try {
    const { studentId } = req.params;

    const [student] = await pool.query(
      "SELECT * FROM students_details WHERE student_id = ?",
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const [academics] = await pool.query(
      `SELECT 
        level,
        institute,
        passing_year AS year,
        board_university AS board,
        percentage
      FROM student_academics
      WHERE student_id = ?`,
      [studentId]
    );

    const [payment] = await pool.query(
      `SELECT 
        total_course_fee AS totalFee,
        payment_mode AS paymentMode,
        payment_option AS paymentOption,
        regamount AS regamount,
        discount_amt AS discount_amt,
        installment_day AS installmentDay,
        remarks
      FROM student_payments
      WHERE student_id = ?`,
      [studentId]
    );

    res.json({
      personal: student[0],
      academics,
      payment: payment[0] || {},
    });
  } catch (err) {
    console.error("Fetch student error:", err);
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { studentId } = req.params;
    const parsed = JSON.parse(req.body.data);
    const { personal, family, academics, payment } = parsed;

    const photoFile = getFile(req.files, "photo");
    const addressProofFile = getFile(req.files, "addressProof");

    let fileSql = "";
    let fileParams = [];

    if (photoFile) {
      fileSql += ", photo_path = ?, photo_name = ?";
      fileParams.push(photoFile.path, photoFile.filename);
    }

    if (addressProofFile) {
      fileSql += ", address_proof_path = ?, address_proof_name = ?";
      fileParams.push(addressProofFile.path, addressProofFile.filename);
    }

    // Update student
    await conn.query(
      `UPDATE students_details SET
        first_name=?, middle_name=?, last_name=?,
        mobile=?, alternate_mobile=?, email=?, dob=?, gender=?,
        blood_group=?, branch=?, course_interested=?,
        registration_date=?, nationality=?,
        address_line1=?, address_line2=?, city=?, state=?, pincode=?,
        father_name=?, father_mobile=?, father_occupation=?,
        mother_name=?, mother_mobile=?, mother_occupation=?
        ${fileSql}
       WHERE student_id=?`,
      [
        personal.firstName,
        personal.middleName,
        personal.lastName,
        personal.mobile,
        personal.alternateMobile,
        personal.email,
        personal.dob,
        personal.gender,
        personal.bloodGroup,
        personal.branch,
        personal.courseInterested,
        personal.registrationDate,
        personal.nationality,
        personal.addressLine1,
        personal.addressLine2,
        personal.city,
        personal.state,
        personal.pincode,
        family.fatherName,
        family.fatherMobile,
        family.fatherOccupation,
        family.motherName,
        family.motherMobile,
        family.motherOccupation,
        ...fileParams,
        studentId
      ]
    );

    // Reset academics
    await conn.query(
      "DELETE FROM student_academics WHERE student_id=?",
      [studentId]
    );

    for (let i = 0; i < academics.length; i++) {
      const marksheet = getFile(req.files, `marksheet_${i}`);

      await conn.query(
        `INSERT INTO student_academics
         (student_id, level, institute, passing_year, board_university, percentage,
          marksheet_path, marksheet_name)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          studentId,
          academics[i].level,
          academics[i].institute,
          academics[i].passing_year,
          academics[i].board_university,
          academics[i].percentage,
          marksheet?.path || null,
          marksheet?.filename || null
        ]
      );
    }

    // Update payment
    await conn.query(
      `UPDATE student_payments SET
        total_course_fee=?, payment_mode=?, payment_option=?,
        regamount=?, discount_amt=?, installment_day=?, remarks=?
       WHERE student_id=?`,
      [
        payment.totalFee,
        payment.paymentMode,
        payment.paymentOption,
        payment.regamount,
        payment.discount_amt,
        payment.installmentDay,
        payment.remarks,
        studentId
      ]
    );

    await conn.commit();
    res.json({ message: "Student updated successfully" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  } finally {
    conn.release();
  }
};


// Get Installments (Payment History)
exports.getInstallments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [[student]] = await pool.query(
      `SELECT 
        s.student_id,
        CONCAT(s.first_name,' ',s.last_name) AS name,
        s.course_interested AS course,
        CONCAT('/images/pic/', s.photo_name) AS photo
       FROM students_details s
       WHERE s.student_id=?`,
      [studentId]
    );

    if (!student) return res.status(404).json({ error: "Student not found" });

    const [[payment]] = await pool.query(
      `SELECT total_course_fee FROM student_payments WHERE student_id=?`,
      [studentId]
    );

    const [[paid]] = await pool.query(
      `SELECT IFNULL(SUM(paid_amount),0) AS totalPaid
       FROM student_payment_ledger WHERE student_id=?`,
      [studentId]
    );

   const [installments] = await pool.query(
  `SELECT 
    i.id,
    i.installment_no,
    DATE_FORMAT(i.due_date,'%d-%m-%Y') AS due_date,
    i.amount,
    i.paid_amount,
    i.bal_amount,
    i.status,

    DATE_FORMAT(l.payment_date,'%d-%m-%Y') AS payment_date,
    l.remarks AS payment_remarks

   FROM student_payment_installments i
   LEFT JOIN student_payment_ledger l
     ON l.installment_id = i.id
   WHERE i.student_id = ?
   ORDER BY i.installment_no`,
  [studentId]
);
    res.json({
      student,
      paymentSummary: {
        totalCourseFee: payment.total_course_fee,
        totalPaid: paid.totalPaid,
        balanceAmount: payment.total_course_fee - paid.totalPaid
      },
      installments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch installments" });
  }
};


// Pay Emi
exports.payEmi = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { installmentId, studentId, amount, paymentMode, remarks } = req.body;

    await conn.beginTransaction();

    await conn.query(
      `UPDATE student_payment_installments
       SET paid_amount=?, bal_amount=0, status='PAID'
       WHERE id=?`,
      [amount, installmentId]
    );

    await conn.query(
      `INSERT INTO student_payment_ledger
       (student_id, installment_id, paid_amount, payment_mode, payment_date, remarks)
       VALUES (?,?,?,?,CURDATE(),?)`,
      [studentId, installmentId, amount, paymentMode, remarks]
    );

    await conn.commit();
    res.json({ message: "EMI paid successfully" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "EMI payment failed" });
  } finally {
    conn.release();
  }
};
