import  express from 'express';
import { AddStore, getStore, getStoresByUser, updateStore } from '../controller/store/Store';
import { CreateRoleStaff, getStaff, deleteStaff , UpdateSatff } from '../controller/store/RoleAndStaff'
import { addRegionAndTax, getALLRegion} from '../controller/store/RegionAndTax'
import { Customize, getColor} from '../controller/store/customizeTheme'
const router = express.Router();
router.post('/add-store', AddStore);
router.get("/user-stores/:userId", getStoresByUser);
router.get("/getstore/:id", getStore);
router.put("/UpdateStore/:id", updateStore )
router.post( "/add-role", CreateRoleStaff )
router.get( "/get-staff/:storeId",  getStaff )
router.delete( "/delete-staff/:id", deleteStaff)
router.put("/update-staff/:id", UpdateSatff)
router.post("/add-tax", addRegionAndTax)
router.get("/get-country/:storeId", getALLRegion)
router.post("/customize",Customize)
router.get("/get-color/:storeId",getColor)


export default router;