import { MetadataRoute } from 'next';
import { dbConnect } from '../src/lib/db';
import Doctor from '../src/models/doctorModel';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  const baseUrl = 'https://healthpath.co.in';

  return [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/all-doctors`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/appointment`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/faqs`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/about-us`, priority: 0.8, changeFrequency: 'monthly' as const },
    ...(await Doctor.find({ isActive: true }).select('_id')).map(d => ({
      url: `${baseUrl}/doctor-info?doctorId=${d._id}`,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
  ];
}
