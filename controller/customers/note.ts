import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const addNote = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId);
    const { note } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    if (!note) {
      return res.status(400).json({ message: "Note is required" });
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatedNotes = customer.notes ? customer.notes +  "\n"  + note : note;

    const updatedCustomer = await prisma.customer.update({
      where: { customerId },
      data: { notes: updatedNotes },
    });

    return res.status(200).json({
      message: "Note added successfully",
      notes: updatedCustomer.notes,
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    res.status(500).json({
      message: "An erro has Occurred",
      error,
    });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId);

    if (!customerId) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({
      message: "Notes fetched successfully",
      notes: customer.notes,
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    res.status(500).json({
      message: "An erro has Occurred",
      error,
    });
  }
};
