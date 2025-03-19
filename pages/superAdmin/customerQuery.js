import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import CustomerQueryComp from "../../src/components/superAdminComponent/CustomerQueryComp";

const CustomerQuery = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <CustomerQueryComp />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default CustomerQuery;
