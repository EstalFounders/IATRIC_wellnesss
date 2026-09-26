// /api/marketing/seo - SEO configuration CRUD for the marketing panel
// (collection: marketingPanel). Session required.
//   GET             list every entry
//   POST            create, or update the entry that already owns the pageIdentifier
//   PUT             update one entry by _id (also used for the publish toggle)
//   DELETE ?id=...  delete one entry by _id
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import { requireMarketingAuth } from "../../../../src/api/marketing/helpers/requireMarketingAuth";
import {
  createSeoEntry,
  deleteSeoEntryById,
  findSeoEntryByIdentifier,
  listSeoEntries,
  updateSeoEntryById,
} from "../../../../src/api/marketing/helpers/seoQueries";
import {
  identifierToPath,
  sanitizeSeoPayload,
} from "../../../../src/api/marketing/utils/seoPayload";

/**
 * Ask Next to rebuild the affected page so the new tags land in its HTML.
 * Only works in a production build on a host with ISR support - in dev the call
 * throws and is safely ignored.
 */
const revalidatePage = async (res, pageIdentifier) => {
  const path = identifierToPath(pageIdentifier);

  if (!path) return;

  try {
    await res.revalidate(path);
  } catch (error) {
    console.log(`[marketing] revalidate skipped for ${path}: ${error.message}`);
  }
};

export default requireMarketingAuth(async (req, res) => {
  if (!allowMethods(req, res, ["GET", "POST", "PUT", "DELETE"])) return;

  await dbConnect();

  const author = req.marketingSession?.username || "marketing";

  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, entries: await listSeoEntries() });
    }

    if (req.method === "POST") {
      const { values, errors } = sanitizeSeoPayload(req.body);

      if (errors.length) {
        return res.status(400).json({ ok: false, message: errors.join(" ") });
      }

      // One entry per page: saving an existing pageIdentifier updates that entry.
      const existing = await findSeoEntryByIdentifier(values.pageIdentifier);

      if (existing) {
        const entry = await updateSeoEntryById(existing._id, {
          ...values,
          updatedBy: author,
        });
        await revalidatePage(res, values.pageIdentifier);
        return res.status(200).json({ ok: true, updated: true, entry });
      }

      const entry = await createSeoEntry({ ...values, updatedBy: author });
      await revalidatePage(res, values.pageIdentifier);
      return res.status(201).json({ ok: true, updated: false, entry });
    }

    if (req.method === "PUT") {
      const { _id } = req.body || {};

      if (!_id) {
        return res.status(400).json({ ok: false, message: "Missing entry id." });
      }

      const updates = { updatedBy: author };

      if (typeof req.body.isActive === "boolean") {
        updates.isActive = req.body.isActive;
      }

      const hasFormFields =
        req.body.pageIdentifier !== undefined || req.body.pageTitle !== undefined;

      if (hasFormFields) {
        const { values, errors } = sanitizeSeoPayload(req.body);

        if (errors.length) {
          return res.status(400).json({ ok: false, message: errors.join(" ") });
        }

        // Guard the unique pageIdentifier when a page is reassigned to another entry.
        const clash = await findSeoEntryByIdentifier(values.pageIdentifier);

        if (clash && String(clash._id) !== String(_id)) {
          return res.status(400).json({
            ok: false,
            message: `"${values.pageIdentifier}" already has an entry — edit that entry instead.`,
          });
        }

        Object.assign(updates, values);
      }

      const entry = await updateSeoEntryById(_id, updates);

      if (!entry) {
        return res.status(404).json({ ok: false, message: "Entry not found." });
      }

      await revalidatePage(res, entry.pageIdentifier);

      return res.status(200).json({ ok: true, entry });
    }

    // DELETE
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, message: "Missing entry id." });
    }

    const deleted = await deleteSeoEntryById(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Entry not found." });
    }

    await revalidatePage(res, deleted.pageIdentifier);

    return res.status(200).json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("marketing/seo error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "SEO request failed.",
    });
  }
});
