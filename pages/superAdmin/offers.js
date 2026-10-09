import OffersComponent from "../../src/components/superAdminComponent/Offers";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";


const Offers = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <OffersComponent />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default Offers;
