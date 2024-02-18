import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/registerDocComponent/HomepageComp";


export default function Homepage() {
  
  return (
    <AuthenticatedComponent>
    <Layouts header={7} footer={7}>
     <HomepageComp />
    </Layouts>
     </AuthenticatedComponent>
  );
}
