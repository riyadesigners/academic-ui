import React, { useEffect, useState } from "react";
import "./forms.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

   useEffect(() => {
  fetchLeads(page);
}, [page]);

const fetchLeads = async (currentPage) => {
  try {
    const res = await axios.get(
      `http://localhost:8081/riya_institute/leads?page=${currentPage}&limit=10`
    );

    setLeads(res.data.data);
    setTotalPages(res.data.pagination.totalPages);
  } catch (err) {
    console.error("Error fetching leads:", err);
  }
};

  // Delete handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLeads(leads.filter((lead) => lead.id !== id));
    }
  };

  // Edit handler
const handleEdit = (lead) => {
  navigate("/new-lead", { state: { leadId: lead.id } });
};

  return (
    <div className="container-fluid mt-4 mb-5 frontload">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">All Leads</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/new-lead")}
        >
          + Add New Lead
        </button>
      </div>

      <div className="table-responsive shadow p-3 bg-white rounded-4 ">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Course</th>
              <th>Lead Stage</th>
              <th>Lead Owner</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-3">
                  No Leads Found
                </td>
              </tr>
            ) : (
              leads.map((lead, index) => (
                <tr key={lead.id}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td>
                    {lead.enquiryFName} {lead.enquiryLName}
                  </td>
                  <td>{lead.contactNumber}</td>
                  <td>{lead.email}</td>
                  <td>{lead.branch}</td>
                  <td>{lead.courseInterested}</td>
                  <td>{lead.leadStage}</td>
                  <td>{lead.leadOwner}</td>
                  <td className={lead.leadStatus?.toLowerCase() === "not interested"
      ? "text-danger  "
      : "text-success "}>{lead.leadStatus}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm  me-2 text-success"
                      disabled={lead.leadStatus?.toLowerCase() === "converted"}
                      onClick={() => handleEdit(lead)}
                      title="Edit disabled for converted leads"
                    >
                      <i className="fas fa-edit"></i>
                    </button>

                    <button
                      className="btn btn-sm text-danger"
                      onClick={() => handleDelete(lead.id)}
                       disabled={lead.leadStatus?.toLowerCase() === "converted"}
                      title="Delete disabled for converted leads"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* pagination */}
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-primary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)} ><i class="fas fa-chevron-left"></i> </button>
          <span className="align-self-center">Page {page} of {totalPages}</span>
          <button className="btn btn-outline-primary btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  );
};

export default LeadList;
