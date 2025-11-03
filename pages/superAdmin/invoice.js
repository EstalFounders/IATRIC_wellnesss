import InvoiceComp from "../../src/components/superAdminComponent/invoice/invoice";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

export default function Invoice() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <InvoiceComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
