import { dbConnect } from '../../../src/lib/db';
import ConsultationFee from '../../../src/models/consultationFeeSchema';
import ServiceOffered from '../../../src/models/serviceOffered';
import { cacheDelFees } from '../../../src/lib/cache';
import { logErrorToGoogleSheet } from '../helper';

// Only these keys are written. The SuperAdmin form may also send `imageFile`
// (a client-only File); stripping it here means a stale client cannot store junk.
// `subHeading` is accepted as an alias of `subheading` and never stored twice.
const SERVICE_WRITABLE_FIELDS = [
  "name",
  "fee",
  "description",
  "hsn_percentage",
  "hsn_code",
  "share",
  "gst",
  "platformfee",
  "processingfee",
  "freight",
  "isActive",
  "categoryType",
  "image",
  "subheading",
  "subheadingHi",
  "descriptionHi",
];

const pickServiceBody = (body = {}) => {
  const payload = {};
  SERVICE_WRITABLE_FIELDS.forEach((key) => {
    if (body[key] !== undefined) payload[key] = body[key];
  });
  if (payload.subheading === undefined && body.subHeading !== undefined) {
    payload.subheading = body.subHeading;
  }
  if (typeof payload.image === "string") payload.image = payload.image.trim();
  if (typeof payload.subheading === "string") {
    payload.subheading = payload.subheading.trim();
  }
  return payload;
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { categoryType } = req.query;
      const filter = {};
      if (categoryType && ['MAJOR', 'SUB'].includes(categoryType)) {
        filter.categoryType = categoryType;
      }
      const serviceOffered = await ServiceOffered.find(filter);
      res.status(200).json(serviceOffered);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "serviceOffered - GET",
        errorMessage: error.message || "Failed to fetch service offered",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ error: 'Failed to fetch serviceOffered' });
    }
  } else if (req.method === 'POST') {
    try {
      const newService = new ServiceOffered(pickServiceBody(req.body));
      await newService.save();
      // Fees may have changed - invalidate cached consultation fees
      await cacheDelFees();
      res.status(201).json(newService);
    } catch (error) {
      console.error('Error creating service:', error);
      await logErrorToGoogleSheet({
        apiName: "serviceOffered - POST",
        errorMessage: error.message || "Failed to create service",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: req.body,
      });
      res.status(500).json({ error: 'Failed to create service' });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    try {
      const updatedService = await ServiceOffered.findByIdAndUpdate(
        id,
        pickServiceBody(req.body),
        { new: true, runValidators: true }
      );
      // Fees may have changed - invalidate cached consultation fees
      await cacheDelFees();
      res.status(200).json(updatedService);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "serviceOffered - PUT",
        errorMessage: error.message || "Failed to update service",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id, ...req.body },
      });
      res.status(500).json({ error: 'Failed to update consultation' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await ServiceOffered.findByIdAndDelete(id);
      // Fees may have changed - invalidate cached consultation fees
      await cacheDelFees();
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "serviceOffered - DELETE",
        errorMessage: error.message || "Failed to delete service",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id },
      });
      res.status(500).json({ error: 'Failed to delete Service' });
    }
  } else {
    res.status(405).end();
  }
}