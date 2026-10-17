import { Request, Response } from "express";

export function handlePatientIntake(req: Request, res: Response) {
  // Sensitive provincial health card collected
  const { healthCardNumber, patientName } = req.body;

  res.status(200).json({
    recorded: true,
    patient: patientName,
    hasCard: Boolean(healthCardNumber),
  });
}
