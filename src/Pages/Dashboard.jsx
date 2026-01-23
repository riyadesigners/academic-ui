import React, { useEffect, useState } from "react";
import "./forms.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
useEffect(() => {
  fetchLeads(page);
}, [page]);

const fetchLeads = async (currentPage) => {
  const res = await axios.get(
    `http://localhost:8081/riya_institute/leads1?page=${currentPage}&limit=5`
  );
  setLeads(res.data.data);
  setTotalPages(res.data.pagination.totalPages);
};
 
  return (
    <div className="row frontload">
      <div className="col-lg-6">
        <h5>Active Lead</h5>
        <div className="table-responsive shadow p-3 bg-white rounded-4 ">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Contact</th>
              
              <th>Course</th>
              <th>Lead Stage</th>
              <th>Status</th>
              <th>Lead Owner</th>
              {/* <th className="text-center">Actions</th> */}
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
                 
                  <td>{lead.courseInterested}</td>
                  <td>{lead.leadStage}</td>
                  <td>{lead.leadStatus}</td>
                  <td>{lead.leadOwner}</td>
                  {/* <td className="text-center">
                    <button
                      className="btn btn-sm  me-2 text-success"
                      
                    >
                      <i className="fas fa-edit"></i>
                    </button>
 
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* pagination */}
        {/* <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-primary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)} >Prev </button>
          <span className="align-self-center">Page {page} of {totalPages}</span>
          <button className="btn btn-outline-primary btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div> */}
      </div>
      </div>
      <div className="col-lg-6"></div>
    </div>
  );
};

export default Dashboard;
