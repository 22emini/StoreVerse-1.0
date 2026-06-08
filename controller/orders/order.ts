import  { Request , Response} from 'express';
import { prisma} from "../../lib/prisma"


const parseId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isNaN(id) ? null : id;
  };
  


  