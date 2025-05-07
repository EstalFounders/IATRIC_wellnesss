import ConsultationFeeComponent from "../../src/components/superAdminComponent/ConsultationFee";
import ServiceOfferedComp from "../../src/components/superAdminComponent/ServiceOfferedComp";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";


const serviceOffered = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ServiceOfferedComp />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default serviceOffered;
