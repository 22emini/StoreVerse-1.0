import express from "express";
import { createCampaign, getCampaignsByStore , deleteMarketing} from "../controller/marketing/marketingController";



const router = express.Router();

router.post("/add", createCampaign);



router.get('/store/:storeId', getCampaignsByStore);
router.delete('/delete/:id', deleteMarketing);
export default router;
