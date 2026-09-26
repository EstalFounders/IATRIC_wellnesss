// GET /api/marketing/modules - the marketing modules managed by this panel.
// Authenticated: proves the Phase 1 session guard end to end.
import { allowMethods } from "../../../src/api/marketing/helpers/apiHandler";
import { requireMarketingAuth } from "../../../src/api/marketing/helpers/requireMarketingAuth";

export const MARKETING_MODULES = [
  {
    id: "seo-keywords",
    title: "SEO Keywords",
    phase: 2,
    status: "live",
    summary: "Site-wide SEO metadata, focus keywords and target URLs.",
  },
  {
    id: "popup-banner",
    title: "Homepage Popup Banner",
    phase: 3,
    status: "live",
    summary: "Upload to Firebase Storage and toggle it, straight from the dashboard.",
  },
  {
    id: "blog-management",
    title: "Blog Management",
    phase: 4,
    status: "live",
    summary: "Create, publish and edit the posts shown by Demo5Blog1.",
  },
];

export default requireMarketingAuth(async (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  return res.status(200).json({
    ok: true,
    phase: 1,
    requestedBy: req.marketingSession?.username || null,
    modules: MARKETING_MODULES,
  });
});
