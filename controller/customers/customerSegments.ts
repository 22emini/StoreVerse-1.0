import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

type Condition = { field: string; operator: string; value: string };

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

const parseConditions = (raw: string | null): Condition[] => {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const matchesAll = (customer: Record<string, unknown>, conditions: Condition[]) =>
  conditions.every(({ field, operator, value }) => {
    const actual = customer[field];
    const text = String(actual ?? "").toLowerCase();
    const target = value.toLowerCase();

    if (operator === "eq") return text === target;
    if (operator === "contains") return text.includes(target);
    if (operator === "gt") return Number(actual) > Number(value);
    if (operator === "lt") return Number(actual) < Number(value);
    if (operator === "gte") return Number(actual) >= Number(value);
    if (operator === "lte") return Number(actual) <= Number(value);
    return false;
  });

export const createCustomerSegment = async (req: Request, res: Response) => {
  try {
    const storeId = parseId(req.params.storeId);
    const { name, description, conditions } = req.body;

    if (!storeId || !name?.trim()) {
      return res.status(400).json({ message: "Valid storeId and name are required" });
    }
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ message: "At least one condition is required" });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const segment = await prisma.segment.create({
      data: {
        storeId,
        name: name.trim(),
        description: description?.trim() || null,
        conditions: JSON.stringify(conditions),
        type: "custom",
      },
    });

    return res.status(201).json({
      message: "Customer segment created successfully",
      segment: { ...segment, conditions },
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    return res.status(500).json({ message: "Failed to create customer segment", error });
  }
};

export const getCustomerSegments = async (req: Request, res: Response) => {
  try {
    const storeId = parseId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: "Invalid store ID" });

    const [segments, customers] = await Promise.all([
      prisma.segment.findMany({ where: { storeId }, orderBy: { updatedAt: "desc" } }),
      prisma.customer.findMany({ where: { storeId } }),
    ]);

    const formattedSegments = segments.map((segment) => {
      const conditions = parseConditions(segment.conditions);
      const customerCount = conditions.length
        ? customers.filter((c) => matchesAll(c, conditions)).length
        : 0;

      return { ...segment, conditions, customerCount };
    });

    return res.status(200).json({
      message: "Customer segments fetched successfully",
      count: formattedSegments.length,
      segments: formattedSegments,
    });
  } catch (error) {
    console.error("An error has Occurred", error);
    return res.status(500).json({ message: "Failed to fetch customer segments", error });
  }
};
