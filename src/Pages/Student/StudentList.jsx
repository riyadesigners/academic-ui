import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./../forms.css";
import { set } from "date-fns";

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [showModal, setShowModal] = useState(false);
  const [installments, setInstallments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  //pay emi

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [remarks, setRemarks] = useState("");

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState({
    totalCourseFee: 0,
    totalPaid: 0,
    balanceAmount: 0,
  });

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  const fetchStudents = async (currentPage) => {
    try {
      const res = await api.get(
        `/riya_institute/students?page=${currentPage}&limit=${limit}`,
      );
      setStudents(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

const openPayModal = async (studentId) => {
  try {
    setSelectedStudent(studentId);

    const res = await api.get(
      `/riya_institute/student/${studentId}/installments`
    );

    setStudent(res.data.student);
    setSummary(res.data.paymentSummary);
    setInstallments(res.data.installments);  

    setShowModal(true);
  } catch (err) {
    console.error(err);
  }
};


  const payEmi = async (installment) => {
    await api.post("/riya_institute/student/pay-emi", {
      installmentId: installment.id,
      studentId: selectedStudent,
      amount: installment.amount,
      paymentMode: "Cash",
      remarks: "EMI Paid",
    });

    // reload installments
    openPaymentModal(selectedStudent);
  };

  // const openPayModal = (installment) => {
  //   setSelectedInstallment(installment);
  //   setPaymentMode("Cash");
  //   setRemarks("");
  //   setShowPayModal(true);
  // }
  const openPaymentModal = async (studentId) => {
    try {
      setSelectedStudent(studentId);

      const res = await api.get(
        `/riya_institute/student/${studentId}/installments`,
      );

      setStudent(res.data.student);
      setSummary(res.data.paymentSummary);
      setInstallments(res.data.installments);

      setShowModal(true);
    } catch (err) {
      console.error("Failed to load installment data", err);
    }
  };
  const confirmPayEmi = async () => {
    try {
      await api.post("/riya_institute/student/pay-emi", {
        installmentId: selectedInstallment.id,
        studentId: selectedStudent,
        amount: selectedInstallment.amount,
        paymentMode,
        remarks,
      });
      setShowPayModal(false);
      //refresh list
      openPaymentModal(selectedStudent);
    } catch (err) {
      console.error("EMI payment failed", err);
      alert("payment failed");
    }
  };

  // const fetchInstallments = async(studentId) => {
  //   const res =  await fetch(
  //     `/riya_institute/student/${studentId}/installments`
  //   );

  //   const data = await res.json();
  //   setStudents(data.student);
  //   setSummary(data.paymentSummary);
  //   setInstallments(data.installments);
  // }

  return (
    <div className="container-fluid mt-4 mb-5 frontload">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">All Students</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/Student/AddStudent")}
        >
          + Add New Student
        </button>
      </div>

      <div className="table-responsive shadow p-3 bg-white rounded-4">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Course</th>
              <th>Registration Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-3">
                  No Students Found
                </td>
              </tr>
            ) : (
              students.map((stu, index) => (
                <tr key={stu.id}>
                  <td>{(page - 1) * limit + index + 1}</td>

                  <td>
                    {stu.photo_name ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/images/pic/${stu.photo_name}`}
                        alt="student"
                        width="45"
                        height="45"
                        className="rounded-circle"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>

                  <td>{stu.student_id}</td>
                  <td>
                    {stu.first_name} {stu.middle_name} {stu.last_name}
                  </td>
                  <td>{stu.mobile}</td>
                  <td>{stu.email}</td>
                  <td>{stu.branch}</td>
                  <td>{stu.course_interested}</td>
                  <td>{stu.registration_date?.split("T")[0]}</td>

                  <td className="text-center">
                    <button
                      className="btn btn-sm text-warning me-1"
                      onClick={() => openPaymentModal(stu.student_id)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm text-success me-1"
                      onClick={() =>
                        navigate(`/Student/AddStudent/${stu.student_id}`)
                      }
                    >
                      <i className="fas fa-edit"></i>
                    </button>

                    {/* <button className="btn btn-sm text-danger">
                      <i className="fas fa-trash-alt"></i>
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-end align-items-center gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block installment-backdrop">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              {/* Header */}
              <div className="modal-header border-0 pb-2">
                {student && (
                  <div className="row w-100 mt-2">
                    <div className="col-lg-12 d-flex align-items-center gap-3">
                      <img
                        src={`${process.env.REACT_APP_API_URL}${student.photo}`}
                        className="rounded-circle"
                        width="60"
                        height="60"
                        alt="student"
                      />

                      <div>
                        <h5 className="mb-0">
                          {student.name}{" "}
                          <span className="text-muted">
                            ({selectedStudent})
                          </span>
                        </h5>
                        <small className="text-muted">{student.course}</small>
                      </div>
                      <button
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="modal-body pt-2">
                <div className="table-responsive">
                  <table className="table align-middle installment-table">
                    <thead className="table-primary">
                      <tr className="text-muted small">
                        <th>#</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment Date</th>
                        <th>Remark</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {installments.map((ins, i) => (
                        <tr key={ins.id}>
                          <td>{i + 1}</td>

                          <td>{ins.due_date?.split("T")[0]}</td>

                          <td className="fw-semibold">
                            ₹{Number(ins.amount).toLocaleString()}
                          </td>

                          <td>
                            <span
                              className={`badge px-3 py-2 rounded-pill ${
                                ins.status === "PAID"
                                  ? "bg-success-subtle text-success"
                                  : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {ins.status}
                            </span>
                          </td>
                          <td>
                            {ins.payment_date ? (
                              <span className="text-success">
                                {ins.payment_date}
                              </span>
                            ) : (
                              <span className="text-muted">--</span>
                            )}
                          </td>
                          <td>
                            {ins.payment_remarks ? (
                              <span title={ins.payment_remarks}>
                                {ins.payment_remarks}
                              </span>
                            ) : (
                              <span className="text-muted">--</span>
                            )}
                          </td>

                          <td className="text-end">
                            {ins.status === "PENDING" ? (
                              <button
                                className="btn btn-success btn-sm px-3"
                               onClick={() => {
                                      setSelectedInstallment(ins);
                                      setShowPayModal(true);
                                    }}
                                                                >
                                Pay EMI
                              </button>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 pt-0">
                <div className="row w-100">
                  <div className="col-lg-4 text-left">
                    <h6>
                      Total Course Fee{" "}
                      <strong>
                        ₹ {summary.totalCourseFee.toLocaleString()}
                      </strong>
                    </h6>
                  </div>

                  <div className="col-lg-4 text-center">
                    <h6>
                      Total Paid{" "}
                      <strong className="text-success">
                        ₹ {summary.totalPaid.toLocaleString()}
                      </strong>
                    </h6>
                  </div>

                  <div className="col-lg-4 text-end">
                    <h6>
                      Balance Amount{" "}
                      <strong className="text-danger">
                        ₹ {summary.balanceAmount.toLocaleString()}
                      </strong>
                    </h6>
                  </div>
                </div>
                {/* <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayModal && selectedInstallment && (
        <div className="modal fade show d-block pay-emi-backdrop">
          <div className="modal-dialog modal-md  ">
            <div className="modal-content shadow-lg border-0 rounded-4">
              {/* Header */}
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold">Pay EMI</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowPayModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body pt-2">
                <div className="emi-info-box p-3 rounded-3 mb-3">
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Student ID</div>
                    <div className="col-7 fw-semibold">{selectedStudent}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 text-muted">Installment No</div>
                    <div className="col-7 fw-semibold">
                      {selectedInstallment.installment_no}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-5 text-muted">Amount</div>
                    <div className="col-7 fw-bold text-success fs-5">
                      ₹{Number(selectedInstallment.amount).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Payment Mode</label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="form-label fw-semibold">Remarks</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowPayModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={confirmPayEmi}
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
