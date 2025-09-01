import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gatePassSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Gate pass API endpoint
  app.post("/api/gate-pass", async (req, res) => {
    try {
      // Validate request body
      const validationResult = gatePassSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: validationResult.error.errors 
        });
      }
      
      const gatePassData = req.body;
      
      // Store the gate pass data
      const savedGatePass = await storage.createGatePass(gatePassData);
      
      // Generate text file
      const textContent = generateGatePassTextContent(gatePassData);
      const fileName = `gatepass_${gatePassData.serialNumber}.txt`;
      const filePath = path.join(process.cwd(), "gate_passes", fileName);
      
      // Create directory if it doesn't exist
      const dir = path.join(process.cwd(), "gate_passes");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write to file
      fs.writeFileSync(filePath, textContent);
      
      res.status(201).json({ 
        message: "Gate pass created successfully", 
        id: savedGatePass.id,
        filePath
      });
    } catch (error) {
      console.error("Error creating gate pass:", error);
      res.status(500).json({ message: "Failed to create gate pass" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

/**
 * Generate the text content for the gate pass file
 */
function generateGatePassTextContent(gatePass: any): string {
  return `GATE PASS / LEAVE PERMIT
======================
Serial Number: ${gatePass.serialNumber}
Date: ${gatePass.date}

STUDENT DETAILS
--------------
Name: ${gatePass.name}
Room No: ${gatePass.roomNo}
Branch: ${gatePass.branch}
Year: ${gatePass.year}

PASS DETAILS
-----------
Pass Type: ${gatePass.passType}
From: ${gatePass.from}
To: ${gatePass.to}
Address during leave: ${gatePass.address}
Contact Number: ${gatePass.contactNumber}
Purpose: ${gatePass.purpose}

GUARDIAN INFORMATION
------------------
Local Guardian: ${gatePass.localGuardian || 'N/A'}
Local Guardian Address: ${gatePass.localGuardianAddress || 'N/A'}

Status: PENDING APPROVAL
Generated on: ${new Date().toLocaleString()}
`;
}
