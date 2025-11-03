import { dbConnect } from '../../../src/lib/db';
import ConsultationFee from '../../../src/models/consultationFeeSchema';
import ServiceOffered from '../../../src/models/serviceOffered';


export default async function handler(req, res){
    await dbConnect()

    if (req.method === 'GET') {
        try {
            const serviceOffered = await ServiceOffered.find();
            res.status(200).json(serviceOffered);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch serviceOffered' });
        }
    } else if (req.method === 'POST') {
        try {
            console.log(req.body, 'req body on server')
            const newService = new ServiceOffered(req.body);
            await newService.save();
            res.status(201).json(newService);
        } catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({ error: 'Failed to create service' });
        }

    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedService = await ServiceOffered.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update consultation' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await ServiceOffered.findByIdAndDelete(id);
            res.status(200).json({ message: 'Service deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete Service' });
        }
    } else {
        res.status(405).end();
    }
};
