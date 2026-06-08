import express from 'express';
import { createCustomer, getCustomers, getCustomerById, editCustomer} from "../controller/customers/customer"
import { addNote, getNotes } from "../controller/customers/note";
import { addTag, getTags , deleteTag} from "../controller/customers/tag";
import { sendMessageToCustomer } from "../controller/customers/sendMessage";
import { createCustomerSegment, getCustomerSegments } from "../controller/customers/customerSegments";

const router = express.Router();
router.post('/add-customer', createCustomer)
router.get("/get-customers/:storeId", getCustomers)
router.get("/get-customer/:id", getCustomerById)
router.put("/update-customer/:id", editCustomer);
router.post("/add-note/:customerId", addNote);
router.get("/get-notes/:customerId", getNotes);
router.post("/add-tag/:customerId", addTag);
router.get("/get-tags/:customerId", getTags);
router.delete("/delete-tag/:customerId", deleteTag);
router.post("/send-message/:id", sendMessageToCustomer);
router.get("/get-segments/:storeId", getCustomerSegments);
router.post("/create-segment/:storeId", createCustomerSegment);
export default router;