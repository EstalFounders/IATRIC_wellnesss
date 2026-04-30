import PostArticleComp from "../../src/components/superAdminComponent/PostArticle/PostArticleComp";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

const addDoctor = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <PostArticleComp />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default addDoctor;
