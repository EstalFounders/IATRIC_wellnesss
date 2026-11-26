import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import FeedbackPanel from "../../src/components/superAdminComponent/Feedback/FeedbackPanel";

export default function FeedbackPage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <FeedbackPanel />
      </Layouts>
    </AuthenticatedComponent>
  );
}
