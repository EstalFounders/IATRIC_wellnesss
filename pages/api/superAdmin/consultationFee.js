import { dbConnect } from '../../../src/lib/db';
import consultationFeeSchema from '../../../src/models/consultationFeeSchema';

const handler = async (req, res) => {
    await dbConnect()

    if (req.method === 'GET') {
        try {
            const consultations = await consultationFeeSchema.find();
            res.status(200).json(consultations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch consultations' });
        }
    } else if (req.method === 'POST') {
        try {
            const newConsultation = new consultationFeeSchema(req.body);
            await newConsultation.save();
            res.status(201).json(newConsultation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create consultation' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedConsultation = await consultationFeeSchema.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedConsultation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update consultation' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await consultationFeeSchema.findByIdAndDelete(id);
            res.status(200).json({ message: 'Consultation deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete consultation' });
        }
    } else {
        res.status(405).end();
    }
};

export default handler;