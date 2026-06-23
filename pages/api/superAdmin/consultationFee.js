import { dbConnect } from '../../../src/lib/db';
import ConsultationFee from '../../../src/models/consultationFeeSchema';
import { logErrorToGoogleSheet } from '../helper';


export default async function handler(req, res){
    await dbConnect()

    if (req.method === 'GET') {
        try {
            const consultations = await ConsultationFee.find();
            res.status(200).json(consultations);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "consultationFee - GET",
              errorMessage: error.message || "Failed to fetch consultations",
              errorCode: "500",
              stackTrace: error.stack,
            });
            res.status(500).json({ error: 'Failed to fetch consultations' });
        }
    } else if (req.method === 'POST') {
        try {
            const newConsultation = new ConsultationFee(req.body);
            await newConsultation.save();
            res.status(201).json(newConsultation);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "consultationFee - POST",
              errorMessage: error.message || "Failed to create consultation",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: req.body,
            });
            res.status(500).json({ error: 'Failed to create consultation' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedConsultation = await ConsultationFee.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedConsultation);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "consultationFee - PUT",
              errorMessage: error.message || "Failed to update consultation",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id, ...req.body },
            });
            res.status(500).json({ error: 'Failed to update consultation' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await ConsultationFee.findByIdAndDelete(id);
            res.status(200).json({ message: 'Consultation deleted successfully' });
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "consultationFee - DELETE",
              errorMessage: error.message || "Failed to delete consultation",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id },
            });
            res.status(500).json({ error: 'Failed to delete consultation' });
        }
    } else {
        res.status(405).end();
    }
};