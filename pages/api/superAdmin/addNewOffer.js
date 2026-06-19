import { dbConnect } from '../../../src/lib/db';
import NewOffer from '../../../src/models/newOfferSchema';
import { logErrorToGoogleSheet } from '../helper';


export default async function handler(req, res){
    await dbConnect();
    if (req.method === 'GET') {
        try {
            const offer = await NewOffer.find();
            res.status(200).json(offer);
        } catch (error) {
            console.log(error, 'errror')
            await logErrorToGoogleSheet({
              apiName: "addNewOffer - GET",
              errorMessage: error.message || "Failed to fetch offers",
              errorCode: "500",
              stackTrace: error.stack,
            });
            res.status(500).json({ error: 'Failed to fetch offers' });
        }
    } else if (req.method === 'POST') {
        try {
            const newOffer = new NewOffer(req.body);
            await newOffer.save();
            res.status(201).json(newOffer);
        } catch (error) {
            console.log(error, 'error')
            await logErrorToGoogleSheet({
              apiName: "addNewOffer - POST",
              errorMessage: error.message || "Failed to create offer",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: req.body,
            });
            res.status(500).json({ error: 'Failed to create offer' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedNewOffer = await NewOffer.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedNewOffer);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "addNewOffer - PUT",
              errorMessage: error.message || "Failed to update offer",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id, ...req.body },
            });
            res.status(500).json({ error: 'Failed to update offer' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await NewOffer.findByIdAndDelete(id);
            res.status(200).json({ message: 'Lab deleted successfully' });
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "addNewOffer - DELETE",
              errorMessage: error.message || "Failed to delete offer",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id },
            });
            res.status(500).json({ error: 'Failed to delete offer' });
        }
    } else {
        res.status(405).end();
    }
};