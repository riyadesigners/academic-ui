import React, { useState } from "react";
import "./../forms.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { Tabs, Tab, Accordion, Card, Form, NavItem } from "react-bootstrap";
import { add, set } from "date-fns";

const AddStudent = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const isEditMode = Boolean(studentId);
  const mobileRegex = /^[0-9]{10}$/;

  // ----------------Tab control----------------
  const [activeTab, setActiveTab] = useState("personal");
  const tabOrder = ["personal", "family", "academic", "payment"];

  const nextTab = () => {
    const index = tabOrder.indexOf(activeTab);
    if (index < tabOrder.length - 1) {
      setActiveTab(tabOrder[index + 1]);
    }
  };
  const prevTab = () => {
    const index = tabOrder.indexOf(activeTab);
    if (index > 0) {
      setActiveTab(tabOrder[index - 1]);
    }
  };
  // ----------------Academic Table----------------
  const academicLevels = ["SSC", "HSC", "UG", "Graduate", "PG"];
  const [academicRows, setAcademicRows] = React.useState([
    {
      level: "",
      institute: "",
      year: "",
      board: "",
      percentage: "",
      marksheet: null,
    },
  ]);
  const handleAcademicChange = (index, field, value) => {
    const updated = [...academicRows];
    updated[index][field] = value;
    setAcademicRows(updated);
  };

  const handleMarksheetChange = (index, file) => {
    const updated = [...academicRows];
    updated[index].marksheet = file;
    setAcademicRows(updated);
  };
  const addAcademicRow = () => {
    setAcademicRows([
      ...academicRows,
      { level: "", institute: "", year: "", board: "", percentage: "" },
    ]);
  };
  // ----------------Upload photo----------------

  const removeAcademicRow = (index) => {
    const updated = academicRows.filter((_, i) => i !== index);
    setAcademicRows(updated);
  };

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [addressPreview, setAddressPreview] = useState(null);
  const [addressProofName, setAddressProofName] = useState(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };
  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };
  // handler for address proof
  const handleAddressProofChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAddressProof(file);
    setAddressProofName(file.name);

    // preview only if image
    if (file.type.startsWith("image/")) {
      setAddressPreview(URL.createObjectURL(file));
    } else {
      setAddressPreview(null); // pdf → no image preview
    }
  };

  const removeAddressProof = () => {
    setAddressProof(null);
    setAddressPreview(null);
    setAddressProofName(null);
  };

  //----------------validate form----------------
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    dob: null,
    gender: "",
    bloodGroup: "",
    registrationDate: null,
    branch: "",
    courseInterested: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    nationality: "",
    fatherName: "",
    fatherMobile: "",
    fatherOccupation: "",
    motherName: "",
    motherMobile: "",
    motherOccupation: "",
    totalFee: "",
    paymentMode: "",
    paymentOption: "",
    regamount: "",
    discount_amt: "",
    installmentDay: "",
    remarks: "",
    photoPath: null,
    photoName: null,
  });
  const isOtherPayment = formData.paymentOption === "Other";
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const isAtLeast15YearsOld = (dob) => {
    if (!dob) return false;

    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0;
  };
  const validatePersonal = () => {
    let err = {};
    if (!formData.firstName.trim()) {
      err.firstName = "First Name is Required";
    }
    if (!formData.lastName.trim()) {
      err.lastName = "Last Name is Required";
    }
    if (!mobileRegex.test(formData.mobile)) {
      err.mobile = "Mobile number must be exactly 10 digits";
    }
    if (
      formData.alternateMobile &&
      !mobileRegex.test(formData.alternateMobile)
    ) {
      err.alternateMobile = "Alternate mobile must be 10 digits";
    }
    if (!formData.gender) {
      err.gender = "Gender is Required";
    }
    if (!formData.email) {
      err.email = "Email is Required";
    }
    if (!formData.dob) {
      err.dob = "Date of Birth is required";
    } else if (!isAtLeast15YearsOld(formData.dob)) {
      err.dob = "Student must be at least 15 years old";
    }
    if (!formData.courseInterested) err.courseInterested = "Course is required";
    if (!formData.branch) err.branch = "Branch is required";
    if (!formData.registrationDate)
      err.registrationDate = "Registration Date is required";
    if (!/^\d{6}$/.test(formData.pincode))
      err.pincode = "Enter valid 6-digit pincode";
    if (!formData.city) err.city = "City is required";
    if (!formData.state) err.state = "State is required";
    if (!formData.nationality) err.nationality = "Nationality is required";
    if (formData.fatherMobile && !mobileRegex.test(formData.fatherMobile)) {
      err.fatherMobile = "Father mobile must be 10 digits";
    }

    if (formData.motherMobile && !mobileRegex.test(formData.motherMobile)) {
      err.motherMobile = "Mother mobile must be 10 digits";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleTabSelect = (nextTab) => {
    if (nextTab === activeTab) return;

    let isValid = true;
    if (activeTab === "personal") isValid = validatePersonal();
    if (activeTab === "academic") isValid = validateAcademic();
    if (activeTab === "payment") isValid = validatePayment();
    if (!isValid) return;

    setActiveTab(nextTab);
  };
  const validateAcademic = () => {
    let err = {};

    if (academicRows.length === 0) {
      err.academic = "At least one academic record required";
    }

    academicRows.forEach((row, index) => {
      if (!row.level) err[`level_${index}`] = "Level required";

      if (!/^\d{4}$/.test(row.year))
        err[`year_${index}`] = "Enter valid year (YYYY)";

      if (
        !/^\d{1,3}(\.\d{1,2})?$/.test(row.percentage) ||
        row.percentage < 0 ||
        row.percentage > 100
      ) {
        err[`percentage_${index}`] = "Percentage must be 0–100";
      }
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validatePayment = () => {
    let err = {};

    if (!/^\d+(\.\d{1,2})?$/.test(formData.totalFee)) {
      err.totalFee = "Enter valid amount (e.g. 15000 or 15000.00)";
    }

    if (!formData.paymentMode) err.paymentMode = "Payment mode required";
    if (!formData.paymentOption) err.paymentOption = "Payment option required";
    if (!formData.installmentDay) err.installmentDay = "Select payment date";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    let isValid = true;

    if (activeTab === "personal") isValid = validatePersonal();

    if (activeTab === "academic") isValid = validateAcademic();

    if (!isValid) return;

    nextTab();
  };

  const handleSubmit = async () => {
    const valid = validatePersonal() && validateAcademic() && validatePayment();

    if (!valid) return;

    //  Build normal payload object
    const dataPayload = {
      personal: {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile,
        email: formData.email,
        dob: formData.dob ? formData.dob.toISOString().split("T")[0] : null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        branch: formData.branch,
        courseInterested: formData.courseInterested,
        registrationDate: formData.registrationDate
          ? formData.registrationDate.toISOString().split("T")[0]
          : null,
        nationality: formData.nationality,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      family: {
        fatherName: formData.fatherName,
        fatherMobile: formData.fatherMobile,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherMobile: formData.motherMobile,
        motherOccupation: formData.motherOccupation,
      },
      academics: academicRows.map((row) => ({
        level: row.level,
        institute: row.institute,
        passing_year: row.year,
        board_university: row.board,
        percentage: row.percentage,
      })),
      payment: {
        totalFee: formData.totalFee,
        paymentMode: formData.paymentMode,
        regamount: formData.regamount,
        discount_amt: formData.discount_amt,
        paymentOption: formData.paymentOption,
        installmentDay: formData.installmentDay,
        remarks: formData.remarks,
      },
    };

    // function getNextInstallmentDate(day) {
    //   if (!day) return null;
    //   const today = new Date();
    // }
    const formPayload = new FormData();

    // photo is your existing state (already correct)
    if (photo) {
      formPayload.append("photo", photo);
    }
    if (addressProof) {
      formPayload.append("addressProof", addressProof);
    }
    academicRows.forEach((row, index) => {
      if (row.marksheet) {
        formPayload.append(`marksheet_${index}`, row.marksheet);
      }
    });

    // send rest of data as JSON string
    formPayload.append("data", JSON.stringify(dataPayload));

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8081/riya_institute/updateStudent/${studentId}`,
          formPayload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        alert("Student updated successfully");
      } else {
        const res = await axios.post(
          "http://localhost:8081/riya_institute/addStudent",
          formPayload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        alert(`Student Added\nID: ${res.data.studentId}`);
      }

      navigate("/Student/StudentList");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  //update student details in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/riya_institute/student/${studentId}`,
        );

        const { personal, academics, payment } = res.data;

        setFormData((prev) => ({
          ...prev,
          firstName: personal.first_name,
          middleName: personal.middle_name,
          lastName: personal.last_name,
          mobile: personal.mobile,
          alternateMobile: personal.alternate_mobile,
          email: personal.email,
          dob: personal.dob ? new Date(personal.dob) : null,
          gender: personal.gender,
          bloodGroup: personal.blood_group,
          branch: personal.branch,
          courseInterested: personal.course_interested,
          registrationDate: new Date(personal.registration_date),
          nationality: personal.nationality,
          addressLine1: personal.address_line1,
          addressLine2: personal.address_line2,
          city: personal.city,
          state: personal.state,
          pincode: personal.pincode,
          fatherName: personal.father_name,
          fatherMobile: personal.father_mobile,
          fatherOccupation: personal.father_occupation,
          motherName: personal.mother_name,
          motherMobile: personal.mother_mobile,
          motherOccupation: personal.mother_occupation,
          photoName: personal.photo_name,
          totalFee: payment.totalFee || "",
          paymentMode: payment.paymentMode || "",
          paymentOption: payment.paymentOption || "",
          regamount: payment.regamount || "",
          discount_amt: payment.discount_amt || "",
          installmentDay: payment.installmentDay
            ? String(payment.installmentDay)
            : "",
          remarks: payment.remarks || "",
        }));

        setAcademicRows(academics);
        // setFormData((prev) => ({ ...prev, ...payment }));
        if (personal.photo_name) {
          setPreview(`http://localhost:8081/images/pic/${personal.photo_name}`);
        }
        if (personal.address_proof_name) {
          setAddressProofName(personal.address_proof_name);

          if (!personal.address_proof_name.endsWith(".pdf")) {
            setAddressPreview(
              `http://localhost:8081/images/pic/${personal.address_proof_name}`,
            );
          }
        }
      } catch {
        alert("Failed to load student");
      }
    };

    fetchStudent();
  }, [studentId, isEditMode]);

  return (
    <div className="container-fluid ">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">
          {isEditMode ? "Edit Student" : "Add Student"}
        </h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/Student/StudentList")}
        >
          View All Student
        </button>
      </div>
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fotm-heading">Add Student</h3>
      </div> */}

      <div className="lead-form-container shadow-lg p-4 rounded-4">
        <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-4">
          {/* ================= PERSONAL ================= */}
          <Tab eventKey="personal" title="Personal Details">
            <div className="form-section">
              <div className="row g-3">
                <div className="col-md-3">
                  <label>First Name</label>
                  <input
                    className={`form-control modern-input ${errors.firstName ? "is-invalid" : ""}`}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <small className="text-danger">{errors.firstName}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Middle Name</label>
                  <input
                    className="form-control modern-input"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label>Last Name</label>

                  <input
                    name="lastName"
                    value={formData.lastName}
                    className={`form-control modern-input ${errors.lastName ? "is-invalid" : ""}`}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <small className="text-danger">{errors.lastName} </small>
                  )}
                </div>

                <div className="col-md-3">
                  <label>Mobile Number</label>
                  <input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`form-control modern-input ${errors.mobile ? "is-invalid" : ""}`}
                  />
                  {errors.mobile && (
                    <small className="text-danger">{errors.mobile}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Alternate Number</label>
                  <input
                    className="form-control modern-input"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label>Date of Birth</label>
                  {/* <input type="date" className="form-control modern-input" /> */}
                  <DatePicker
                    showIcon
                    // selected={formData.enquiryDate}
                    // onChange={(date) => setFormData({...formData, enquiryDate:date})}
                    selected={formData.dob}
                    onChange={(date) => setFormData({ ...formData, dob: date })}
                    className="form-control modern-datepicker"
                    placeholderText="Select Date"
                    dateFormat="dd-MM-yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 48 48"
                      >
                        <mask id="ipSApplication0">
                          <g
                            fill="none"
                            stroke="#fff"
                            strokeLinejoin="round"
                            strokeWidth="4"
                          >
                            <path
                              strokeLinecap="round"
                              d="M40.04 22v20h-32V22"
                            ></path>
                            <path
                              fill="#fff"
                              d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                            ></path>
                          </g>
                        </mask>
                        <path
                          fill="currentColor"
                          d="M0 0h48v48H0z"
                          mask="url(#ipSApplication0)"
                        ></path>
                      </svg>
                    }
                    dateFormat="dd-MM-yyyy"
                  />
                  {errors.dob && (
                    <small className="text-danger">{errors.dob}</small>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label  ">Gender</label>
                  <select
                    className={`form-select modern-input ${errors.gender ? "is-invalid" : ""}`}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Others</option>
                  </select>
                  {errors.gender && (
                    <small className="text-danger">{errors.gender}</small>
                  )}
                </div>

                <div className="col-md-3">
                  <label>Email ID</label>
                  <input
                    className={`form-control modern-input ${errors.email ? "is-invalid" : ""}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label  ">Blood Group</label>
                  <select
                    className="form-select modern-input"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>A +</option>
                    <option>B +</option>
                    <option>B -</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label  ">Branch</label>
                  <select
                    className={`form-select modern-input ${errors.branch ? "is-invalid" : ""}`}
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Nerul</option>
                    <option>Thane</option>
                    <option>Pune</option>
                  </select>
                  {errors.branch && (
                    <small className="text-danger">{errors.branch}</small>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label  ">Course Interested</label>

                  <select
                    className={`form-select modern-input ${errors.courseInterested ? "is-invalid" : ""}`}
                    name="courseInterested"
                    value={formData.courseInterested}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Course 1</option>
                    <option>Course 2</option>
                    <option>Course 3</option>
                  </select>
                  {errors.courseInterested && (
                    <small className="text-danger">
                      {errors.courseInterested}
                    </small>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label  ">Registration Date</label>
                  {/* <input type="date" className="form-control modern-input" name="enquiryDate" onChange={handleChange} /> */}
                  <div
                    className={`datepicker-wrapper ${errors.registrationDate ? "is-invalid" : ""}`}
                  >
                    <DatePicker
                      selected={formData.registrationDate}
                      onChange={(date) =>
                        setFormData({ ...formData, registrationDate: date })
                      }
                      showIcon
                      className="form-control modern-datepicker"
                      placeholderText="Select Date"
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 48 48"
                        >
                          <mask id="ipSApplication0">
                            <g
                              fill="none"
                              stroke="#fff"
                              strokeLinejoin="round"
                              strokeWidth="4"
                            >
                              <path
                                strokeLinecap="round"
                                d="M40.04 22v20h-32V22"
                              ></path>
                              <path
                                fill="#fff"
                                d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                              ></path>
                            </g>
                          </mask>
                          <path
                            fill="currentColor"
                            d="M0 0h48v48H0z"
                            mask="url(#ipSApplication0)"
                          ></path>
                        </svg>
                      }
                      dateFormat="dd-MM-yyyy"
                    />
                  </div>
                  {errors.registrationDate && (
                    <small className="text-danger">
                      {errors.registrationDate}
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label>Address Line 1 </label>
                  <input
                    className="form-control modern-input"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>Address Line 2 </label>
                  <input
                    className="form-control modern-input"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">City</label>
                  <select
                    className={`form-select modern-input ${errors.city ? "is-invalid" : ""}`}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Mumbai</option>
                    <option>New Mumbai</option>
                    <option>Pune</option>
                  </select>
                  {errors.city && (
                    <small className="text-danger">{errors.city}</small>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label  ">State</label>
                  <select
                    className={`form-select modern-input ${errors.state ? "is-invalid" : ""}`}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                    <option>Delhi</option>
                  </select>
                  {errors.state && (
                    <small className="text-danger">{errors.state}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Pin Code </label>
                  <input
                    className={`form-control modern-input ${errors.pincode ? "is-invalid" : ""}`}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                  {errors.pincode && (
                    <small className="text-danger">{errors.pincode}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nationality</label>

                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={`form-select modern-input ${errors.nationality ? "is-invalid" : ""}`}
                  >
                    <option value="">Select</option>
                    <option>India</option>
                    <option>Australia</option>
                    <option>USA</option>
                  </select>
                  {errors.nationality && (
                    <small className="text-danger">{errors.nationality}</small>
                  )}
                </div>
              </div>
            </div>

            <div className="text-end mt-4">
              <button className="btn btn-primary px-4" onClick={handleNext}>
                Next →
              </button>
            </div>
          </Tab>

          {/* ================= FAMILY ================= */}
          <Tab eventKey="family" title="Family Details">
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Father / Guardian</Accordion.Header>
                <Accordion.Body>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label>Father Name</label>
                      <input
                        name="fatherName"
                        value={formData.fatherName}
                        className="form-control modern-input mb-2"
                        onChange={handleChange}
                      />
                      {/* <input  placeholder="Name" /> */}
                    </div>
                    <div className="col-md-6">
                      <label>Mobile No</label>
                      <input
                        name="fatherMobile"
                        value={formData.fatherMobile}
                        className="form-control modern-input mb-2"
                        onChange={handleChange}
                      />
                      {/* <input  placeholder="Mobile Number" /> */}
                    </div>
                    <div className="col-md-6">
                      <label>Occupation</label>
                      <input
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        className="form-control modern-input"
                        onChange={handleChange}
                      />
                      {/* <input  placeholder="Occupation" /> */}
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Mother / Guardian</Accordion.Header>
                <Accordion.Body>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label>Mothers Name</label>
                      <input
                        name="motherName"
                        value={formData.motherName}
                        className="form-control modern-input mb-2"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Mobile No</label>
                      <input
                        name="motherMobile"
                        value={formData.motherMobile}
                        className="form-control modern-input mb-2"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Occupation</label>
                      <input
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        className="form-control modern-input"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={prevTab}>
                ← Previous
              </button>
              <button className="btn btn-primary" onClick={nextTab}>
                Next →
              </button>
            </div>
          </Tab>

          {/* ================= ACADEMIC ================= */}
          <Tab eventKey="academic" title="Academic Details">
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: "160px" }}>Level</th>
                    <th>School / College</th>
                    <th style={{ width: "150px" }}>Year</th>
                    <th>Board / University</th>
                    <th style={{ width: "120px" }}>Percentage</th>
                    <th style={{ width: "100px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {academicRows.map((row, index) => (
                    <tr key={index}>
                      {/* Level Dropdown */}
                      <td>
                        <select
                          className="form-select modern-input"
                          value={row.level}
                          onChange={(e) =>
                            handleAcademicChange(index, "level", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {academicLevels.map((lvl) => (
                            <option
                              key={lvl}
                              value={lvl}
                              disabled={academicRows.some(
                                (r, i) => r.level === lvl && i !== index,
                              )}
                            >
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* School / College */}
                      <td>
                        <input
                          className="form-control modern-input"
                          value={row.institute}
                          onChange={(e) =>
                            handleAcademicChange(
                              index,
                              "institute",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* Year */}
                      <td>
                        <input
                          className="form-control modern-input"
                          value={row.year}
                          maxLength={4}
                          onChange={(e) =>
                            handleAcademicChange(
                              index,
                              "year",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                        />
                      </td>

                      {/* Board */}
                      <td>
                        <input
                          className="form-control modern-input"
                          value={row.board}
                          onChange={(e) =>
                            handleAcademicChange(index, "board", e.target.value)
                          }
                        />
                      </td>

                      {/* Percentage */}
                      <td>
                        <input
                          className="form-control modern-input"
                          value={row.percentage}
                          onChange={(e) =>
                            handleAcademicChange(
                              index,
                              "percentage",
                              e.target.value.replace(/[^0-9.]/g, ""),
                            )
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <div className="d-flex justify-content-center align-items-middle">
                          <label className="btn btn-sm text-primary m-0">
                            <i className="fas fa-upload"></i>
                            <input
                              type="file"
                              hidden
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                handleMarksheetChange(index, e.target.files[0])
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="btn btn-sm  text-success  mr-2"
                            onClick={addAcademicRow}
                            title="Add Row"
                          >
                            <i className="fas fa-plus"></i>
                          </button>

                          {academicRows.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm  text-danger"
                              onClick={() => removeAcademicRow(index)}
                              title="Delete Row"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={prevTab}>
                ← Previous
              </button>
              <button className="btn btn-primary" onClick={handleNext}>
                Next →
              </button>
            </div>
          </Tab>

          {/* ================= PAYMENT ================= */}
          <Tab eventKey="payment" title="Payment">
            <div className="form-section">
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label>Total Course Fee</label>
                  <input
                    name="totalFee"
                    value={formData.totalFee}
                    className={`form-control modern-input ${errors.totalFee ? "is-invalid" : ""}`}
                    onChange={(e) => {
                      const value = e.target.value;

                      // allow empty, integers, or decimals up to 2 places
                      if (/^\d*(\.\d{0,2})?$/.test(value)) {
                        setFormData({ ...formData, totalFee: value });
                      }
                    }}
                  />
                  {errors.totalFee && (
                    <small className="text-danger">{errors.totalFee}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Payment Mode</label>
                  <select
                    className={`form-select modern-input ${errors.paymentMode ? "is-invalid" : ""}`}
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                  {errors.paymentMode && (
                    <small className="text-danger">{errors.paymentMode}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Payment Option</label>
                  <select
                    className={`form-select modern-input ${errors.paymentOption ? "is-invalid" : ""}}`}
                    name="paymentOption"
                    value={formData.paymentOption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentOption: e.target.value,
                        otherPaymentOption:
                          e.target.value === "Other" ? "" : "",
                      })
                    }
                  >
                    <option value="">Select</option>
                    <option>Full Payment</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>9 Months</option>
                    <option>Other</option>
                  </select>
                  {errors.paymentOption && (
                    <small className="text-danger">
                      {errors.paymentOption}
                    </small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Other Payment Option</label>
                  <input
                    className="form-control modern-input"
                    placeholder="Specify payment option"
                    disabled={!isOtherPayment}
                    value={formData.otherPaymentOption || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otherPaymentOption: e.target.value,
                      })
                    }
                  />
                </div>
                {/* <div className="col-lg-12 mt-3 ">
                      <div className="d-flex   flex-wrap gap-3">
                      <label>Date of Payment : </label>
                      {['radio'].map((type) => (
                        <div key={`inline-${type}`} className="">
                          <Form.Check
                            inline
                            label="5th"
                            name="group1"
                            type={type}
                            id={`inline-${type}-1`}
                          />
                          <Form.Check
                            inline
                            label="10th"
                            name="group1"
                            type={type}
                            id={`inline-${type}-2`}
                          />
                          <Form.Check
                            inline
                            label="15th"
                            name="group1"
                            type={type}
                            id={`inline-${type}-3`}
                          />
                           <Form.Check
                            inline
                            label="20th"
                            name="group1"
                            type={type}
                            id={`inline-${type}-3`}
                          />
                        </div>
                      ))}
                      </div>
                    </div> */}
                <div className="col-md-3">
                  <label>Registration Amount</label>

                  <input
                    name="regamount"
                    value={formData.regamount}
                    className="form-control modern-input"
                    onChange={handleChange}
                  />
                  {errors.regamount && (
                    <small className="text-danger">{errors.regamount}</small>
                  )}
                </div>
                <div className="col-md-3">
                  <label>Discount (If any)</label>
                  <input
                    name="discount_amt"
                    value={formData.discount_amt}
                    className="form-control modern-input"
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mt-3">
                  <label className="me-3">Date of Payment :</label>

                  {[5, 10, 15, 20].map((day) => (
                    <Form.Check
                      key={day}
                      inline
                      type="radio"
                      label={`${day}th`}
                      name="installmentDay"
                      value={String(day)} // ✅ force string
                      checked={formData.installmentDay === String(day)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installmentDay: e.target.value,
                        })
                      }
                    />
                  ))}
                  {errors.installmentDay && (
                    <small className="text-danger d-block">
                      {errors.installmentDay}
                    </small>
                  )}
                </div>
              </div>

              {/* 🔽 PHOTO UPLOAD SECTION */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="mb-1">Upload Photo</label>

                  <div className="upload-card">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="upload-input"
                    />

                    {!preview ? (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload photo</p>
                        <small>PNG, JPG up to 2MB</small>
                      </div>
                    ) : (
                      <div className="upload-preview">
                        <img src={preview} alt="Preview" />

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={removePhoto}
                          title="Remove photo"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="mb-1">Upload Address Proof</label>

                  <div className="upload-card">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAddressProofChange}
                      className="upload-input"
                    />

                    {!addressProofName ? (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload address proof</p>
                        <small>PNG, JPG, PDF up to 2MB</small>
                      </div>
                    ) : (
                      <div className="upload-preview">
                        {/* IMAGE PREVIEW */}
                        {addressPreview ? (
                          <img src={addressPreview} alt="Address Proof" />
                        ) : (
                          /* PDF PREVIEW */
                          <div className="pdf-preview">
                            <i className="fas fa-file-pdf fa-3x text-danger"></i>
                            <p className="mt-2">{addressProofName}</p>
                          </div>
                        )}

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={removeAddressProof}
                          title="Remove address proof"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Additional Remarks (Office Use)</label>
                  <textarea
                    className="form-control modern-input"
                    name="remarks"
                    rows="5"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={prevTab}>
                ← Previous
              </button>
              {/* <button className="btn modern-btn px-5 py-2"  onClick={handleSubmit}>
            Add Student
          </button> */}
              <button
                className="btn modern-btn px-5 py-2"
                onClick={handleSubmit}
              >
                {isEditMode ? "Update Student" : "Add Student"}
              </button>
            </div>
          </Tab>
        </Tabs>

        {/* Action Bar */}
        {/* <div className="text-center mt-4">
          <button className="btn modern-btn px-5 py-2">
            Add Student
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AddStudent;
