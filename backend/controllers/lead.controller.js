const pool = require("../config/db");
//add lead to db
exports.addLead = async (req, res) => {
    try {
    const data = req.body;

    if(!data.contactNumber || !data.enquiryFName){
      return  res.status(400).json({ error: 'Contact Number and First Name are required' });
    }
    const sqlleadinsert = `INSERT INTO leads  (enquiryFName, enquiryLName, contactNumber, email, branch, leadLocation, 
       courseInterested, leadOwner, enquiryDate, leadSource, callDate, nextFollowUp,
       leadStage, leadStatus, leadRemark, remarks, ownerFeedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.enquiryFName,
      data.enquiryLName,
      data.contactNumber,
      data.email,
      data.branch,
      data.leadLocation,
      data.courseInterested,
      data.leadOwner,
      data.enquiryDate,
      data.leadSource,
      data.callDate,
      data.nextFollowUp,
      data.leadStage,
      data.leadStatus,
      data.leadRemark,
      data.remarks,
      data.ownerFeedback
    ];
    const [result] = await pool.execute(sqlleadinsert, params);
    res.status(201).json({
      message: 'Lead added successfully',
      leadId: result.insertId,
    })
    // await.pool.execute(sqlleadinsert, params);
    
  }
  catch (err) {
    console.errord('Error adding lead:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
//get lead for lead list
exports.getLeads =  async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM leads'
    );

    const totalRecords = countRows[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const [rows] = await pool.query(`
      SELECT 
        id,
        enquiryFName,
        enquiryLName,
        contactNumber,
        email,
        branch,
        courseInterested,
        leadStage,
        leadOwner,
        leadStatus
      FROM leads
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

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
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};
//Get Active lead for dashboard
exports.getActiveLead = async (req, res) => {
    try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // count ONLY active leads
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM leads WHERE leadStatus = 'Active'`
    );

    const totalRecords = countRows[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // fetch ONLY active leads
    const [rows] = await pool.query(`
      SELECT 
        id,
        enquiryFName,
        enquiryLName,
        contactNumber,
        email,
        branch,
        courseInterested,
        leadStage,
        leadOwner,
        leadStatus
      FROM leads
      WHERE leadStatus = 'Active'
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

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
    console.error('Error fetching active leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};
//update respective lead
exports.updateLead = async (req, res) => {
   try{
    const leadId = req.params.id;
    const updatedData = req.body;
    const sqlUpdate = `
      UPDATE leads SET
        enquiryFName = ?,
        enquiryLName = ?,
        contactNumber = ?,
        email = ?,
        branch = ?,
        leadLocation = ?,
        courseInterested = ?,
        leadOwner = ?,
        enquiryDate = ?,
        leadSource = ?,
        callDate = ?,
        nextFollowUp = ?,
        leadStage = ?,
        leadStatus = ?,
        leadRemark = ?,
        remarks = ?,
        ownerFeedback = ?
      WHERE id = ?
    `;
    const params = [
     updatedData.enquiryFName || null,
    updatedData.enquiryLName || null,
    updatedData.contactNumber || null,
    updatedData.email || null,
    updatedData.branch || null,
    updatedData.leadLocation || null,
    updatedData.courseInterested || null,
    updatedData.leadOwner || null,
    updatedData.enquiryDate || null,
    updatedData.leadSource || null,
    updatedData.callDate || null,
    updatedData.nextFollowUp || null,
    updatedData.leadStage || null,
    updatedData.leadStatus || null,
    updatedData.leadRemark || null,
    updatedData.remarks || null,
    updatedData.ownerFeedback || null,
    leadId
    ];
    await pool.execute(sqlUpdate, params);
    res.json({ message: 'Lead updated successfully'});
  }
  catch(err){
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
}

// get single lead by id
exports.getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;

    const [rows] = await pool.execute(
      'SELECT * FROM leads WHERE id = ?',
      [leadId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch lead error:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};
