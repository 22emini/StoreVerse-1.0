import { Router } from "express";
import {
  inviteMember,
  acceptInvite,
  getTeamMembers,
  removeTeamMember,
} from "../controller/team/TeamController";

const teamRoute = Router();

// Invite a new team member (sends email with secure link)
teamRoute.post("/invite", inviteMember);

// Accept an invite via token (called when member clicks the link)
teamRoute.get("/accept", acceptInvite);

// List all members of a store
teamRoute.get("/:storeId", getTeamMembers);

// Remove a team member
teamRoute.delete("/:id", removeTeamMember);

export default teamRoute;
