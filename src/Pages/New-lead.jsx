import React, { useState } from "react";
import "./forms.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const LeadForm = () => {

  const location = useLocation();
 const leadId = location.state?.leadId;
  const navigate = useNavigate();
const [errors, setErrors] = useState({});

  //value for lead remarks based on lead status
  const leadRemarksOptions ={
    Active : [
      "1st Connect",
    "Counseling",
    "Counseling Follow up",
    "Conversion Follow up"
    ],
    Inactive : [
      "Not responding after 1st Connect",
    "GDS Training Only",
    "IATA Certificate Only",
    "Just Enquired",
    "Language Barrier",
    "Location Issue",
    "Next Batch Intake",
    "Not enquired",
    "Not Potential",
    "Not Interested",
    "Plan Drop - Financial Barrier",
    "Plan Drop - Other Reason",
    "Prefers Weekend Batch",
    "Prefers Other Course",
    "Repeat Enquiry",
    "Job Search",
    "Time Issue",
    "Took Admission in other Institute",
    "Unable to Connect",
    "Wrong Number",
    "Prefers Online IATA PGS",
    "Not Responding after Counseling"
    ],
    Converted : [
      "Success"
    ]
  };


  const [formData, setFormData] = useState({
    id: null,
  leadOwner: "",
  enquiryDate: "",
  leadSource: "",
  enquiryFName: "",
  enquiryLName: "",
  contactNumber: "",
  email: "",
  branch: "",
  leadLocation: "",
  courseInterested: "",
  callDate: "",
  nextFollowUp: "",
  leadStage: "",
  leadStatus: "",
  leadRemark: "",
  remarks: "",
  ownerFeedback: ""
  });
  const validateLeadForm = () => {
    const newErrors = {};
    if(!formData.enquiryFName.trim())
      newErrors.enquiryFName = "First name is required";

    if(!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if(!/^\d{10}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Enter valid 10 digit number";

    if(!formData.email)
      newErrors.email = "Email is required";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
    newErrors.email = "Invalid email address";

    if((!formData.branch.trim()))
      newErrors.branch = "Branch is required";

    if (!formData.courseInterested)
      newErrors.courseInterested = "please select course";
    if (!formData.leadOwner)
      newErrors.leadOwner = "please select lead owner";
    if(!formData.enquiryDate)
      newErrors.enquiryDate = "Enquiry Date is required";
    if(!formData.leadSource)
      newErrors.leadSource = "Lead Source is required";
    if(!formData.leadStatus)
      newErrors.leadStatus = "Lead Status is required";
    if(["Active", "Inactive", "Converted"].includes)
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name ==="leadStatus" ? { leadRemark : "" }:{})
    }));
    // setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try{
    const payload = {
      ...formData,
      enquiryDate: formData.enquiryDate 
      ? formData.enquiryDate.toISOString().split('T')[0]
      : null,
      callDate: formData.callDate
      ? formData.callDate.toISOString().split('T')[0]
      : null,
      nextFollowUp: formData.nextFollowUp
      ? formData.nextFollowUp.toISOString().split('T')[0]
      : null
    };

     axios.post('http://localhost:8081/riya_institute/addLead', payload,
      {header : {'Content-Type': 'application/json'}}
     );
     alert("Lead saved successfully!");
     navigate("/Leadlist");
    }
    catch(error){
      console.error("Error saving lead:", error);
      alert("Failed to save lead. Please try again.");
    }
  };

 useEffect(() => {
  if (!leadId) return;

  const fetchLead = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/riya_institute/lead/${leadId}`
      );

      const lead = res.data;

      setFormData({
        ...lead,
        enquiryDate: lead.enquiryDate ? new Date(lead.enquiryDate) : null,
        callDate: lead.callDate ? new Date(lead.callDate) : null,
        nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp) : null
      });

    } catch (err) {
      console.error("Failed to load lead:", err);
    }
  };

  fetchLead();
}, [leadId]);

  const handleUpdate = async() => {
    try{
      const payload = {
        ...formData,
        enquiryDate: formData.enquiryDate 
        ? formData.enquiryDate.toISOString().split('T')[0]
        : null,
        callDate: formData.callDate
        ? formData.callDate.toISOString().split('T')[0]
        : null,
        nextFollowUp: formData.nextFollowUp
        ? formData.nextFollowUp.toISOString().split('T')[0]
        : null
      };
      await axios.put(`http://localhost:8081/riya_institute/updateLead/${formData.id}`, payload,);
      alert("Lead updated Successfully");
      navigate("/Leadlist");
      console.log("Edit Lead:", leadId);
    }
    catch(error){
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    }
  };

  return (
    <div className="container-fluid mt-4 mb-5">
      <div className=" ">

         <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">{leadId ? "Edit Lead" : "Add New Lead"}</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/Leadlist")}
        >
          View All Leads
        </button>
      </div>
       

        <form onSubmit={handleSubmit} className="lead-form-container shadow-lg p-4 rounded-4">

   

  <div className="row g-4">

    {/* First Name */}
    <div className="col-md-3">
      <label className="form-label  ">First Name</label>
      <input type="text" className="form-control modern-input" name="enquiryFName" onChange={handleChange} value={formData.enquiryFName} />
    </div>

    {/* Last Name */}
    <div className="col-md-3">
      <label className="form-label  ">Last Name</label>
      <input type="text" className="form-control modern-input" name="enquiryLName" onChange={handleChange} value={formData.enquiryLName} />
    </div>

    {/* Contact Number */}
    <div className="col-md-3">
      <label className="form-label  ">Contact Number</label>
      <input type="text" className="form-control modern-input" name="contactNumber" onChange={handleChange} value={formData.contactNumber} />
    </div>

    {/* Email */}
    <div className="col-md-3">
      <label className="form-label  ">Email Id</label>
      <input type="email" className="form-control modern-input" name="email" onChange={handleChange} value={formData.email} />
    </div>

    {/* Branch */}
    <div className="col-md-3">
      <label className="form-label  ">Branch</label>
      <select className="form-select modern-input" name="branch" onChange={handleChange} value={formData.branch}>
        <option value="">Select</option>
        <option>Nerul</option>
        <option>Thane</option>
        <option>Pune</option>
      </select>
    </div>

    {/* Lead Location */}
    <div className="col-md-3">
      <label className="form-label  ">Lead Location</label>
      <input type="text" className="form-control modern-input" name="leadLocation" onChange={handleChange} value={formData.leadLocation} />
    </div>

    {/* Course Interested */}
    <div className="col-md-3">
      <label className="form-label  ">Course Interested</label>
     
       <select className="form-select modern-input" name="courseInterested" onChange={handleChange}  value={formData.courseInterested}>
        <option value="">Select</option>
        <option>Course 1</option>
        <option>Course 2</option>
        <option>Course 3</option>
      </select>
    </div>

    {/* Lead Owner */}
    <div className="col-md-3">
      <label className="form-label  ">Lead Owner</label>
      <select className="form-select modern-input" name="leadOwner" onChange={handleChange} value={formData.leadOwner}>
        <option value="">Select</option>
        <option>Tejaswi Sawant</option>
        <option>Vaibhav Mhatre</option>
        <option>Other Owner</option>
      </select>
    </div>

    {/* Enquiry Date */}
    <div className="col-md-3">
      <label className="form-label  ">Enquiry Date</label>
      {/* <input type="date" className="form-control modern-input" name="enquiryDate" onChange={handleChange} /> */}
      <DatePicker 
      showIcon
      selected={formData.enquiryDate}
      onChange={(date) => setFormData({...formData, enquiryDate:date})}
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
            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
              <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
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
    dateFormat="dd-MM-yyyy" />

    </div>

    {/* Lead Source */}
    <div className="col-md-3">
      <label className="form-label  ">Lead Source</label>
      <select className="form-select modern-input" name="leadSource" onChange={handleChange} value={formData.leadSource}>
        <option value="">Select</option>
        <option>Meta</option>
        <option>Google Ads</option>
        <option>Website</option>
        <option>Walk-in</option>
      </select>
    </div>

    {/* Call Date */}
    <div className="col-md-3">
      <label className="form-label  ">Call Date</label>
     
       <DatePicker 
       showIcon
      selected={formData.callDate}
      onChange={(date) => setFormData({...formData, callDate:date})}
      className="form-control modern-datepicker"
       placeholderText="Select Date"
    dateFormat="dd-MM-yyyy"
    icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 48 48"
        >
          <mask id="ipSApplication0">
            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
              <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
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
      } />
    </div>

    {/* Next Follow Up */}
    <div className="col-md-3">
      <label className="form-label  ">Next Follow Up</label>
     
       <DatePicker showIcon
      selected={formData.nextFollowUp}
      onChange={(date) => setFormData({...formData, nextFollowUp:date})}
      className="form-control modern-datepicker"
       placeholderText="Select Date"
    dateFormat="dd-MM-yyyy"
    icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 48 48"
        >
          <mask id="ipSApplication0">
            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
              <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
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
      } />
    </div>

    {/* Lead Stage */}
    <div className="col-md-3">
      <label className="form-label  ">Lead Stage</label>
      <select className="form-select modern-input" name="leadStage" onChange={handleChange} value={formData.leadStage}>
        <option value="">Select</option>
        <option>1st Connect</option>
        <option>Follow Up</option>
        <option>Interested</option>
        <option>Closed</option>
      </select>
    </div>

    {/* Lead Status */}
    <div className="col-md-3">
      <label className="form-label  ">Lead Status</label>
      <select className="form-select modern-input" name="leadStatus" onChange={handleChange} value={formData.leadStatus}>
        <option value="">Select</option>
        <option>Active</option>
        <option>Inactive</option>
        <option>Converted</option>
       
      </select>
    </div>

      <div className="col-md-3">
      <label className="form-label  ">Lead Status Remark</label>
      <select className="form-select modern-input" name="leadRemark" onChange={handleChange} value={formData.leadRemark} 
        disabled={!["Active", "Inactive", "Converted"].includes(formData.leadStatus)} >
        <option value="">Select</option>
        {leadRemarksOptions[formData.leadStatus]?.map((remark, index) =>(
          <option key={index} value={remark}>
            {remark}
          </option>        ))}
      </select>
    </div>


    {/* Remarks */}
    <div className="col-md-3">
      <label className="form-label  ">General Remarks</label>
      <input type="text" className="form-control modern-input" name="remarks" onChange={handleChange} value={formData.remarks} />
    </div>

    {/* Owner Feedback */}
    <div className="col-md-12">
      <label className="form-label  ">Lead Owner Feedback</label>
      <input type="text" className="form-control modern-input" name="ownerFeedback" onChange={handleChange} value={formData.ownerFeedback} />
    </div>

  </div>

  <div className="text-center mt-4">
    <button className="btn modern-btn px-5 py-2" type="submit" disabled={!!leadId}>
      Save Lead
    </button>
    <button   type="button" className="btn modern-btn px-5 py-2" disabled={!leadId} onClick={handleUpdate}>
      Update Lead
    </button>
  </div>

</form>

      </div>
    </div>
  );
};

export default LeadForm;
