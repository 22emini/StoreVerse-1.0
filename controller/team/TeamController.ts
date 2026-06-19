import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../lib/mailer";

const parseId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

// POST /api/team/invite
export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { storeId, email, role, name } = req.body;

    const parsedStoreId = parseId(storeId);
    if (!parsedStoreId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if this email is already a member of this store
    const existing = await prisma.team.findFirst({
      where: { email, storeId: parsedStoreId },
    });

    if (existing) {
      return res.status(409).json({
        message: "This email has already been invited to this store",
      });
    }

    // Generate a secure invite token valid for 7 days
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const member = await prisma.team.create({
      data: {
        email,
        role: role ?? "Member",
        name: name ?? null,
        status: "invited",
        inviteToken,
        inviteExpiry,
        storeId: parsedStoreId,
      },
    });

    // Build invitation link (frontend will handle the accept page)
    const inviteLink = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/accept-invite?token=${inviteToken}`;

    await sendEmail(
      email,
      "You've been invited to join a store on StoreVerse",
      `Hi${name ? ` ${name}` : ""},\n\nYou have been invited to join a store as a ${role ?? "Member"}.\n\nClick the link below to accept your invitation (valid for 7 days):\n\n${inviteLink}\n\nIf you did not expect this invitation, you can safely ignore this email.`
    );

    return res.status(201).json({
      message: "Invitation sent successfully",
      data: member,
    });
  } catch (error) {
    console.error("inviteMember error:", error);
    return res.status(500).json({
      message: "Failed to send invitation",
      error,
    });
  }
};

// GET /api/team/accept?token=<inviteToken>
export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invite token is required" });
    }

    const member = await prisma.team.findUnique({
      where: { inviteToken: token },
    });

    if (!member) {
      return res.status(404).json({ message: "Invalid invitation link" });
    }

    if (member.status === "active") {
      return res.status(200).json({ message: "Invitation already accepted" });
    }

    if (member.inviteExpiry && new Date() > member.inviteExpiry) {
      return res.status(410).json({ message: "This invitation link has expired" });
    }

    await prisma.team.update({
      where: { id: member.id },
      data: {
        status: "active",
        inviteToken: null,
        inviteExpiry: null,
      },
    });

    return res.status(200).json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("acceptInvite error:", error);
    return res.status(500).json({ message: "Failed to accept invitation", error });
  }
};


export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const parsedStoreId = parseId(req.params.storeId);
    if (!parsedStoreId) {
      return res.status(400).json({ message: "Valid store ID is required" });
    }

    const members = await prisma.team.findMany({
      where: { storeId: parsedStoreId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ count: members.length, data: members });
  } catch (error) {
    console.error("getTeamMembers error:", error);
    return res.status(500).json({ message: "Failed to fetch team members", error });
  }
};


export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const parsedId = parseId(req.params.id);
    if (!parsedId) {
      return res.status(400).json({ message: "Valid member ID is required" });
    }

    await prisma.team.delete({ where: { id: parsedId } });

    return res.status(200).json({ message: "Team member removed successfully" });
  } catch (error) {
    console.error("removeTeamMember error:", error);
    return res.status(500).json({ message: "Failed to remove team member", error });
  }
};


