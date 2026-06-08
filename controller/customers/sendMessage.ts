import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../lib/mailer";

export const sendMessageToCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);
    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.email) {
      return res.status(400).json({ message: "Customer has no email" });
    }

    await sendEmail(customer.email, subject, message);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
};