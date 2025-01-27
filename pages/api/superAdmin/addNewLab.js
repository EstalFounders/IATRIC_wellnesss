import { dbConnect } from '../../../src/lib/db';
import NewLabSchema from '../../../src/models/newLabSchema';


export default async function handler(req, res){
    await dbConnect();
    if (req.method === 'GET') {
        try {
            const lab = await NewLabSchema.find();
            res.status(200).json(lab);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch Labs' });
        }
    } else if (req.method === 'POST') {
        try {
            const newLab = new NewLabSchema(req.body);
            await newLab.save();
            res.status(201).json(newLab);
        } catch (error) {
            console.log(error, 'error')
            res.status(500).json({ error: 'Failed to create Lab' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedNewLab = await NewLabSchema.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedNewLab);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update lab' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await NewLabSchema.findByIdAndDelete(id);
            res.status(200).json({ message: 'Lab deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete lab' });
        }
    } else {
        res.status(405).end();
    }
};
