import ConsultationFeeComponent from "../../src/components/superAdminComponent/ConsultationFee";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";


const ConsultationFee = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ConsultationFeeComponent />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default ConsultationFee;
