import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const addTag = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId);
    const { tag } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    if (!tag) {
      return res.status(400).json({ message: "Tag is required" });
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatedTags = customer.tags ? customer.tags + "," + tag : tag;

    const updatedCustomer = await prisma.customer.update({
      where: { customerId },
      data: { tags: updatedTags },
    });

    return res.status(200).json({
      message: "Tag added successfully",
      tags: updatedCustomer.tags,
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    res.status(500).json({
      message: "An erro has Occurred",
      error,
    });
  }
};

export const getTags = async (req: Request, res: Response) => {
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
      message: "Tags fetched successfully",
      tags: customer.tags,
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    res.status(500).json({
      message: "An erro has Occurred",
      error,
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
      const customerId = Number(req.params.customerId);
      const { tag } = req.body;
  
      if (!customerId) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
  
      if (!tag) {
        return res.status(400).json({ message: "Tag is required" });
      }
  
      const customer = await prisma.customer.findUnique({
        where: { customerId },
      });
  
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      if (!customer.tags) {
        return res.status(404).json({ message: "No tags found" });
      }
  
      // split "vip,loyal,wholesale" into ["vip", "loyal", "wholesale"]
      const tagList = customer.tags.split(",");
  
      // remove the tag (case-sensitive match)
      const newTagList = tagList.filter((t) => t.trim() !== tag.trim());
  
      // join back: "loyal,wholesale"
      const updatedTags = newTagList.join(",");
  
      const updatedCustomer = await prisma.customer.update({
        where: { customerId },
        data: { tags: updatedTags || null },
      });
  
      return res.status(200).json({
        message: "Tag deleted successfully",
        tags: updatedCustomer.tags,
      });
    } catch (error) {
      console.error("An error has Occurred", error);
      res.status(500).json({
        message: "An erro has Occurred",
        error,
      });
    }
  };