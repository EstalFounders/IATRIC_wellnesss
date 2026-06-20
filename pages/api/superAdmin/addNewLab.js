import { dbConnect } from '../../../src/lib/db';
import NewLabSchema from '../../../src/models/newLabSchema';
import { logErrorToGoogleSheet } from '../helper';


export default async function handler(req, res){
    await dbConnect();
    if (req.method === 'GET') {
        try {
            const lab = await NewLabSchema.find();
            res.status(200).json(lab);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "addNewLab - GET",
              errorMessage: error.message || "Failed to fetch labs",
              errorCode: "500",
              stackTrace: error.stack,
            });
            res.status(500).json({ error: 'Failed to fetch Labs' });
        }
    } else if (req.method === 'POST') {
        try {
            const newLab = new NewLabSchema(req.body);
            await newLab.save();
            res.status(201).json(newLab);
        } catch (error) {
            console.log(error, 'error')
            await logErrorToGoogleSheet({
              apiName: "addNewLab - POST",
              errorMessage: error.message || "Failed to create lab",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: req.body,
            });
            res.status(500).json({ error: 'Failed to create Lab' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedNewLab = await NewLabSchema.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedNewLab);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "addNewLab - PUT",
              errorMessage: error.message || "Failed to update lab",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id, ...req.body },
            });
            res.status(500).json({ error: 'Failed to update lab' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await NewLabSchema.findByIdAndDelete(id);
            res.status(200).json({ message: 'Lab deleted successfully' });
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "addNewLab - DELETE",
              errorMessage: error.message || "Failed to delete lab",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id },
            });
            res.status(500).json({ error: 'Failed to delete lab' });
        }
    } else {
        res.status(405).end();
    }
};