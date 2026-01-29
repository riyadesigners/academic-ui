const router = require("express").Router();
const lead = require("../controllers/lead.controller");

router.post("/addLead", lead.addLead);
router.get("/leads", lead.getLeads);
router.get("/ActiveLead", lead.getActiveLead);
router.get("/lead/:id", lead.getLeadById);
router.put("/updateLead/:id", lead.updateLead);

module.exports = router;