import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import LogDashboardComp from "../../src/components/superAdminComponent/LogDashboard/LogDashboardComp";

export default function LogsPage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <LogDashboardComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
